import { Router } from 'express';
import { AIController } from '../controllers/ai.controller';

const router = Router();
const controller = new AIController();

router.get('/status', controller.getStatus.bind(controller));
router.post('/analyze', controller.analyzeSymptoms.bind(controller));

export default router;
