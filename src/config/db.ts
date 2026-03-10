import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

// Загружаем .env в зависимости от окружения
const envFile = process.env.NODE_ENV === 'test' ? '.env.test' : '.env';
dotenv.config({ path: path.resolve(process.cwd(), envFile) });

console.log('=== DB CONFIG ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('Current dir:', process.cwd());
console.log('Env file:', envFile);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_PASSWORD exists:', !!process.env.DB_PASSWORD);
console.log('================');

if (!process.env.DB_PASSWORD) {
    throw new Error('DB_PASSWORD is not set in environment variables!');
}

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'todo_app',
    password: process.env.DB_PASSWORD,  // Берем из .env
    port: parseInt(process.env.DB_PORT || '5432'),
});

export default pool;