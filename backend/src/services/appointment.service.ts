import { AppDataSource } from '../config/database.config';
import { Appointment } from '../entities/Appointment.entity';
import { Patient } from '../entities/Patient.entity';
import { Doctor } from '../entities/Doctor.entity';
import { Hospital } from '../entities/Hospital.entity';
import { NotificationService } from './notification.service';
import { SocketService } from './socket.service';
import { GoogleCalendarService } from './google-calendar.service';
import { CreateAppointmentDto, AppointmentWithDetails, TimeSlot, AppointmentType } from '../types/appointment.types';
import { Between } from 'typeorm';

// If you use alertService you must import its type and inject/define it properly; here we add it as optional on the class.
export class AppointmentService {
  private appointmentRepository = AppDataSource.getRepository(Appointment);
  private patientRepository = AppDataSource.getRepository(Patient);
  private doctorRepository = AppDataSource.getRepository(Doctor);
  private hospitalRepository = AppDataSource.getRepository(Hospital);
  private notificationService: NotificationService;
  private socketService: SocketService;
  private calendarService: GoogleCalendarService;
  private alertService?: any; // Set correct type if available

  constructor(socketService: SocketService, notificationService: NotificationService, alertService?: any) {
    this.socketService = socketService;
    this.notificationService = notificationService;
    this.calendarService = new GoogleCalendarService();
    if (alertService) {
      this.alertService = alertService;
    }
  }

