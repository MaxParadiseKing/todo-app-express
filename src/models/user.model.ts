import pool from '../config/db';

export interface User {
    id: number;
    name: string;
    email: string;
    created_at?: Date;
}

export interface TaskWithUser {
    id: number;
    title: string;
    completed: boolean;
    created_at: Date;
    user_id: number;
    user_name: string;
    user_email: string;
}

// Создать пользователя
export const createUser = async (name: string, email: string): Promise<User> => {
    const result = await pool.query(
        'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *',
        [name, email]
    );
    return result.rows[0];
};

// Получить всех пользователей
export const getAllUsers = async (): Promise<User[]> => {
    const result = await pool.query('SELECT * FROM users ORDER BY id');
    return result.rows;
};

// Получить пользователя с его задачами
export const getUserWithTasks = async (userId: number): Promise<any> => {
    const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    if (userResult.rows.length === 0) return null;
    
    const tasksResult = await pool.query(
        'SELECT * FROM tasks WHERE user_id = $1 ORDER BY created_at DESC',
        [userId]
    );
    
    return {
        ...userResult.rows[0],
        tasks: tasksResult.rows
    };
};

// Получить все задачи с информацией о пользователе
export const getAllTasksWithUsers = async (): Promise<TaskWithUser[]> => {
    const result = await pool.query(`
        SELECT 
            tasks.*,
            users.name as user_name,
            users.email as user_email
        FROM tasks
        JOIN users ON tasks.user_id = users.id
        ORDER BY tasks.created_at DESC
    `);
    return result.rows;
};