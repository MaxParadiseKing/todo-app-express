import pool from '../config/db';
// Убираем импорт server отсюда

beforeAll(async () => {
    console.log('Testing database connection...');
    try {
        const result = await pool.query('SELECT 1+1 as test');
        console.log('Database connection OK:', result.rows[0]);
    } catch (error) {
        console.error('Database connection FAILED:', error);
    }
});

afterAll(async () => {
    // НЕ закрываем pool здесь - он закроется в каждом тесте
    // await pool.end();
});

// Пока уберем очистку таблиц для диагностики
// beforeEach(async () => {
//     await pool.query('DELETE FROM tasks');
//     await pool.query('DELETE FROM users');
// });