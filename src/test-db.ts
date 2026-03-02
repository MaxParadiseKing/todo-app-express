import pool from './config/db';

async function testConnection() {
    try {
        const result = await pool.query('SELECT NOW()');
        console.log('✅ Подключение к БД успешно!');
        console.log('Время на сервере:', result.rows[0].now);
    } catch (error) {
        console.error('❌ Ошибка подключения:', error);
    } finally {
        await pool.end();
    }
}

testConnection();