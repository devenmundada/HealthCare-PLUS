import { Router } from 'express';
import { AppointmentController } from '../controllers/appointment.controller';
import { socketService } from '../websocket';
import { notificationService } from '../services';

const router = Router();
const controller = new AppointmentController(socketService, notificationService);

// Get available slots
router.get('/slots', controller.getAvailableSlots.bind(controller));

// Get patient ID for user (booking flow)
router.get('/patient-for-user/:userId', controller.getPatientForUser.bind(controller));

// Get default hospital (fallback when doctor has no hospitalId)
router.get('/default-hospital', controller.getDefaultHospital.bind(controller));

// Get upcoming appointments
router.get('/upcoming', controller.getUpcomingAppointments.bind(controller));

// Get appointments for patient
router.get('/patient/:patientId', controller.getPatientAppointments.bind(controller));

// Get appointments for doctor
router.get('/doctor/:doctorId', controller.getDoctorAppointments.bind(controller));

// Create new appointment
router.post('/', controller.createAppointment.bind(controller));

// Update appointment status
router.patch('/:id/status', controller.updateAppointmentStatus.bind(controller));

// Generate meeting link for online consultation
router.post('/:id/meeting', controller.generateMeetingLink.bind(controller));

export default router;
