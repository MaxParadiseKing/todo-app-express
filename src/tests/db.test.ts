import pool from '../config/db';

describe('Database connection', () => {
    it('should connect to test database', async () => {
        const result = await pool.query('SELECT current_database() as db');
        console.log('Connected to DB:', result.rows[0].db);
        expect(result.rows[0].db).toBe('todo_app_test');
    });
});