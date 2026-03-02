import { Request, Response, NextFunction } from 'express';
import AppError from '../utils/AppError';
import * as UserModel from '../models/user.model';

// POST /api/users - создать пользователя
export const createUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, email } = req.body;
        
        if (!name || !email) {
            return next(new AppError('Name and email are required', 400));
        }
        
        const newUser = await UserModel.createUser(name, email);
        res.status(201).json(newUser);
    } catch (error) {
        next(error);
    }
};

// GET /api/users - всех пользователей
export const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const users = await UserModel.getAllUsers();
        res.json(users);
    } catch (error) {
        next(error);
    }
};

// GET /api/users/:id/tasks - пользователя с его задачами
export const getUserWithTasks = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const idParam = req.params.id as string;
        const id = parseInt(idParam);
        
        if (isNaN(id)) {
            return next(new AppError('ID must be a number', 400));
        }
        
        const userWithTasks = await UserModel.getUserWithTasks(id);
        
        if (!userWithTasks) {
            return next(new AppError('User not found', 404));
        }
        
        res.json(userWithTasks);
    } catch (error) {
        next(error);
    }
};

// GET /api/users/tasks/all - все задачи с пользователями
export const getAllTasksWithUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const tasks = await UserModel.getAllTasksWithUsers();
        res.json(tasks);
    } catch (error) {
        next(error);
    }
};