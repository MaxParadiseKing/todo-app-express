import { Request, Response, NextFunction } from 'express';
import AppError from '../utils/AppError';
import pool from '../config/db';
import * as TaskModel from '../models/task.model';

// // Получить всех пользователей (для админа)
// export const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//         const result = await pool.query(
//             'SELECT id, name, email, role, created_at FROM users ORDER BY id'
//         );
//         res.json(result.rows);
//     } catch (error) {
//         next(error);
//     }
// };

// // Получить статистику (сколько задач у каждого)
// export const getStats = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//         const result = await pool.query(`
//             SELECT 
//                 users.id,
//                 users.name,
//                 users.email,
//                 COUNT(tasks.id) as task_count,
//                 COUNT(CASE WHEN tasks.completed THEN 1 END) as completed_count
//             FROM users
//             LEFT JOIN tasks ON users.id = tasks.user_id
//             GROUP BY users.id
//             ORDER BY users.id
//         `);
//         res.json(result.rows);
//     } catch (error) {
//         next(error);
//     }
// };

// // Удалить любого пользователя (только админ)
// export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//        const idParam = req.params.id;
// if (!idParam || Array.isArray(idParam)) {
//     return next(new AppError('Invalid ID', 400));
// }
// const userId = parseInt(idParam);
// if (isNaN(userId)) {
//     return next(new AppError('ID must be a number', 400));
// }
        
//         // Нельзя удалить самого себя
//         if (userId === req.user?.id) {
//             return next(new AppError('Cannot delete yourself', 400));
//         }
        
//         const result = await pool.query(
//             'DELETE FROM users WHERE id = $1 RETURNING id',
//             [userId]
//         );
        
//         if (result.rowCount === 0) {
//             return next(new AppError('User not found', 404));
//         }
        
//         res.status(204).send();
//     } catch (error) {
//         next(error);
//     }
// };

// // Сделать пользователя админом
// export const makeAdmin = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//         const idParam = req.params.id;
// if (!idParam || Array.isArray(idParam)) {
//     return next(new AppError('Invalid ID', 400));
// }
// const userId = parseInt(idParam);
// if (isNaN(userId)) {
//     return next(new AppError('ID must be a number', 400));
// }
        
//         const result = await pool.query(
//             'UPDATE users SET role = $1 WHERE id = $2 RETURNING id, name, email, role',
//             ['admin', userId]
//         );
        
//         if (result.rows.length === 0) {
//             return next(new AppError('User not found', 404));
//         }
        
//         res.json(result.rows[0]);
//     } catch (error) {
//         next(error);
//     }
// };


// ========== СУЩЕСТВУЮЩИЕ МЕТОДЫ ==========

/**
 * @desc    Получить всех пользователей
 * @route   GET /api/admin/users
 * @access  Private/Admin
 */
export const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id, email, role, name } = req.query;
        let query = 'SELECT id, name, email, role, created_at FROM users';
        const values: any[] = [];
        const conditions: string[] = [];

        // Добавляем фильтрацию по параметрам
        if (id) {
            values.push(id);
            conditions.push(`id = $${values.length}`);
        }
        if (email) {
            values.push(email);
            conditions.push(`email = $${values.length}`);
        }
        if (role) {
            values.push(role);
            conditions.push(`role = $${values.length}`);
        }
        if (name) {
            values.push(`%${name}%`);
            conditions.push(`name ILIKE $${values.length}`);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        query += ' ORDER BY id';

        const result = await pool.query(query, values);
        res.json(result.rows);
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Получить статистику
 * @route   GET /api/admin/stats
 * @access  Private/Admin
 */
export const getStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await pool.query(`
            SELECT 
                users.id,
                users.name,
                users.email,
                COUNT(tasks.id) as task_count,
                COUNT(CASE WHEN tasks.completed THEN 1 END) as completed_count
            FROM users
            LEFT JOIN tasks ON users.id = tasks.user_id
            GROUP BY users.id
            ORDER BY users.id
        `);
        res.json(result.rows);
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Удалить пользователя
 * @route   DELETE /api/admin/users/:id
 * @access  Private/Admin
 */
export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const idParam = req.params.id;
        if (!idParam || Array.isArray(idParam)) {
            return next(new AppError('Invalid ID', 400));
        }
        const userId = parseInt(idParam);
        if (isNaN(userId)) {
            return next(new AppError('ID must be a number', 400));
        }

        // Нельзя удалить самого себя
        if (userId === req.user?.id) {
            return next(new AppError('Cannot delete yourself', 400));
        }

        const result = await pool.query(
            'DELETE FROM users WHERE id = $1 RETURNING id',
            [userId]
        );

        if (result.rowCount === 0) {
            return next(new AppError('User not found', 404));
        }

        res.status(204).send();
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Сделать пользователя админом
 * @route   PATCH /api/admin/users/:id/make-admin
 * @access  Private/Admin
 */
export const makeAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const idParam = req.params.id;
        if (!idParam || Array.isArray(idParam)) {
            return next(new AppError('Invalid ID', 400));
        }
        const userId = parseInt(idParam);
        if (isNaN(userId)) {
            return next(new AppError('ID must be a number', 400));
        }

        const result = await pool.query(
            'UPDATE users SET role = $1 WHERE id = $2 RETURNING id, name, email, role',
            ['admin', userId]
        );

        if (result.rows.length === 0) {
            return next(new AppError('User not found', 404));
        }

        res.json(result.rows[0]);
    } catch (error) {
        next(error);
    }
};