  /**
   * Get available time slots for a doctor on a given date
   */
  async getAvailableSlots(doctorId: number, date: Date): Promise<TimeSlot[]> {
    const doctor = await this.doctorRepository.findOne({ where: { id: doctorId } });
    if (!doctor) throw new Error('Doctor not found');

    // Get doctor's working hours (default 9 AM - 5 PM)
    const startHour = 9;
    const endHour = 17;
    const slotDuration = 30;

    const startOfDay = new Date(date);
    startOfDay.setHours(startHour, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(endHour, 0, 0, 0);

    const existingAppointments = await this.appointmentRepository.find({
      where: {
        doctorId,
        scheduledTime: Between(startOfDay, endOfDay),
        status: 'scheduled'
      }
    });

    const slots: TimeSlot[] = [];
    let currentSlot = new Date(startOfDay);

    while (currentSlot < endOfDay) {
      const slotEnd = new Date(currentSlot);
      slotEnd.setMinutes(slotEnd.getMinutes() + slotDuration);

      const isBooked = existingAppointments.some(apt => {
        const aptStart = new Date(apt.scheduledTime);
        const aptEnd = new Date(aptStart);
        aptEnd.setMinutes(aptEnd.getMinutes() + apt.duration);
        
        return (currentSlot >= aptStart && currentSlot < aptEnd) ||
               (slotEnd > aptStart && slotEnd <= aptEnd);
      });

      slots.push({
        startTime: new Date(currentSlot),
        endTime: new Date(slotEnd),
        available: !isBooked,
        doctorId
      });

      currentSlot = new Date(slotEnd);
    }

    return slots;
  }

  /**
   * Create a new appointment, validate entities, check for availability,
   * generate meeting link if online, trigger alerts, send notifications,
   * and emit real-time event.
   */
  async createAppointment(data: CreateAppointmentDto): Promise<AppointmentWithDetails> {
    // Validate patient exists
    const patient = await this.patientRepository.findOne({
      where: { id: data.patientId },
      relations: ['user']
    });
    if (!patient) throw new Error('Patient not found');

    // Validate doctor exists
    const doctor = await this.doctorRepository.findOne({
      where: { id: data.doctorId }
    });
    if (!doctor) throw new Error('Doctor not found');

    // Use provided hospitalId, doctor's hospitalId, or first available hospital
    let hospitalId = data.hospitalId || doctor.hospitalId;
    if (!hospitalId) {
      // TypeORM version in this repo doesn't support `findOne({ take })`
      const [firstHospital] = await this.hospitalRepository.find({
        order: { id: 'ASC' as any },
        take: 1,
      });
      if (!firstHospital) throw new Error('No hospital available for appointments');
      hospitalId = firstHospital.id;
    }

    const hospital = await this.hospitalRepository.findOne({
      where: { id: hospitalId }
    });
    if (!hospital) throw new Error('Hospital not found');

    // Check if slot is available
    const slots = await this.getAvailableSlots(data.doctorId, data.scheduledTime);
    const requestedSlot = slots.find(s =>
      s.startTime.getTime() === new Date(data.scheduledTime).getTime() && s.available
    );
    if (!requestedSlot) {
      throw new Error('Selected time slot is not available');
    }

    // Calculate end time
    const duration = data.duration || 30;
    const endTime = new Date(data.scheduledTime);
    endTime.setMinutes(endTime.getMinutes() + duration);

    // Generate Google Meet link for online appointments
    let meetLink: string | null = null;
    if (data.appointmentType === 'online') {
      const patientEmail = patient.user?.email;
      const doctorEmail = doctor.email;
      const meetResult = await this.calendarService.createMeetingEvent(
        patient.user?.name || 'Patient',
        doctor.name,
        data.scheduledTime,
        endTime,
        patientEmail,
        doctorEmail
      );
      if (meetResult.success) {
        meetLink = meetResult.meetLink;
      }
    }

    // Create appointment
    const appointment = this.appointmentRepository.create({
      patientId: data.patientId,
      doctorId: data.doctorId,
      hospitalId: hospitalId,
      appointmentType: data.appointmentType,
      scheduledTime: data.scheduledTime,
      endTime,
      duration,
      symptoms: data.symptoms || [],
      notes: data.notes,
      status: 'scheduled',
      meetingLink: meetLink,
    });

    await this.appointmentRepository.save(appointment);

    // Prepare response with details
    const appointmentWithDetails: AppointmentWithDetails = {
      id: appointment.id,
      patientId: appointment.patientId,
      doctorId: appointment.doctorId,
      hospitalId: appointment.hospitalId,
      appointmentType: appointment.appointmentType as AppointmentType,
      status: appointment.status as any,
      scheduledTime: appointment.scheduledTime,
      endTime: appointment.endTime,
      actualTime: appointment.actualTime,
      duration: appointment.duration,
      symptoms: appointment.symptoms || undefined,
      priority: appointment.priority || undefined,
      notes: appointment.notes || undefined,
      cancellationReason: appointment.cancellationReason || undefined,
      meetingLink: appointment.meetingLink,
      createdAt: appointment.createdAt,
      updatedAt: appointment.updatedAt,
      patientName: patient.user?.name || 'Patient',
      patientPhone: patient.user?.phone || '',
      patientEmail: patient.user?.email,
      doctorName: doctor.name,
      doctorSpecialty: doctor.specialty,
      doctorEmail: doctor.email,
      hospitalName: hospital.name,
      hospitalAddress: hospital.address || ''
    };

    // 🔔 TRIGGER ALERTS - NEW APPOINTMENT
    if (this.alertService && typeof this.alertService.sendAppointmentAlert === "function") {
      await this.alertService.sendAppointmentAlert(
        data.patientId,
        appointmentWithDetails.patientName,
        data.doctorId,
        doctor.name,
        doctor.specialty,
        data.scheduledTime
      );
      // Emergency alert condition (if emergency symptoms)
      if (data.symptoms && data.symptoms.length > 0) {
        const emergencyKeywords = ['chest pain', 'heart', 'stroke', 'bleeding', 'unconscious', 'severe'];
        const hasEmergency = data.symptoms.some(s =>
          emergencyKeywords.some(keyword => s.toLowerCase().includes(keyword))
        );
        if (hasEmergency && typeof this.alertService.sendEmergencyAlert === "function") {
          await this.alertService.sendEmergencyAlert(
            data.patientId,
            appointmentWithDetails.patientName,
            1, // Example code for emergency priority/level
            data.symptoms,
            doctor.specialty,
            data.scheduledTime
          );
        }
      }
    }

    // Send notifications
    if (typeof this.sendAppointmentNotifications === "function") {
      await this.sendAppointmentNotifications(appointmentWithDetails);
    }

    // Emit real-time event
    if (this.socketService && typeof this.socketService.broadcastPatientTransition === "function") {
      this.socketService.broadcastPatientTransition({
        patientId: data.patientId.toString(),
        patientName: appointmentWithDetails.patientName,
        fromStatus: 'scheduled',
        toStatus: 'appointment-booked',
        priority: data.symptoms?.length ? 3 : 5,
        timestamp: new Date()
      });
    }

    return appointmentWithDetails;
  }

  private async sendAppointmentNotifications(appointment: AppointmentWithDetails) {
    const appointmentTime = new Date(appointment.scheduledTime).toLocaleString('en-IN', {
      dateStyle: 'full',
      timeStyle: 'short'
    });

    let message = `Your appointment with Dr. ${appointment.doctorName} on ${appointmentTime} has been confirmed.`;

    if (appointment.meetingLink) {
      message += `\n\n📹 Video Consultation Link: ${appointment.meetingLink}`;
      message += `\n\nThis link will be active at the scheduled time.`;
    }

    await this.notificationService.sendNotification(
      appointment.patientId.toString(),
      'patient',
      'sms',
      'high',
      'Appointment Confirmed',
      message
    );

    await this.notificationService.sendNotification(
      appointment.patientId.toString(),
      'patient',
      'email',
      'high',
      `Appointment Confirmed with Dr. ${appointment.doctorName}`,
      message
    );

    await this.notificationService.sendNotification(
      appointment.doctorId.toString(),
      'doctor',
      'inapp',
      'medium',
      'New Appointment',
      `New appointment scheduled with ${appointment.patientName} on ${appointmentTime}`
    );
  }

  async getPatientAppointments(patientId: number): Promise<AppointmentWithDetails[]> {
    const appointments = await this.appointmentRepository.find({
      where: { patientId },
      relations: ['doctor', 'hospital'],
      order: { scheduledTime: 'DESC' }
    });

    const result = await Promise.all(appointments.map(async apt => {
      const patient = await this.patientRepository.findOne({
        where: { id: patientId },
        relations: ['user']
      });

      return {
        id: apt.id,
        patientId: apt.patientId,
        doctorId: apt.doctorId,
        hospitalId: apt.hospitalId,
        appointmentType: apt.appointmentType as AppointmentType,
        status: apt.status as any,
        scheduledTime: apt.scheduledTime,
        endTime: apt.endTime,
        actualTime: apt.actualTime,
        duration: apt.duration,
        symptoms: apt.symptoms || undefined,
        priority: apt.priority || undefined,
        notes: apt.notes || undefined,
        cancellationReason: apt.cancellationReason || undefined,
        meetingLink: apt.meetingLink,
        createdAt: apt.createdAt,
        updatedAt: apt.updatedAt,
        patientName: patient?.user?.name || 'Patient',
        patientPhone: patient?.user?.phone || '',
        patientEmail: patient?.user?.email,
        doctorName: apt.doctor?.name || '',
        doctorSpecialty: apt.doctor?.specialty || '',
        doctorEmail: apt.doctor?.email || '',
        hospitalName: apt.hospital?.name || '',
        hospitalAddress: apt.hospital?.address || ''
      };
    }));

    return result;
  }

  async getDoctorAppointments(doctorId: number, date?: Date): Promise<AppointmentWithDetails[]> {
    const whereClause: any = { doctorId };

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      whereClause.scheduledTime = Between(startOfDay, endOfDay);
    }

    const appointments = await this.appointmentRepository.find({
      where: whereClause,
      relations: ['patient', 'patient.user', 'hospital'],
      order: { scheduledTime: 'ASC' }
    });

    return appointments.map(apt => ({
      id: apt.id,
      patientId: apt.patientId,
      doctorId: apt.doctorId,
      hospitalId: apt.hospitalId,
      appointmentType: apt.appointmentType as AppointmentType,
      status: apt.status as any,
      scheduledTime: apt.scheduledTime,
      endTime: apt.endTime,
      actualTime: apt.actualTime,
      duration: apt.duration,
      symptoms: apt.symptoms || undefined,
      priority: apt.priority || undefined,
      notes: apt.notes || undefined,
      cancellationReason: apt.cancellationReason || undefined,
      meetingLink: apt.meetingLink,
      createdAt: apt.createdAt,
      updatedAt: apt.updatedAt,
      patientName: apt.patient?.user?.name || 'Patient',
      patientPhone: apt.patient?.user?.phone || '',
      patientEmail: apt.patient?.user?.email,
      doctorName: apt.doctor?.name || '',
      doctorSpecialty: apt.doctor?.specialty || '',
      doctorEmail: apt.doctor?.email || '',
      hospitalName: apt.hospital?.name || '',
      hospitalAddress: apt.hospital?.address || ''
    }));
  }

