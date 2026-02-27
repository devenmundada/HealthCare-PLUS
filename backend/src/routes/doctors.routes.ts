import { Router } from 'express';
import { DoctorsController } from '../controllers/doctors.controller';

const router = Router();
const controller = new DoctorsController();

// Specialties route - MUST come before /:id
router.get('/specialties', controller.getAllSpecialties.bind(controller));

// Get available doctors
router.get('/available', controller.getAvailableDoctors.bind(controller));

// Get all doctors
router.get('/', controller.getAllDoctors.bind(controller));

// Get doctor by ID - this should be LAST
router.get('/:id', controller.getDoctorById.bind(controller));

export default router;
