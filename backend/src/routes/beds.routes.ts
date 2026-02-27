import { Router } from 'express';
import { BedsController } from '../controllers/beds.controller';

const router = Router();
const controller = new BedsController();

// Get all beds (with optional filters)
router.get('/', controller.getAllBeds.bind(controller));

// Get bed statistics
router.get('/stats', controller.getBedStats.bind(controller));

// Get bed by ID
router.get('/:id', controller.getBedById.bind(controller));

export default router;