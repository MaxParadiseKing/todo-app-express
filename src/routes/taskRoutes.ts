import { Router } from 'express';
import * as taskController from '../controllers/taskController';
import { protect } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { createTaskSchema, updateTaskSchema } from '../validations/task.validation';

const router = Router();

/**
 * @swagger
 * /tasks/search:
 *   get:
 *     summary: Поиск задач по названию (публично)
 *     tags: [Tasks]
 *     parameters:
 *       - in: query
 *         name: search
 *         required: true
 *         schema:
 *           type: string
 *         description: Поисковый запрос (часть названия)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Номер страницы
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Количество задач на странице
 *     responses:
 *       200:
 *         description: Список задач, соответствующих поиску
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Task'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       400:
 *         description: Поисковый запрос не указан
 */
router.get('/search', taskController.searchTasks);

// ===== ПУБЛИЧНЫЕ МАРШРУТЫ (доступны всем) =====

// 1. СНАЧАЛА специфичные публичные маршруты (без параметров)
/**
 * @swagger
 * /tasks/incomplete:
 *   get:
 *     summary: Получить все невыполненные задачи (публично)
 *     tags: [Tasks]
 *     responses:
 *       200:
 *         description: Список невыполненных задач
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Task'
 */
router.get('/incomplete', taskController.getIncompleteTasks);

/**
 * @swagger
 * /tasks/sorted-by-date:
 *   get:
 *     summary: Получить задачи, отсортированные по дате создания (публично)
 *     tags: [Tasks]
 *     responses:
 *       200:
 *         description: Список задач
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Task'
 */
router.get('/sorted-by-date', taskController.getTasksSortedByDate);

// 2. ПОТОМ основные публичные маршруты
/**
 * @swagger
 * /tasks:
 *   get:
 *     summary: Получить все задачи (публично)
 *     tags: [Tasks]
 *     responses:
 *       200:
 *         description: Список всех задач
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Task'
 */
router.get('/', taskController.getAllTasks);

/**
 * @swagger
 * /tasks:
 *   post:
 *     summary: Создать новую задачу (публично)
 *     tags: [Tasks]
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
 *               $ref: '#/components/schemas/Task'
 *       400:
 *         description: Ошибка валидации
 */
router.post('/', validate(createTaskSchema), taskController.createTask);

// ===== ЗАЩИЩЁННЫЕ МАРШРУТЫ (только для авторизованных) =====

// 3. СНАЧАЛА специфичные защищённые маршруты (БЕЗ параметров)
/**
 * @swagger
 * /tasks/my:
 *   get:
 *     summary: Получить все задачи текущего пользователя
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Список задач пользователя
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Task'
 *       401:
 *         description: Не авторизован
 */
router.get('/my', protect, taskController.getMyTasks);

/**
 * @swagger
 * /tasks/my/search:
 *   get:
 *     summary: Поиск своих задач по названию
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         required: true
 *         schema:
 *           type: string
 *         description: Поисковый запрос (часть названия)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Номер страницы
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Количество задач на странице
 *     responses:
 *       200:
 *         description: Список своих задач, соответствующих поиску
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Task'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       401:
 *         description: Не авторизован
 *       400:
 *         description: Поисковый запрос не указан
 */
router.get('/my/search', protect, taskController.searchMyTasks);
/**
 * @swagger
 * /tasks/my:
 *   post:
 *     summary: Создать задачу для текущего пользователя
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
 *                 example: "Моя личная задача"
 *               completed:
 *                 type: boolean
 *                 default: false
 *     responses:
 *       201:
 *         description: Задача создана
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       401:
 *         description: Не авторизован
 */
router.post('/my', protect, validate(createTaskSchema), taskController.createMyTask);

// 4. ПОТОМ маршруты С ПАРАМЕТРАМИ (публичные)
/**
 * @swagger
 * /tasks/{id}:
 *   get:
 *     summary: Получить задачу по ID (публично)
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID задачи
 *     responses:
 *       200:
 *         description: Задача найдена
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       404:
 *         description: Задача не найдена
 */
router.get('/:id', taskController.getTaskById);

/**
 * @swagger
 * /tasks/{id}:
 *   put:
 *     summary: Обновить задачу (публично)
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Обновленное название"
 *               completed:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Задача обновлена
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       404:
 *         description: Задача не найдена
 */
router.put('/:id', validate(updateTaskSchema), taskController.updateTask);

/**
 * @swagger
 * /tasks/{id}:
 *   delete:
 *     summary: Удалить задачу (публично)
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Задача удалена
 *       404:
 *         description: Задача не найдена
 */
router.delete('/:id', taskController.deleteTask);

// 5. ПОТОМ защищённые маршруты С ПАРАМЕТРАМИ
/**
 * @swagger
 * /tasks/my/{id}:
 *   get:
 *     summary: Получить конкретную задачу текущего пользователя
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Задача найдена
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       404:
 *         description: Задача не найдена или не принадлежит пользователю
 */
router.get('/my/:id', protect, taskController.getMyTaskById);

/**
 * @swagger
 * /tasks/my/{id}:
 *   put:
 *     summary: Обновить свою задачу
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Обновленная личная задача"
 *               completed:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Задача обновлена
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       404:
 *         description: Задача не найдена
 */
router.put('/my/:id', protect, validate(updateTaskSchema), taskController.updateMyTask);

/**
 * @swagger
 * /tasks/my/{id}:
 *   delete:
 *     summary: Удалить свою задачу
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Задача удалена
 *       404:
 *         description: Задача не найдена
 */
router.delete('/my/:id', protect, taskController.deleteMyTask);

export default router;