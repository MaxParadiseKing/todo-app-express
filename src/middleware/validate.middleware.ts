import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';
import AppError from '../utils/AppError';

export const validate = (schema: z.ZodObject<any, any>) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Проверяем, что тело запроса существует
            if (!req.body) {
                return next(new AppError('Request body is required', 400));
            }
            
            // Валидируем тело запроса
            const validatedData = await schema.parseAsync(req.body);
            
            // Заменяем req.body на проверенные данные
            req.body = validatedData;
            
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const issues = error.issues.map(issue => ({
                    field: issue.path.join('.') || 'body',
                    message: issue.message
                }));
                
                return next(new AppError(JSON.stringify(issues), 400));
            }
            next(error);
        }
    };
};