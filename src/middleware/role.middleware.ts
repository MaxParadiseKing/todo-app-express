import { Request, Response, NextFunction } from 'express';
import AppError from '../utils/AppError';

// Проверка на админа
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
        return next(new AppError('Not authorized', 401));
    }
    
    // Здесь нужно будет получать роль из БД
    // Пока заглушка
    next();
};

// Более продвинутая версия (с проверкой из БД)
import pool from '../config/db';

export const requireRole = (roles: ('admin' | 'user')[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.user) {
                return next(new AppError('Not authorized', 401));
            }
            
            // Получаем роль пользователя из БД
            const result = await pool.query(
                'SELECT role FROM users WHERE id = $1',
                [req.user.id]
            );
            
            const userRole = result.rows[0]?.role;
            
            if (!userRole || !roles.includes(userRole)) {
                return next(new AppError('Access denied. Insufficient rights.', 403));
            }
            
            next();
        } catch (error) {
            next(error);
        }
    };
};