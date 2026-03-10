import pool from '../config/db';

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
    await pool.end();
});