  async updateAppointmentStatus(id: number, status: string, reason?: string): Promise<Appointment> {
    const appointment = await this.appointmentRepository.findOne({
      where: { id },
      relations: ['patient', 'patient.user', 'doctor']
    });

    if (!appointment) throw new Error('Appointment not found');

    appointment.status = status;
    if (reason) appointment.cancellationReason = reason;
    if (status === 'completed') appointment.actualTime = new Date();

    await this.appointmentRepository.save(appointment);

    const message = status === 'cancelled'
      ? `Your appointment has been cancelled${reason ? ': ' + reason : ''}`
      : `Your appointment status has been updated to ${status}`;

    await this.notificationService.sendNotification(
      appointment.patientId.toString(),
      'patient',
      'sms',
      'medium',
      `Appointment ${status}`,
      message
    );

    this.socketService.broadcastPatientTransition({
      patientId: appointment.patientId.toString(),
      patientName: appointment.patient?.user?.name || 'Patient',
      fromStatus: 'appointment-booked',
      toStatus: `appointment-${status}`,
      timestamp: new Date()
    });

    return appointment;
  }

  async getUpcomingAppointments(): Promise<AppointmentWithDetails[]> {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const appointments = await this.appointmentRepository.find({
      where: {
        scheduledTime: Between(now, tomorrow),
        status: 'scheduled'
      },
      relations: ['patient', 'patient.user', 'doctor', 'hospital'],
      order: { scheduledTime: 'ASC' }
    });

    return appointments.map(apt => ({
      id: apt.id,
      patientId: apt.patientId,
      doctorId: apt.doctorId,
      hospitalId: apt.hospitalId,
      appointmentType: apt.appointmentType as AppointmentType,
      status: apt.status as any,
      scheduledTime: apt.scheduledTime,
      endTime: apt.endTime,
      actualTime: apt.actualTime,
      duration: apt.duration,
      symptoms: apt.symptoms || undefined,
      priority: apt.priority || undefined,
      notes: apt.notes || undefined,
      cancellationReason: apt.cancellationReason || undefined,
      meetingLink: apt.meetingLink,
      createdAt: apt.createdAt,
      updatedAt: apt.updatedAt,
      patientName: apt.patient?.user?.name || 'Patient',
      patientPhone: apt.patient?.user?.phone || '',
      patientEmail: apt.patient?.user?.email,
      doctorName: apt.doctor?.name || '',
      doctorSpecialty: apt.doctor?.specialty || '',
      doctorEmail: apt.doctor?.email || '',
      hospitalName: apt.hospital?.name || '',
      hospitalAddress: apt.hospital?.address || ''
    }));
  }

