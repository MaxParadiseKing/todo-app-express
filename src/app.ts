import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response, NextFunction } from 'express';
import taskRoutes from './routes/taskRoutes';
import userRoutes from './routes/userRoutes';
import authRoutes from './routes/authRoutes';
import adminRoutes from './routes/adminRoutes';
import swaggerUi from 'swagger-ui-express';
import { specs } from './config/swagger';
import { generalLimiter, authLimiter } from './middleware/rateLimit.middleware';

const app = express();

// Middleware
app.use(express.json());

// Применяем ко всем запросам
app.use('/api', generalLimiter)

// Особо строго для авторизации
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Подробная отладка
app.use((req: Request, res: Response, next: NextFunction) => {
    console.log('========== REQUEST DEBUG ==========');
    console.log('Метод:', req.method);
    console.log('URL:', req.url);
    console.log('Content-Type:', req.headers['content-type']);
    console.log('Body (до роутов):', req.body);
    console.log('====================================');
    next();
});

// Логирование времени
app.use((req: Request, res: Response, next: NextFunction) => {
    const time = new Date().toISOString();
    console.log(`[${time}] ${req.method} ${req.url}`);
    next();
});

// Подключаем роуты
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

// ... после middleware, до 404 обработчика
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// 404 обработчик
app.use((req: Request, res: Response, next: NextFunction) => {
    res.status(404).json({
        error: 'Route not found',
        message: `Path ${req.url} does not exist`
    });
});

// Централизованный обработчик ошибок
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('=== ERROR HANDLER ===');
    console.error(err);
    console.error('=====================');

    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
    
    res.status(err.statusCode).json({
        status: err.status,
        message: err.message
    });
});

const PORT = process.env.PORT || 3001;
export const server = app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});

export default app;

app.listen(3001, () => console.log('Server started on port 3001'));