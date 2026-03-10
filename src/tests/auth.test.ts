import request from 'supertest';
import app from '../app';
import pool from '../config/db';

describe('Auth Endpoints', () => {
  // Уникальные email для каждого запуска тестов
  const timestamp = Date.now();
  const testEmail = `test-${timestamp}@test.com`;
  const loginEmail = `login-${timestamp}@test.com`;
  const meEmail = `me-${timestamp}@test.com`;
  const duplicateEmail = `duplicate-${timestamp}@test.com`;
  const nonexistentEmail = `nonexistent-${timestamp}@test.com`;

  // Очищаем тестовые данные перед каждым тестом
  beforeEach(async () => {
    // Важен порядок: сначала tasks (из-за внешнего ключа)
    await pool.query('DELETE FROM tasks');
    await pool.query("DELETE FROM users WHERE email LIKE '%@test.com'");
  });

  // Закрываем соединение после всех тестов
  afterAll(async () => {
    // await pool.end();
  });

  describe('POST /api/auth/register', () => {
    const testUser = {
      name: 'Тестовый Пользователь',
      email: testEmail,
      password: '123456'
    };

    it('should register a new user successfully', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser);

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.email).toBe(testUser.email);
      expect(res.body.name).toBe(testUser.name);
      expect(res.body).not.toHaveProperty('password');
      expect(res.body.role).toBe('user');
    });

    it('should hash the password', async () => {
      await request(app)
        .post('/api/auth/register')
        .send(testUser);

      const result = await pool.query(
        'SELECT password FROM users WHERE email = $1',
        [testUser.email]
      );
      
      const hashedPassword = result.rows[0].password;
      expect(hashedPassword).not.toBe(testUser.password);
      expect(hashedPassword).toMatch(/^\$2[aby]\$\d+\$/);
    });

    it('should not register with existing email', async () => {
      // Сначала создаем пользователя
      await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Первый Пользователь',
          email: duplicateEmail,
          password: '123456'
        });

      // Пытаемся создать с тем же email
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Другой Пользователь',
          email: duplicateEmail,
          password: '123456'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toMatch(/already exists/i);
    });

    it('should validate required fields', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: testEmail
          // нет name и password
        });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('message');
      expect(res.body.message).toContain('name');
      expect(res.body.message).toContain('password');
    });

    it('should validate email format', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test',
          email: 'not-an-email',
          password: '123456'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain('email');
      expect(res.body.message).toContain('Invalid email format');
    });

    it('should validate password length (min 6)', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test',
          email: testEmail,
          password: '123' // слишком короткий
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain('Password must be at least 6 characters');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Создаем пользователя для тестов логина
      await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Login Test',
          email: loginEmail,
          password: '123456'
        });
    });

    it('should login with correct credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: loginEmail,
          password: '123456'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user).toHaveProperty('email', loginEmail);
      expect(res.body.user).toHaveProperty('name', 'Login Test');
      expect(res.body.user).not.toHaveProperty('password');
    });

    it('should not login with wrong password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: loginEmail,
          password: 'wrongpassword'
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toBe('Invalid email or password');
    });

    it('should not login with non-existent email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: nonexistentEmail,
          password: '123456'
        });

      expect(res.statusCode).toBe(401);
    });

    it('should return valid JWT token', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: loginEmail,
          password: '123456'
        });

      const token = res.body.token;
      expect(token.split('.')).toHaveLength(3);
    });
  });

  describe('GET /api/auth/me', () => {
    let authToken: string;

    beforeEach(async () => {
      // Регистрируем и логиним пользователя
      await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Me Test',
          email: meEmail,
          password: '123456'
        });

      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: meEmail,
          password: '123456'
        });

      authToken = loginRes.body.token;
    });

    it('should get current user profile with valid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('email', meEmail);
      expect(res.body).toHaveProperty('name', 'Me Test');
      expect(res.body).not.toHaveProperty('password');
    });

    it('should not get profile without token', async () => {
      const res = await request(app)
        .get('/api/auth/me');

      expect(res.statusCode).toBe(401);
    });

    it('should not get profile with invalid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid.token.here');

      expect(res.statusCode).toBe(401);
    });
  });
});

// import request from 'supertest';
// import app from '../app';
// import pool from '../config/db';

// describe('Auth Endpoints', () => {
//   // Очищаем тестовые данные перед каждым тестом
//   beforeEach(async () => {
//     // Важен порядок: сначала tasks (из-за внешнего ключа)
//     await pool.query('DELETE FROM tasks');
//     await pool.query("DELETE FROM users WHERE email LIKE '%@test.com'");
//   });

//   // Закрываем соединение после всех тестов
//   afterAll(async () => {
//     // await pool.end();
//   });

//   describe('POST /api/auth/register', () => {
//     const testUser = {
//       name: 'Тестовый Пользователь',
//       email: 'test@test.com',
//       password: '123456'
//     };

//     it('should register a new user successfully', async () => {
//       const res = await request(app)
//         .post('/api/auth/register')
//         .send(testUser);

//       expect(res.statusCode).toBe(201);
//       expect(res.body).toHaveProperty('id');
//       expect(res.body.email).toBe(testUser.email);
//       expect(res.body.name).toBe(testUser.name);
//       expect(res.body).not.toHaveProperty('password');
//       expect(res.body.role).toBe('user'); // роль по умолчанию
//     });

