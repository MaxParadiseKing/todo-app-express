import pool from '../config/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { CreateUserDTO, LoginDTO, AuthResponse, JwtPayload, UserResponse } from '../types/user.types';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

// Регистрация
export const registerUser = async (userData: CreateUserDTO): Promise<UserResponse> => {
    const { name, email, password, role = 'user' } = userData;
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const result = await pool.query(
        'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role, created_at',
        [name, email, hashedPassword, role]
    );
    return result.rows[0];
};

// Логин
export const loginUser = async (loginData: LoginDTO): Promise<AuthResponse | null> => {
    const { email, password } = loginData;
    
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];
    
    if (!user) return null;
    
    // Проверяем пароль
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return null;
    
    // Создаем JWT токен
    const token = jwt.sign(
        { id: user.id, email: user.email } as JwtPayload,
        JWT_SECRET,
        { expiresIn: '24h' }
    );
    
    // Не возвращаем пароль
    const { password: _, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, token };
};

// Проверка токена (для middleware)
export const verifyToken = (token: string): JwtPayload | null => {
    try {
        return jwt.verify(token, JWT_SECRET) as JwtPayload;
    } catch {
        return null;
    }
};

// Получить пользователя по ID
export const getUserById = async (id: number): Promise<UserResponse | null> => {
    const result = await pool.query(
        'SELECT id, name, email, created_at FROM users WHERE id = $1',
        [id]
    );
    return result.rows[0] || null;
};