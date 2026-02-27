import nodemailer from 'nodemailer';
import { EmailNotification } from '../types/notification.types';

export class EmailService {
  private transporter: nodemailer.Transporter;
  private defaultFrom: string;

  constructor() {
    // Configure for development (use ethereal.email for testing)
    if (process.env.NODE_ENV === 'production') {
      // Production email settings (SendGrid, AWS SES, etc.)
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });
      this.defaultFrom = process.env.EMAIL_FROM || 'noreply@hospital.com';
    } else {
      // Development - use ethereal.email for testing
      this.transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: 'test@ethereal.email',
          pass: 'testpass'
        }
      });
      
      console.log('📧 Email service initialized in development mode');
      this.defaultFrom = 'test@hospital.com';
    }
  }

  async sendEmail(notification: EmailNotification): Promise<{ success: boolean; messageId?: string; previewUrl?: string }> {
    try {
      const mailOptions = {
        from: this.defaultFrom,
        to: notification.to,
        cc: notification.cc,
        bcc: notification.bcc,
        subject: notification.subject,
        html: notification.html,
        text: notification.text,
        attachments: notification.attachments
      };

      const info = await this.transporter.sendMail(mailOptions);
      
      console.log(`📧 Email sent: ${info.messageId}`);
      
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ Email sendingd:', error);
      return { success: false };
    }
  }

  async sendEmergencyAlert(to: string | string[], patientName: string, priority: number, eta?: number) {
    const subject = `🚨 EMERGENCY ALERT: Priority ${priority} Patient`;
    const html = `
      <h1 style="color: #d72638;">🚨 Emergency Alert</h1>
      <p><strong>Priority:</strong> P${priority}</p>
      <p><strong>Patient:</strong> ${patientName}</p>
      ${eta ? `<p><strong>ETA:</strong> ${eta} minutes</p>` : ''}
      <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
      <hr>
      <p>Please check the command center for details.</p>
    `;

    return this.sendEmail({
      to,
      subject,
      html
    });
  }

  async sendDischargeSummary(to: string, patientName: string, summary: any) {
    const subject = `Discharge Summary - ${patientName}`;
    const html = `
      <h1>Discharge Summary</h1>
      <p><strong>Patient:</strong> ${patientName}</p>
      <p><strong>Admitted:</strong> ${new Date(summary.admittedAt).toLocaleDateString()}</p>
      <p><strong>Discharged:</strong> ${new Date().toLocaleDateString()}</p>
      <p><strong>Diagnosis:</strong> ${summary.dischargeDiagnosis}</p>
      <h3>Medications:</h3>
      <ul>
        ${summary.medications ? summary.medications.map((m: any) => `<li>${m.name} - ${m.dosage} - ${m.duration}</li>`).join('') : ''}
      </ul>
      <h3>Follow-up:</h3>
      <p>${summary.followUpRequired ? `Yes - ${new Date(summary.followUpDate).toLocaleDateString()} with ${summary.followUpSpecialty}` : 'No'}</p>
      <hr>
      <p>${summary.dischargeInstructions || 'No specific instructions'}</p>
    `;

    return this.sendEmail({
      to,
      subject,
      html
    });
  }
}