//     it('should hash the password', async () => {
//       await request(app)
//         .post('/api/auth/register')
//         .send(testUser);

//       // Проверяем в БД что пароль захэширован
//       const result = await pool.query(
//         'SELECT password FROM users WHERE email = $1',
//         [testUser.email]
//       );
      
//       const hashedPassword = result.rows[0].password;
//       expect(hashedPassword).not.toBe(testUser.password); // не равен исходному
//       expect(hashedPassword).toMatch(/^\$2[aby]\$\d+\$/); // начинается с $2 (bcrypt)
//     });

//     it('should not register with existing email', async () => {
//       // Сначала создаем пользователя
//       await request(app)
//         .post('/api/auth/register')
//         .send(testUser);

//       // Пытаемся создать с тем же email
//       const res = await request(app)
//         .post('/api/auth/register')
//         .send({
//           ...testUser,
//           name: 'Другой Пользователь'
//         });

//       expect(res.statusCode).toBe(400);
//       expect(res.body.message).toMatch(/already exists/i);
//     });

//   it('should validate required fields', async () => {
//     const res = await request(app)
//       .post('/api/auth/register')
//       .send({
//         email: 'test@test.com'
//         // нет name и password
//       });

//     expect(res.statusCode).toBe(400);
//     expect(res.body).toHaveProperty('message');
//     expect(res.body.message).toContain('name');
//     expect(res.body.message).toContain('password');
//   });

//   it('should validate email format', async () => {
//     const res = await request(app)
//       .post('/api/auth/register')
//       .send({
//         name: 'Test',
//         email: 'not-an-email',
//         password: '123456'
//       });

//     expect(res.statusCode).toBe(400);
//     expect(res.body.message).toContain('email');
//     expect(res.body.message).toContain('Invalid email format');
//   });

//   it('should validate password length (min 6)', async () => {
//     const res = await request(app)
//       .post('/api/auth/register')
//       .send({
//         name: 'Test',
//         email: 'test@test.com',
//         password: '123' // слишком короткий
//       });

//     expect(res.statusCode).toBe(400);
//     expect(res.body.message).toContain('Password must be at least 6 characters');
//   });
// });

//   describe('POST /api/auth/login', () => {
//     beforeEach(async () => {
//       // Создаем пользователя для тестов логина
//       await request(app)
//         .post('/api/auth/register')
//         .send({
//           name: 'Login Test',
//           email: 'login@test.com',
//           password: '123456'
//         });
//     });

//     it('should login with correct credentials', async () => {
//       const res = await request(app)
//         .post('/api/auth/login')
//         .send({
//           email: 'login@test.com',
//           password: '123456'
//         });

//       expect(res.statusCode).toBe(200);
//       expect(res.body).toHaveProperty('token');
//       expect(res.body.user).toHaveProperty('email', 'login@test.com');
//       expect(res.body.user).toHaveProperty('name', 'Login Test');
//       expect(res.body.user).not.toHaveProperty('password');
//     });

//     it('should not login with wrong password', async () => {
//       const res = await request(app)
//         .post('/api/auth/login')
//         .send({
//           email: 'login@test.com',
//           password: 'wrongpassword'
//         });

//       expect(res.statusCode).toBe(401);
//       expect(res.body.message).toBe('Invalid email or password');
//     });

//     it('should not login with non-existent email', async () => {
//       const res = await request(app)
//         .post('/api/auth/login')
//         .send({
//           email: 'nonexistent@test.com',
//           password: '123456'
//         });

//       expect(res.statusCode).toBe(401);
//     });

//     it('should return valid JWT token', async () => {
//       const res = await request(app)
//         .post('/api/auth/login')
//         .send({
//           email: 'login@test.com',
//           password: '123456'
//         });

//       const token = res.body.token;
//       // Проверяем что токен имеет 3 части (header.payload.signature)
//       expect(token.split('.')).toHaveLength(3);
//     });
//   });

//   describe('GET /api/auth/me', () => {
//     let authToken: string;

//     beforeEach(async () => {
//       // Регистрируем и логиним пользователя
//       await request(app)
//         .post('/api/auth/register')
//         .send({
//           name: 'Me Test',
//           email: 'me@test.com',
//           password: '123456'
//         });

//       const loginRes = await request(app)
//         .post('/api/auth/login')
//         .send({
//           email: 'me@test.com',
//           password: '123456'
//         });

//       authToken = loginRes.body.token;
//     });

//     it('should get current user profile with valid token', async () => {
//       const res = await request(app)
//         .get('/api/auth/me')
//         .set('Authorization', `Bearer ${authToken}`);

//       expect(res.statusCode).toBe(200);
//       expect(res.body).toHaveProperty('email', 'me@test.com');
//       expect(res.body).toHaveProperty('name', 'Me Test');
//       expect(res.body).not.toHaveProperty('password');
//     });

//     it('should not get profile without token', async () => {
//       const res = await request(app)
//         .get('/api/auth/me');

//       expect(res.statusCode).toBe(401);
//     });

//     it('should not get profile with invalid token', async () => {
//       const res = await request(app)
//         .get('/api/auth/me')
//         .set('Authorization', 'Bearer invalid.token.here');

//       expect(res.statusCode).toBe(401);
//     });
//   });
// });