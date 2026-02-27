import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';

const router = Router();
const controller = new AuthController();

// Public routes
router.post('/signup', controller.signup.bind(controller));
router.post('/login', controller.login.bind(controller));
router.get('/me', controller.getCurrentUser.bind(controller));

export default router;
