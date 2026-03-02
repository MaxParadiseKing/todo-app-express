import { Request, Response, NextFunction } from 'express';
import AppError from '../utils/AppError';
import { verifyToken } from '../models/auth.model';
import { getUserById } from '../models/auth.model';

declare global {
    namespace Express {
        interface Request {
            user?: {
                id: number;
                email: string;
            };
        }
    }
}

export const protect = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // 1. Получаем токен из заголовка
        const authHeader = req.headers.authorization;
        
        // 🔍 ОТЛАДКА
        console.log('========== AUTH DEBUG ==========');
        console.log('Auth header:', authHeader);
        
        if (!authHeader) {
            return next(new AppError('Not authorized, no token', 401));
        }
        
        if (!authHeader.startsWith('Bearer ')) {
            return next(new AppError('Not authorized, invalid token format', 401));
        }
        
        const token = authHeader.substring(7); // 'Bearer '.length = 7
        console.log('Token extracted:', token);
        
        // 2. Проверяем токен
        const decoded = verifyToken(token);
        console.log('Decoded token:', decoded);
        
        if (!decoded) {
            return next(new AppError('Not authorized, invalid token', 401));
        }
        
        // 3. Проверяем, что пользователь всё ещё существует
        const user = await getUserById(decoded.id);
        console.log('User from DB:', user);
        
        if (!user) {
            return next(new AppError('Not authorized, user not found', 401));
        }
        
        // 4. Добавляем пользователя в request
        req.user = { id: decoded.id, email: decoded.email };
        console.log('User attached to request:', req.user);
        console.log('===============================');
        
        next();
    } catch (error) {
        console.log('Error in protect:', error);
        next(error);
    }
};

// import { Request, Response, NextFunction } from 'express';
// import AppError from '../utils/AppError';
// import { verifyToken } from '../models/auth.model';
// import { getUserById } from '../models/auth.model';

// // Расширяем интерфейс Request, чтобы добавить user
// declare global {
//     namespace Express {
//         interface Request {
//             user?: {
//                 id: number;
//                 email: string;
//             };
//         }
//     }
// }

// export const protect = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//         // 1. Получаем токен из заголовка
//         const authHeader = req.headers.authorization;
        
//         // Проверяем, что заголовок существует
//         if (!authHeader) {
//             return next(new AppError('Not authorized, no token', 401));
//         }
        
//         // Проверяем, что начинается с Bearer
//         if (!authHeader.startsWith('Bearer ')) {
//             return next(new AppError('Not authorized, invalid token format', 401));
//         }
        
//         // Получаем токен (убираем 'Bearer ' из строки)
//         const token = authHeader.substring(7); // 'Bearer '.length = 7
        
//         if (!token) {
//             return next(new AppError('Not authorized, token missing', 401));
//         }
        
//         // 2. Проверяем токен
//         const decoded = verifyToken(token);
        
//         if (!decoded) {
//             return next(new AppError('Not authorized, invalid token', 401));
//         }
        
//         // 3. Проверяем, что пользователь всё ещё существует
//         const user = await getUserById(decoded.id);
        
//         if (!user) {
//             return next(new AppError('Not authorized, user not found', 401));
//         }
        
//         // 4. Добавляем пользователя в request для дальнейшего использования
//         req.user = { id: decoded.id, email: decoded.email };
        
//         next();
//     } catch (error) {
//         next(error);
//     }
// };