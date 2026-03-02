import { Request, Response, NextFunction } from 'express';
import AppError from '../utils/AppError';
import * as AuthModel from '../models/auth.model';
import { CreateUserDTO, LoginDTO } from '../types/user.types';

// Регистрация (с Zod)
export const register = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Данные уже проверены middleware!
        const { name, email, password, role } = req.body;
        
        const newUser = await AuthModel.registerUser({ name, email, password, role });
        res.status(201).json(newUser);
    } catch (error: any) {
        // Обработка уникальности email (это от БД, не от Zod)
        if (error.code === '23505') {
            return next(new AppError('Email already exists', 400));
        }
        next(error);
    }
};

// Логин (тоже с Zod — нужно убрать ручные проверки!)
export const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body; // данные уже проверены Zod
        
        // Эти проверки БОЛЬШЕ НЕ НУЖНЫ — их сделает Zod в маршруте
        // if (!email || !password) {  // ← УДАЛИ
        //     return next(new AppError('Email and password are required', 400));
        // }
        
        const result = await AuthModel.loginUser({ email, password });
        
        if (!result) {
            return next(new AppError('Invalid email or password', 401));
        }
        
        res.json(result);
    } catch (error) {
        next(error);
    }
};

// Получить текущего пользователя (по токену)
export const getMe = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.user) {
            return next(new AppError('Not authorized', 401));
        }
        
        const user = await AuthModel.getUserById(req.user.id);
        res.json(user);
    } catch (error) {
        next(error);
    }
};