  async getRefreshToken() {
    const authUrl = this.calendarService.getAuthUrl();
    console.log('Visit this URL to authorize:', authUrl);
    console.log('After authorization, you\'ll get a code. Use it to get refresh token.');
    return { authUrl };
  }

  async generateMeetingLink(id: number): Promise<string> {
    const appointment = await this.appointmentRepository.findOne({
      where: { id },
      relations: ['patient', 'patient.user', 'doctor']
    });

    if (!appointment) throw new Error('Appointment not found');

    if (appointment.appointmentType !== 'online') {
      throw new Error('Meeting links are only available for online appointments');
    }

    if (appointment.meetingLink) {
      return appointment.meetingLink;
    }

    const endTime = new Date(appointment.scheduledTime);
    endTime.setMinutes(endTime.getMinutes() + (appointment.duration || 30));

    const patientEmail = appointment.patient?.user?.email;
    const doctorEmail = appointment.doctor?.email;

    const meetResult = await this.calendarService.createMeetingEvent(
      appointment.patient?.user?.name || 'Patient',
      appointment.doctor?.name || 'Doctor',
      appointment.scheduledTime,
      endTime,
      patientEmail,
      doctorEmail
    );

    if (!meetResult.success) {
      throw new Error(meetResult.error || 'Failed to create meeting link');
    }

    appointment.meetingLink = meetResult.meetLink;
    await this.appointmentRepository.save(appointment);

    await this.notificationService.sendNotification(
      appointment.patientId.toString(),
      'patient',
      'sms',
      'high',
      'Meeting Link Generated',
      `Your video consultation link: ${meetResult.meetLink}`
    );

    return meetResult.meetLink;
  }
}