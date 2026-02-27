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
import Queue from 'bull';

export class NotificationService {
  private emailService: EmailService;
  private smsService: SMSService;
  private socketService: SocketService;
  private notificationQueue: Queue.Queue;
  private notifications: Map<string, Notification>;

  constructor(socketService: SocketService) {
    this.emailService = new EmailService();
    this.smsService = new SMSService();
    this.socketService = socketService;
    this.notifications = new Map();

    // Initialize queue for async notifications
    this.notificationQueue = new Queue('notifications', {
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379')
      }
    });

    this.processQueue();
    console.log('🔔 Notification service initialized');
  }

  private processQueue() {
    this.notificationQueue.process(async (job) => {
      const { notification, channel } = job.data;
      
      switch (channel) {
        case 'email':
          return await this.emailService.sendEmail(notification);
        case 'sms':
          return await this.smsService.sendSMS(notification);
        case 'push':
          // Will implement push notifications
          console.log('Push notification:', notification);
          return { success: true };
        case 'inapp':
          this.socketService.sendNotificationToUser(notification.userId, notification);
          return { success: true };
      }
    });

    console.log('📨 Notification queue processor started');
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

    // Add to queue for processing
    await this.notificationQueue.add({
      notification,
      channel
    }, {
      priority: priority === 'emergency' ? 1 : 
                priority === 'high' ? 2 : 
                priority === 'medium' ? 3 : 4,
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000
      }
    });

    console.log(`📨 Notification ${notificationId} queued for ${userId} via ${channel}`);
    
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
