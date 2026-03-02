import { Router } from 'express';
import { protect } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import * as adminController from '../controllers/adminController';

const router = Router();

// Все маршруты требуют авторизации и роли admin
router.use(protect);
router.use(requireRole(['admin']));

// Управление пользователями
router.get('/users', adminController.getAllUsers);
router.get('/users/:id', adminController.getUserById);  // НОВЫЙ маршрут
router.post('/users', adminController.createUser);      // НОВЫЙ маршрут
router.put('/users/:id', adminController.updateUser);   // НОВЫЙ маршрут
router.delete('/users/:id', adminController.deleteUser); // уже есть

// Специальные действия
router.patch('/users/:id/make-admin', adminController.makeAdmin);
router.patch('/users/:id/remove-admin', adminController.removeAdmin); // опционально

// Статистика
router.get('/stats', adminController.getStats);

export default router;