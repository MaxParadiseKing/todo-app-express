import { Pool } from 'pg';

console.log('=== DB CONFIG ===');
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASSWORD exists:', !!process.env.DB_PASSWORD);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('================');

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'todo_app',
    password: 'Psql7777',  // ← пароль из переменных окружения
    port: parseInt(process.env.DB_PORT || '5432'),
});

export default pool;