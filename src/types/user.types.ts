// Добавить role в интерфейс User
export interface User {
    id: number;
    name: string;
    email: string;
    password?: string;
    role: 'admin' | 'user';  // ← добавляем
    created_at?: Date;
}

// Для регистрации (роль по умолчанию 'user')
export type CreateUserDTO = {
    name: string;
    email: string;
    password: string;
    role?: 'admin' | 'user';  // опционально, по умолчанию user
};

// Для обновления пользователя
export type UpdateUserDTO = Partial<CreateUserDTO>;

// Для ответа (без пароля)
export type UserResponse = Omit<User, 'password'>;

// Для логина
export interface LoginDTO {
    email: string;
    password: string;
}

// Для JWT токена
export interface JwtPayload {
    id: number;
    email: string;
}

// Для ответа с токеном
export interface AuthResponse {
    user: UserResponse;
    token: string;
}