// ========== НОВЫЕ МЕТОДЫ ==========

/**
 * @desc    Получить пользователя по ID
 * @route   GET /api/admin/users/:id
 * @access  Private/Admin
 */
export const getUserById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const idParam = req.params.id;
        if (!idParam || Array.isArray(idParam)) {
            return next(new AppError('Invalid ID', 400));
        }
        const userId = parseInt(idParam);
        if (isNaN(userId)) {
            return next(new AppError('ID must be a number', 400));
        }

        const result = await pool.query(
            'SELECT id, name, email, role, created_at FROM users WHERE id = $1',
            [userId]
        );

        if (result.rows.length === 0) {
            return next(new AppError('User not found', 404));
        }

        res.json(result.rows[0]);
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Создать нового пользователя
 * @route   POST /api/admin/users
 * @access  Private/Admin
 */
export const createUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, email, password, role } = req.body;

        // Валидация
        if (!name || !email || !password) {
            return next(new AppError('Please provide name, email and password', 400));
        }

        // Проверка существования пользователя
        const existingUser = await pool.query(
            'SELECT id FROM users WHERE email = $1',
            [email]
        );

        if (existingUser.rows.length > 0) {
            return next(new AppError('User with this email already exists', 400));
        }

        // Создание пользователя
        // ПРИМЕЧАНИЕ: Пароль должен хешироваться! Добавьте bcrypt
        const result = await pool.query(
            `INSERT INTO users (name, email, password, role, created_at) 
             VALUES ($1, $2, $3, $4, NOW()) 
             RETURNING id, name, email, role, created_at`,
            [name, email, password, role || 'user']
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Обновить пользователя
 * @route   PUT /api/admin/users/:id
 * @access  Private/Admin
 */
export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const idParam = req.params.id;
        if (!idParam || Array.isArray(idParam)) {
            return next(new AppError('Invalid ID', 400));
        }
        const userId = parseInt(idParam);
        if (isNaN(userId)) {
            return next(new AppError('ID must be a number', 400));
        }

        const { name, email, role, password } = req.body;

        // Проверка существования пользователя
        const userExists = await pool.query(
            'SELECT id FROM users WHERE id = $1',
            [userId]
        );

        if (userExists.rows.length === 0) {
            return next(new AppError('User not found', 404));
        }

        // Если меняется email, проверяем что он не занят
        if (email) {
            const emailExists = await pool.query(
                'SELECT id FROM users WHERE email = $1 AND id != $2',
                [email, userId]
            );
            if (emailExists.rows.length > 0) {
                return next(new AppError('Email already in use', 400));
            }
        }

        // Динамическое построение запроса
        const updates: string[] = [];
        const values: any[] = [];
        let valueIndex = 1;

        if (name) {
            updates.push(`name = $${valueIndex++}`);
            values.push(name);
        }
        if (email) {
            updates.push(`email = $${valueIndex++}`);
            values.push(email);
        }
        if (role) {
            updates.push(`role = $${valueIndex++}`);
            values.push(role);
        }
        if (password) {
            // ПРИМЕЧАНИЕ: Пароль должен хешироваться!
            updates.push(`password = $${valueIndex++}`);
            values.push(password);
        }

        if (updates.length === 0) {
            return next(new AppError('No fields to update', 400));
        }

        values.push(userId);
        const query = `
            UPDATE users 
            SET ${updates.join(', ')} 
            WHERE id = $${valueIndex}
            RETURNING id, name, email, role, created_at
        `;

        const result = await pool.query(query, values);

        res.json(result.rows[0]);
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Снять права администратора
 * @route   PATCH /api/admin/users/:id/remove-admin
 * @access  Private/Admin
 */
export const removeAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const idParam = req.params.id;
        if (!idParam || Array.isArray(idParam)) {
            return next(new AppError('Invalid ID', 400));
        }
        const userId = parseInt(idParam);
        if (isNaN(userId)) {
            return next(new AppError('ID must be a number', 400));
        }

        // Нельзя снять админку с самого себя
        if (userId === req.user?.id) {
            return next(new AppError('Cannot remove admin role from yourself', 400));
        }

        const result = await pool.query(
            'UPDATE users SET role = $1 WHERE id = $2 AND role = $3 RETURNING id, name, email, role',
            ['user', userId, 'admin']
        );

        if (result.rows.length === 0) {
            return next(new AppError('User not found or is not an admin', 404));
        }

        res.json(result.rows[0]);
    } catch (error) {
        next(error);
    }
};