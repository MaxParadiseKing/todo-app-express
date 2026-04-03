import pool from '../config/db';
import { Task, CreateTaskDTO, UpdateTaskDTO } from '../types/task.types';



export const searchTasks = async (searchTerm: string): Promise<Task[]> => {
    const result = await pool.query(
        'SELECT * FROM tasks WHERE title ILIKE $1 ORDER BY created_at DESC',
        [`%${searchTerm}%`]
    )
    return result.rows;
}

export const searchUserTasks = async (userId: number, searchTerm: string): Promise<Task[]> => {
    const result = await pool.query(
        `SELECT * FROM tasks 
         WHERE user_id = $1 AND title ILIKE $2 
         ORDER BY created_at DESC`,
        [userId, `%${searchTerm}%`]
    );
    return result.rows;
};

// Поиск задач с пагинацией
export const searchTasksPaginated = async (searchTerm: string, limit: number, offset: number): Promise<Task[]> => {
    const result = await pool.query(
        `SELECT * FROM tasks 
         WHERE title ILIKE $1 
         ORDER BY created_at DESC 
         LIMIT $2 OFFSET $3`,
        [`%${searchTerm}%`, limit, offset]
    );
    return result.rows;
};

// Подсчет количества задач по поиску
export const searchTasksCount = async (searchTerm: string): Promise<number> => {
    const result = await pool.query(
        'SELECT COUNT(*) FROM tasks WHERE title ILIKE $1',
        [`%${searchTerm}%`]
    );
    return parseInt(result.rows[0].count);
};


// ===== ПОИСК СВОИХ ЗАДАЧ С ПАГИНАЦИЕЙ =====

// Поиск своих задач с пагинацией
export const searchUserTasksPaginated = async (
    userId: number, 
    searchTerm: string, 
    limit: number, 
    offset: number
): Promise<Task[]> => {
    const result = await pool.query(
        `SELECT * FROM tasks 
         WHERE user_id = $1 AND title ILIKE $2 
         ORDER BY created_at DESC 
         LIMIT $3 OFFSET $4`,
        [userId, `%${searchTerm}%`, limit, offset]
    );
    return result.rows;
};

// Подсчет количества своих задач по поиску
export const searchUserTasksCount = async (userId: number, searchTerm: string): Promise<number> => {
    const result = await pool.query(
        'SELECT COUNT(*) FROM tasks WHERE user_id = $1 AND title ILIKE $2',
        [userId, `%${searchTerm}%`]
    );
    return parseInt(result.rows[0].count);
};
// ===== МЕТОДЫ С ПАГИНАЦИЕЙ =====

// Получить задачи пользователя с пагинацией
export const getUserTasksPaginated = async (
    userId: number, 
    limit: number, 
    offset: number
): Promise<Task[]> => {
    const result = await pool.query(
        `SELECT * FROM tasks 
         WHERE user_id = $1 
         ORDER BY created_at DESC 
         LIMIT $2 OFFSET $3`,
        [userId, limit, offset]
    );
    return result.rows;
};

// Получить общее количество задач пользователя
export const getUserTasksCount = async (userId: number): Promise<number> => {
    const result = await pool.query(
        'SELECT COUNT(*) FROM tasks WHERE user_id = $1',
        [userId]
    );
    return parseInt(result.rows[0].count);
};

// Для публичных задач (если нужны)
export const getAllTasksPaginated = async (
    limit: number, 
    offset: number
): Promise<Task[]> => {
    const result = await pool.query(
        `SELECT * FROM tasks 
         ORDER BY created_at DESC 
         LIMIT $1 OFFSET $2`,
        [limit, offset]
    );
    return result.rows;
};

export const getAllTasksCount = async (): Promise<number> => {
    const result = await pool.query('SELECT COUNT(*) FROM tasks');
    return parseInt(result.rows[0].count);
};

// Получить все задачи пользователя
export const getUserTasks = async (userId: number): Promise<Task[]> => {
    const result = await pool.query(
        'SELECT * FROM tasks WHERE user_id = $1 ORDER BY created_at DESC',
        [userId]
    );
    return result.rows;
};

