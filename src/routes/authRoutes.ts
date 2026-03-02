import { Router } from 'express';
import * as authController from '../controllers/authController';
import { protect } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { registerSchema, loginSchema } from '../validations/auth.validation';

const router = Router();

router.post('/register', 
    validate(registerSchema), 
    authController.register
);

router.post('/login', 
    validate(loginSchema), 
    authController.login
);
router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', protect, authController.getMe);  // ← добавили protect

export default router;