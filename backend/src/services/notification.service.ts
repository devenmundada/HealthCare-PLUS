import { EmailService } from './email.service';
import { SMSService } from './sms.service';
import { SocketService } from './socket.service';
import { 
  Notification, 
  NotificationChannel, 
  NotificationPriority,
  NOTIFICATION_TEMPLATES 
} from '../types/notification.types';
import { v4 as uuidv4 } from 'uuid';

export class NotificationService {
  private emailService: EmailService;
  private smsService: SMSService;
  private socketService: SocketService;
  private notifications: Map<string, Notification>;

  constructor(socketService: SocketService) {
    this.emailService = new EmailService();
    this.smsService = new SMSService();
    this.socketService = socketService;
    this.notifications = new Map();

    console.log('🔔 Notification service initialized');
  }

  // Dispatches a single notification. Runs directly (no Redis/queue dependency —
  // this app doesn't provision Redis, and a queue that can't reach it would hang
  // every caller indefinitely). Failures here must never block the caller
  // (e.g. appointment booking), so errors are logged and swallowed.
  private async dispatch(notification: Notification, channel: NotificationChannel) {
    try {
      switch (channel) {
        case 'email':
          return await this.emailService.sendEmail(notification as any);
        case 'sms':
          return await this.smsService.sendSMS(notification as any);
        case 'push':
          console.log('Push notification:', notification);
          return { success: true };
        case 'inapp':
          this.socketService.sendNotificationToUser(notification.userId, notification);
          return { success: true };
      }
    } catch (error) {
      console.warn(`⚠️ Notification ${notification.id} via ${channel} failed (non-fatal):`, error);
      return { success: false };
    }
  }

  async sendNotification(
    userId: string,
    userType: string,
    channel: NotificationChannel,
    priority: NotificationPriority,
    title: string,
    message: string,
    data?: Record<string, any>
  ): Promise<string> {
    const notificationId = uuidv4();
    
    const notification: Notification = {
      id: notificationId,
      userId,
      userType: userType as any,
      channel,
      priority,
      title,
      message,
      data,
      status: 'pending',
      createdAt: new Date()
    };

    this.notifications.set(notificationId, notification);

    // Fire-and-forget: don't let a slow/broken email or SMS provider block
    // whatever triggered this notification (e.g. booking an appointment).
    this.dispatch(notification, channel)
      .then((result) => {
        notification.status = result?.success ? 'sent' : 'failed';
      })
      .catch(() => {
        notification.status = 'failed';
      });

    console.log(`📨 Notification ${notificationId} dispatched for ${userId} via ${channel}`);

    return notificationId;
  }

  async sendEmergencyNotification(
    userId: string,
    userType: string,
    patientName: string,
    priority: number,
    eta?: number,
    bedNumber?: string,
    doctorName?: string
  ) {
    const template = NOTIFICATION_TEMPLATES.EMERGENCY_ADMIT;
    let message = '';
    let title = '';

    if (userType === 'doctor') {
      message = template.doctor.sms
        .replace('{priority}', priority.toString())
        .replace('{eta}', eta?.toString() || '?')
        .replace('{condition}', 'Critical')
        .replace('{bedNumber}', bedNumber || 'TBD');
      title = `🚨 Priority ${priority} Patient`;
    } else if (userType === 'patient') {
      message = template.patient.sms
        .replace('{ambulanceId}', 'AMB-001')
        .replace('{eta}', eta?.toString() || '?')
        .replace('{ward}', 'Emergency')
        .replace('{doctorName}', doctorName || 'the doctor');
      title = '🚨 Emergency Alert';
    } else {
      message = template.admin.sms
        .replace('{priority}', priority.toString())
        .replace('{bedNumber}', bedNumber || 'TBD')
        .replace('{staffCount}', '5');
      title = '⚠️ Emergency Override';
    }

    // Send via multiple channels for emergency
    const smsId = await this.sendNotification(
      userId, 
      userType, 
      'sms', 
      'emergency', 
      title, 
      message,
      { patientName, priority, eta, bedNumber }
    );

    const inAppId = await this.sendNotification(
      userId, 
      userType, 
      'inapp', 
      'emergency', 
      title, 
      message,
      { patientName, priority, eta, bedNumber }
    );

    return { smsId, inAppId };
  }

  async sendBedReadyNotification(
    userId: string,
    userType: string,
    patientName: string,
    bedNumber: string,
    ward: string,
    floor: number
  ) {
    const template = NOTIFICATION_TEMPLATES.BED_READY;
    let message = '';

    if (userType === 'patient') {
      message = template.patient.sms
        .replace('{ward}', ward)
        .replace('{bedNumber}', bedNumber)
        .replace('{floor}', floor.toString());
    } else {
      message = template.nurse.sms
        .replace('{patientName}', patientName)
        .replace('{bedNumber}', bedNumber)
        .replace('{equipment}', 'monitor, oxygen');
    }

    return this.sendNotification(
      userId,
      userType,
      'sms',
      'high',
      '✅ Bed Ready',
      message,
      { bedNumber, ward, floor }
    );
  }

  async getNotificationStatus(notificationId: string): Promise<Notification | null> {
    return this.notifications.get(notificationId) || null;
  }

  async getUserNotifications(userId: string, limit: number = 50): Promise<Notification[]> {
    const userNotifications = Array.from(this.notifications.values())
      .filter(n => n.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
    
    return userNotifications;
  }

  async markAsRead(notificationId: string): Promise<boolean> {
    const notification = this.notifications.get(notificationId);
    if (notification) {
      notification.status = 'read';
      notification.readAt = new Date();
      return true;
    }
    return false;
  }

  async markAllAsRead(userId: string): Promise<number> {
    let count = 0;
    this.notifications.forEach((notification) => {
      if (notification.userId === userId && notification.status !== 'read') {
        notification.status = 'read';
        notification.readAt = new Date();
        count++;
      }
    });
    return count;
  }
}