// Получить задачу пользователя по ID
export const getUserTaskById = async (taskId: number, userId: number): Promise<Task | null> => {
    const result = await pool.query(
        'SELECT * FROM tasks WHERE id = $1 AND user_id = $2',
        [taskId, userId]
    );
    return result.rows[0] || null;
};

// Создать задачу для пользователя
export const createUserTask = async (userId: number, taskData: CreateTaskDTO): Promise<Task> => {
    const { title, completed } = taskData;
    const result = await pool.query(
        'INSERT INTO tasks (title, completed, user_id) VALUES ($1, $2, $3) RETURNING *',
        [title, completed || false, userId]
    );
    return result.rows[0];
};

// Обновить задачу пользователя
export const updateUserTask = async (
    taskId: number, 
    userId: number, 
    taskData: UpdateTaskDTO
): Promise<Task | null> => {
    const { title, completed } = taskData;
    
    // Сначала проверяем, принадлежит ли задача пользователю
    const task = await getUserTaskById(taskId, userId);
    if (!task) return null;
    
    // Обновляем
    const result = await pool.query(
        `UPDATE tasks 
         SET title = COALESCE($1, title), 
             completed = COALESCE($2, completed) 
         WHERE id = $3 AND user_id = $4 
         RETURNING *`,
        [title, completed, taskId, userId]
    );
    return result.rows[0] || null;
};

// Удалить задачу пользователя
export const deleteUserTask = async (taskId: number, userId: number): Promise<boolean> => {
    const result = await pool.query(
        'DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING id',
        [taskId, userId]
    );
    return (result.rowCount ?? 0) > 0;
};

// (оставляем старые функции для админа/общего доступа)
export const getAllTasks = async (): Promise<Task[]> => {
    const result = await pool.query('SELECT * FROM tasks ORDER BY id');
    return result.rows;
};

export const getTaskById = async (id: number): Promise<Task | null> => {
    const result = await pool.query('SELECT * FROM tasks WHERE id = $1', [id]);
    return result.rows[0] || null;
};

// В models/task.model.ts добавь (если ещё нет):

// Получить невыполненные задачи (всех пользователей)
export const getIncompleteTasks = async (): Promise<Task[]> => {
    const result = await pool.query('SELECT * FROM tasks WHERE completed = false ORDER BY id');
    return result.rows;
};

// Получить задачи, отсортированные по дате
export const getTasksSortedByDate = async (): Promise<Task[]> => {
    const result = await pool.query('SELECT * FROM tasks ORDER BY created_at DESC');
    return result.rows;
};

// Для конкретного пользователя (если нужно)
export const getUserIncompleteTasks = async (userId: number): Promise<Task[]> => {
    const result = await pool.query(
        'SELECT * FROM tasks WHERE user_id = $1 AND completed = false ORDER BY id',
        [userId]
    );
    return result.rows;
};

export const getUserTasksSortedByDate = async (userId: number): Promise<Task[]> => {
    const result = await pool.query(
        'SELECT * FROM tasks WHERE user_id = $1 ORDER BY created_at DESC',
        [userId]
    );
    return result.rows;
};

// ===== СТАРЫЕ ФУНКЦИИ (для публичного доступа, без user_id) =====

// Создать задачу (без привязки к пользователю)
export const createTask = async (title: string, completed: boolean = false): Promise<Task> => {
    const result = await pool.query(
        'INSERT INTO tasks (title, completed) VALUES ($1, $2) RETURNING *',
        [title, completed]
    );
    return result.rows[0];
};

// Обновить задачу (без проверки пользователя)
export const updateTask = async (id: number, title?: string, completed?: boolean): Promise<Task | null> => {
    const result = await pool.query(
        `UPDATE tasks 
         SET title = COALESCE($1, title), 
             completed = COALESCE($2, completed) 
         WHERE id = $3 
         RETURNING *`,
        [title, completed, id]
    );
    return result.rows[0] || null;
};

// Удалить задачу (без проверки пользователя)
export const deleteTask = async (id: number): Promise<boolean> => {
    const result = await pool.query(
        'DELETE FROM tasks WHERE id = $1 RETURNING id',
        [id]
    );
    return (result.rowCount ?? 0) > 0;
};