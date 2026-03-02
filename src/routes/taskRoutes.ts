import { Router } from 'express';
import * as taskController from '../controllers/taskController';
import { protect } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { createTaskSchema, updateTaskSchema } from '../validations/task.validation';

const router = Router();

// Защищённые маршруты (с валидацией)
/**
 * @swagger
 * /tasks/my:
 *   post:
 *     summary: Создать новую задачу
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Купить продукты"
 *               completed:
 *                 type: boolean
 *                 default: false
 *     responses:
 *       201:
 *         description: Задача создана
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 title:
 *                   type: string
 *                 completed:
 *                   type: boolean
 *                 user_id:
 *                   type: integer
 *                 created_at:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Ошибка валидации
 *       401:
 *         description: Не авторизован
 */
router.post('/my', protect, validate(createTaskSchema), taskController.createMyTask);

router.put('/my/:id', 
    protect, 
    validate(updateTaskSchema),  // ← добавить
    taskController.updateMyTask
);

// Публичные маршруты (тоже можно добавить валидацию)
router.post('/', 
    validate(createTaskSchema),  // ← и сюда
    taskController.createTask
);

router.put('/:id', 
    validate(updateTaskSchema),  // ← и сюда
    taskController.updateTask
);

// ===== Публичные маршруты (доступны всем) =====
router.get('/', taskController.getAllTasks);
router.get('/:id', taskController.getTaskById);
router.post('/', taskController.createTask);           // пока публично
router.put('/:id', taskController.updateTask);         // пока публично
router.delete('/:id', taskController.deleteTask);      // пока публично

// ===== Защищённые маршруты (только для авторизованных, только свои задачи) =====
router.get('/my', protect, taskController.getMyTasks);
router.get('/my/:id', protect, taskController.getMyTaskById);
router.post('/my', protect, taskController.createMyTask);
router.put('/my/:id', protect, taskController.updateMyTask);
router.delete('/my/:id', protect, taskController.deleteMyTask);

// Дополнительные фильтры (можно тоже защитить)
router.get('/incomplete', taskController.getIncompleteTasks);
router.get('/sorted-by-date', taskController.getTasksSortedByDate);

export default router;