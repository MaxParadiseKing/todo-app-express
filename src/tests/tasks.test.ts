import request from 'supertest';
import app from '../app';
import pool from '../config/db';

describe('Tasks Endpoints', () => {
  let authToken: string;
  let userId: number;
  let taskId: number;

  // Уникальный email для этого запуска тестов
  const timestamp = Date.now();
  const testEmail = `tasks-${timestamp}@test.com`;

  jest.setTimeout(10000);

  // Создаем пользователя и получаем токен перед всеми тестами
  beforeAll(async () => {
    await pool.query(`DELETE FROM users WHERE email = '${testEmail}'`);
    
    const registerRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Task Tester',
        email: testEmail,
        password: '123456'
      });
    
    userId = registerRes.body.id;

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: testEmail,
        password: '123456'
      });
    
    authToken = loginRes.body.token;
    
    const testRes = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${authToken}`);
    
    if (testRes.statusCode !== 200) {
      throw new Error('Token validation failed');
    }
  });

  afterEach(async () => {
    await pool.query('DELETE FROM tasks WHERE title LIKE \'Test%\'');
  });

  afterAll(async () => {
    await pool.query('DELETE FROM tasks WHERE user_id = $1', [userId]);
    await pool.query('DELETE FROM users WHERE id = $1', [userId]);
  });

  describe('Public Tasks API (no auth required)', () => {
    describe('GET /api/tasks', () => {
      it('should get all tasks (public) with pagination', async () => {
        const res = await request(app).get('/api/tasks?page=1&limit=10');
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('data');
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body).toHaveProperty('pagination');
      });
    });

    describe('GET /api/tasks/:id', () => {
      beforeEach(async () => {
        const taskRes = await request(app)
          .post('/api/tasks')
          .send({ title: 'Test Public Task', completed: false });
        taskId = taskRes.body.id;
      });

      it('should get task by id (public)', async () => {
        const res = await request(app).get(`/api/tasks/${taskId}`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('title', 'Test Public Task');
      });

      it('should return 404 for non-existent task', async () => {
        const res = await request(app).get('/api/tasks/99999');
        expect(res.statusCode).toBe(404);
      });
    });

    describe('POST /api/tasks (public)', () => {
      it('should create a new task (public)', async () => {
        const res = await request(app)
          .post('/api/tasks')
          .send({ title: 'Test Public Create Task', completed: false });
        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('title', 'Test Public Create Task');
      });

      it('should validate required fields', async () => {
        const res = await request(app)
          .post('/api/tasks')
          .send({ completed: false });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain('title');
      });
    });

    describe('PUT /api/tasks/:id (public)', () => {
      beforeEach(async () => {
        const taskRes = await request(app)
          .post('/api/tasks')
          .send({ title: 'Task to Update', completed: false });
        taskId = taskRes.body.id;
      });

      it('should update task (public)', async () => {
        const res = await request(app)
          .put(`/api/tasks/${taskId}`)
          .send({ title: 'Updated Task Title', completed: true });
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('title', 'Updated Task Title');
      });

      it('should return 404 for non-existent task', async () => {
        const res = await request(app)
          .put('/api/tasks/99999')
          .send({ title: 'Updated' });
        expect(res.statusCode).toBe(404);
      });
    });

    describe('DELETE /api/tasks/:id (public)', () => {
      beforeEach(async () => {
        const taskRes = await request(app)
          .post('/api/tasks')
          .send({ title: 'Task to Delete', completed: false });
        taskId = taskRes.body.id;
      });

      it('should delete task (public)', async () => {
        const res = await request(app).delete(`/api/tasks/${taskId}`);
        expect(res.statusCode).toBe(204);
        
        const getRes = await request(app).get(`/api/tasks/${taskId}`);
        expect(getRes.statusCode).toBe(404);
      });
    });
  });

  describe('Protected Tasks API (auth required)', () => {
    beforeEach(async () => {
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: testEmail,
          password: '123456'
        });
      authToken = loginRes.body.token;
    });

    describe('GET /api/tasks/my', () => {
      beforeEach(async () => {
        await request(app)
          .post('/api/tasks/my')
          .set('Authorization', `Bearer ${authToken}`)
          .send({ title: 'Test My Task', completed: false });
      });

      it('should get all tasks for authenticated user with pagination', async () => {
        const res = await request(app)
          .get('/api/tasks/my?page=1&limit=5')
          .set('Authorization', `Bearer ${authToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('data');
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body).toHaveProperty('pagination');
        expect(res.body.pagination).toHaveProperty('page', 1);
        expect(res.body.pagination).toHaveProperty('limit', 5);
      });

      it('should get tasks with default pagination when no params provided', async () => {
        const res = await request(app)
          .get('/api/tasks/my')
          .set('Authorization', `Bearer ${authToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('data');
        expect(res.body).toHaveProperty('pagination');
        expect(res.body.pagination).toHaveProperty('page', 1);
        expect(res.body.pagination).toHaveProperty('limit', 10);
      });

      it('should not get tasks without token', async () => {
        const res = await request(app).get('/api/tasks/my');
        expect(res.statusCode).toBe(401);
      });
    });

    describe('GET /api/tasks/my/:id', () => {
      beforeEach(async () => {
        const taskRes = await request(app)
          .post('/api/tasks/my')
          .set('Authorization', `Bearer ${authToken}`)
          .send({ title: 'Test My Specific Task', completed: false });
        taskId = taskRes.body.id;
      });

      it('should get specific task for authenticated user', async () => {
        const res = await request(app)
          .get(`/api/tasks/my/${taskId}`)
          .set('Authorization', `Bearer ${authToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('title', 'Test My Specific Task');
        expect(res.body).toHaveProperty('user_id', userId);
      });

      it('should return 404 for task not belonging to user', async () => {
        const otherUserTask = await request(app)
          .post('/api/tasks')
          .send({ title: 'Other User Task', completed: false });

        const res = await request(app)
          .get(`/api/tasks/my/${otherUserTask.body.id}`)
          .set('Authorization', `Bearer ${authToken}`);

        expect(res.statusCode).toBe(404);
      });
    });

    describe('POST /api/tasks/my', () => {
      it('should create task for authenticated user', async () => {
        const res = await request(app)
          .post('/api/tasks/my')
          .set('Authorization', `Bearer ${authToken}`)
          .send({ title: 'Test Create My Task', completed: false });

        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('title', 'Test Create My Task');
        expect(res.body).toHaveProperty('user_id', userId);
      });

      it('should not create task without auth', async () => {
        const res = await request(app)
          .post('/api/tasks/my')
          .send({ title: 'Test Task' });

        expect(res.statusCode).toBe(401);
      });

      it('should validate required fields', async () => {
        const res = await request(app)
          .post('/api/tasks/my')
          .set('Authorization', `Bearer ${authToken}`)
          .send({ completed: false });

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain('title');
      });
    });

    describe('PUT /api/tasks/my/:id', () => {
      beforeEach(async () => {
        const taskRes = await request(app)
          .post('/api/tasks/my')
          .set('Authorization', `Bearer ${authToken}`)
          .send({ title: 'Task to Update', completed: false });
        taskId = taskRes.body.id;
      });

      it('should update own task', async () => {
        const res = await request(app)
          .put(`/api/tasks/my/${taskId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({ title: 'Updated My Task', completed: true });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('title', 'Updated My Task');
      });

      it('should not update task of another user', async () => {
        const otherTask = await request(app)
          .post('/api/tasks')
          .send({ title: 'Other User Task', completed: false });

        const res = await request(app)
          .put(`/api/tasks/my/${otherTask.body.id}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({ title: 'Hacked Task' });

        expect(res.statusCode).toBe(404);
      });
    });

    describe('DELETE /api/tasks/my/:id', () => {
      beforeEach(async () => {
        const taskRes = await request(app)
          .post('/api/tasks/my')
          .set('Authorization', `Bearer ${authToken}`)
          .send({ title: 'Task to Delete', completed: false });
        taskId = taskRes.body.id;
      });

      it('should delete own task', async () => {
        const res = await request(app)
          .delete(`/api/tasks/my/${taskId}`)
          .set('Authorization', `Bearer ${authToken}`);

        expect(res.statusCode).toBe(204);

        const getRes = await request(app)
          .get(`/api/tasks/my/${taskId}`)
          .set('Authorization', `Bearer ${authToken}`);
        expect(getRes.statusCode).toBe(404);
      });

      it('should not delete task of another user', async () => {
        const otherTask = await request(app)
          .post('/api/tasks')
          .send({ title: 'Other User Task', completed: false });

        const res = await request(app)
          .delete(`/api/tasks/my/${otherTask.body.id}`)
          .set('Authorization', `Bearer ${authToken}`);

        expect(res.statusCode).toBe(404);
      });
    });
  });

  describe('Additional Filters', () => {
    beforeEach(async () => {
      await request(app).post('/api/tasks').send({ title: 'Test Task 1', completed: false });
      await request(app).post('/api/tasks').send({ title: 'Test Task 2', completed: true });
      await request(app).post('/api/tasks').send({ title: 'Test Task 3', completed: false });
    });

    describe('GET /api/tasks/incomplete', () => {
      it('should get only incomplete tasks', async () => {
        const res = await request(app).get('/api/tasks/incomplete');

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        res.body.forEach((task: any) => {
          expect(task.completed).toBe(false);
        });
      });
    });

    describe('GET /api/tasks/sorted-by-date', () => {
      it('should get tasks sorted by date', async () => {
        const res = await request(app).get('/api/tasks/sorted-by-date');

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
      });
    });
  });
});