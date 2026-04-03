import { Request, Response, NextFunction } from 'express';
import AppError from '../utils/AppError';
import * as TaskModel from '../models/task.model';

// ========== ПУБЛИЧНЫЕ (для всех) ==========

// GET /api/tasks — все задачи (для админа позже сделаем)
// export const getAllTasks = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//         const tasks = await TaskModel.getAllTasks();
//         res.json(tasks);
//     } catch (error) {
//         next(error);
//     }
// };

export const searchTasks = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const searchTerm = req.query.search as string;
        
        if (!searchTerm) {
            return next(new AppError('Search term is required', 400));
        }
        
        // Пагинация
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const offset = (page - 1) * limit;
        
        // Поиск с пагинацией
        const tasks = await TaskModel.searchTasksPaginated(searchTerm, limit, offset);
        const total = await TaskModel.searchTasksCount(searchTerm);
        
        res.json({
            data: tasks,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                hasNextPage: page < Math.ceil(total / limit),
                hasPrevPage: page > 1
            }
        });
    } catch (error) {
        next(error);
    }
};

export const searchMyTasks = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.user) {
            return next(new AppError('Not authorized', 401));
        }
        
        const searchTerm = req.query.search as string;
        
        if (!searchTerm) {
            return next(new AppError('Search term is required', 400));
        }
        
        // Пагинация
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const offset = (page - 1) * limit;
        
        // Поиск своих задач с пагинацией
        const tasks = await TaskModel.searchUserTasksPaginated(req.user.id, searchTerm, limit, offset);
        const total = await TaskModel.searchUserTasksCount(req.user.id, searchTerm);
        
        res.json({
            data: tasks,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                hasNextPage: page < Math.ceil(total / limit),
                hasPrevPage: page > 1
            }
        });
    } catch (error) {
        next(error);
    }
};
// GET /api/tasks — все задачи (с пагинацией)
export const getAllTasks = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const offset = (page - 1) * limit;
        
        const tasks = await TaskModel.getAllTasksPaginated(limit, offset);
        const total = await TaskModel.getAllTasksCount();
        
        res.json({
            data: tasks,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        next(error);
    }
};

// GET /api/tasks/:id — задача по ID (с проверкой параметра)
export const getTaskById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const idParam = req.params.id;
        
        // Проверяем, что параметр существует и это строка
        if (!idParam || Array.isArray(idParam)) {
            return next(new AppError('Invalid task ID', 400));
        }
        
        const id = parseInt(idParam);
        
        if (isNaN(id)) {
            return next(new AppError('ID must be a number', 400));
        }
        
        const task = await TaskModel.getTaskById(id);
        
        if (!task) {
            return next(new AppError('Task not found', 404));
        }
        
        res.json(task);
    } catch (error) {
        next(error);
    }
};

// ========== ЗАЩИЩЁННЫЕ (только свои задачи) ==========

// // GET /api/tasks/my — мои задачи
// export const getMyTasks = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//         if (!req.user) {
//             return next(new AppError('Not authorized', 401));
//         }
        
//         const tasks = await TaskModel.getUserTasks(req.user.id);
//         res.json(tasks);
//     } catch (error) {
//         next(error);
//     }
// };
// GET /api/tasks/my — мои задачи
// export const getMyTasks = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//         console.log('=== GET MY TASKS DEBUG ===');
//         console.log('req.user:', req.user);
        
//         if (!req.user) {
//             console.log('No user - returning 401');
//             return next(new AppError('Not authorized', 401));
//         }
        
//         console.log('Calling getUserTasks for user:', req.user.id);
//         const tasks = await TaskModel.getUserTasks(req.user.id);
//         console.log('getUserTasks result:', tasks);
//         console.log('Sending response with status 200');
        
//         res.json(tasks);
//     } catch (error) {
//         console.log('Error in getMyTasks:', error);
//         next(error);
//     }
// };

// GET /api/tasks/my — мои задачи (с пагинацией)
export const getMyTasks = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.user) {
            return next(new AppError('Not authorized', 401));
        }
        
        // Получаем параметры пагинации из query-строки
        // /api/tasks/my?page=2&limit=5
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        
        // page=1, limit=10 → offset=0 (первые 10)
        // page=2, limit=10 → offset=10 (следующие 10)
        const offset = (page - 1) * limit;
        
        // console.log(`📄 Пагинация: page=${page}, limit=${limit}, offset=${offset}`);
        
        // Получаем задачи для текущей страницы
        const tasks = await TaskModel.getUserTasksPaginated(req.user.id, limit, offset);
        
        // Получаем общее количество задач пользователя
        const total = await TaskModel.getUserTasksCount(req.user.id);
        
        // Отправляем ответ с мета-информацией
        res.json({
            data: tasks,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                hasNextPage: page < Math.ceil(total / limit),
                hasPrevPage: page > 1
            }
        });
    } catch (error) {
        next(error);
    }
};

