import { z } from 'zod';

// Схема для создания задачи
export const createTaskSchema = z.object({
    title: z.string()
        .min(1, 'Title is required')
        .max(100, 'Title must be less than 100 characters'),
    completed: z.boolean()
        .optional()
        .default(false)
});

// Схема для обновления задачи
export const updateTaskSchema = z.object({
    title: z.string()
        .min(1, 'Title is required')
        .max(100, 'Title must be less than 100 characters')
        .optional(),
    completed: z.boolean()
        .optional()
});

// Типы для TypeScript
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;