// GET /api/tasks/my/:id — моя задача по ID
export const getMyTaskById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.user) {
            return next(new AppError('Not authorized', 401));
        }
        
        const idParam = req.params.id;
        
        if (!idParam || Array.isArray(idParam)) {
            return next(new AppError('Invalid task ID', 400));
        }
        
        const taskId = parseInt(idParam);
        
        if (isNaN(taskId)) {
            return next(new AppError('ID must be a number', 400));
        }
        
        const task = await TaskModel.getUserTaskById(taskId, req.user.id);
        
        if (!task) {
            return next(new AppError('Task not found', 404));
        }
        
        res.json(task);
    } catch (error) {
        next(error);
    }
};

// POST /api/tasks/my — создать мою задачу
export const createMyTask = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.user) {
            return next(new AppError('Not authorized', 401));
        }
        
        const { title, completed } = req.body;
        
        const newTask = await TaskModel.createUserTask(req.user.id, { title, completed });
        res.status(201).json(newTask);
    } catch (error) {
        next(error);
    }
};

// PUT /api/tasks/my/:id — обновить мою задачу
export const updateMyTask = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.user) {
            return next(new AppError('Not authorized', 401));
        }
        
        const idParam = req.params.id;
        
        if (!idParam || Array.isArray(idParam)) {
            return next(new AppError('Invalid task ID', 400));
        }
        
        const taskId = parseInt(idParam);
        
        if (isNaN(taskId)) {
            return next(new AppError('ID must be a number', 400));
        }
        
        const { title, completed } = req.body;
        
        const updatedTask = await TaskModel.updateUserTask(taskId, req.user.id, { title, completed });
        
        if (!updatedTask) {
            return next(new AppError('Task not found or not yours', 404));
        }
        
        res.json(updatedTask);
    } catch (error) {
        next(error);
    }
};

// DELETE /api/tasks/my/:id — удалить мою задачу
export const deleteMyTask = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.user) {
            return next(new AppError('Not authorized', 401));
        }
        
        const idParam = req.params.id;
        
        if (!idParam || Array.isArray(idParam)) {
            return next(new AppError('Invalid task ID', 400));
        }
        
        const taskId = parseInt(idParam);
        
        if (isNaN(taskId)) {
            return next(new AppError('ID must be a number', 400));
        }
        
        const deleted = await TaskModel.deleteUserTask(taskId, req.user.id);
        
        if (!deleted) {
            return next(new AppError('Task not found or not yours', 404));
        }
        
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};

// Публичные CRUD операции (старые)
export const createTask = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { title, completed } = req.body;
        
        if (!title) {
            return next(new AppError('Title is required', 400));
        }
        
        const newTask = await TaskModel.createTask(title, completed);
        res.status(201).json(newTask);
    } catch (error) {
        next(error);
    }
};

export const updateTask = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const idParam = req.params.id;
        
        if (!idParam || Array.isArray(idParam)) {
            return next(new AppError('Invalid task ID', 400));
        }
        
        const id = parseInt(idParam);
        
        if (isNaN(id)) {
            return next(new AppError('ID must be a number', 400));
        }
        
        const { title, completed } = req.body;
        
        const updatedTask = await TaskModel.updateTask(id, title, completed);
        
        if (!updatedTask) {
            return next(new AppError('Task not found', 404));
        }
        
        res.json(updatedTask);
    } catch (error) {
        next(error);
    }
};

export const deleteTask = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const idParam = req.params.id;
        
        if (!idParam || Array.isArray(idParam)) {
            return next(new AppError('Invalid task ID', 400));
        }
        
        const id = parseInt(idParam);
        
        if (isNaN(id)) {
            return next(new AppError('ID must be a number', 400));
        }
        
        const deleted = await TaskModel.deleteTask(id);
        
        if (!deleted) {
            return next(new AppError('Task not found', 404));
        }
        
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};

// Дополнительные фильтры
export const getIncompleteTasks = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const tasks = await TaskModel.getIncompleteTasks();
        res.json(tasks);
    } catch (error) {
        next(error);
    }
};

export const getTasksSortedByDate = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const tasks = await TaskModel.getTasksSortedByDate();
        res.json(tasks);
    } catch (error) {
        next(error);
    }
};