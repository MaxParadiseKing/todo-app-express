## 📝 **Cтруктурированный конспект всего проекта.**

Сохрани это в файл `README.md` в корне проекта.

---

## 📝 **Вот простая инструкция по установке `.env` для README:**

## 📁 **Создай файл `.env.example` в корне проекта:**

```env
# PostgreSQL
DB_USER=postgres
DB_PASSWORD=your_password_here
DB_NAME=todo_app
DB_PORT=5432

# JWT
JWT_SECRET=your_secret_key_here

# Server
PORT=3001
```

## 📋 **Добавь в README.md секцию "Установка":**

```markdown
## 🚀 Установка и запуск

### 1. Клонируй репозиторий
```bash
git clone https://github.com/MaxParadiseKing/todo-app-express.git
cd todo-app-express
```

### 2. Установи зависимости
```bash
npm install
```

### 3. Настрой переменные окружения
```bash
# Скопируй пример файла .env
cp .env.example .env

# Отредактируй .env, вставь свои данные:
# - DB_PASSWORD: пароль от PostgreSQL
# - JWT_SECRET: любой секретный ключ (например, "my_super_secret_123")
```

### 4. Создай базу данных
В PostgreSQL выполни:
```sql
CREATE DATABASE todo_app;
```

### 5. Запусти миграции (если есть)
```bash
# Пока таблицы создаются вручную через psql
# Таблицы users и tasks уже должны быть созданы
```

### 6. Запусти проект
```bash
# Режим разработки
npm run dev

# Или собери и запусти
npm run build
npm start
```

### 7. Проверь работу
```
GET http://localhost:3001/api/tasks
```
```

## 🎯 **Файлы, которые нужно создать:**

1. **`.env.example`** — пример для других (без паролей)
2. **Обновить `.gitignore`** (уже есть `.env`)

## ✅ **После этого любой сможет:**

1. Склонировать проект
2. Скопировать `.env.example` → `.env`
3. Вставить свои пароли
4. Запустить!

---

# 🏗️ **СТРУКТУРА ПРОЕКТА (Express + TypeScript + PostgreSQL)**

```
src/
├── config/              # Настройки
│   └── db.ts           # Подключение к PostgreSQL
├── models/              # Работа с БД (SQL запросы)
│   ├── task.model.ts   # Запросы для задач
│   └── user.model.ts   # Запросы для пользователей
├── controllers/         # Обработка запросов (req, res)
│   ├── taskController.ts
│   └── userController.ts
├── routes/              # Маршруты (URL → controller)
│   ├── taskRoutes.ts
│   └── userRoutes.ts
├── types/               # TypeScript интерфейсы
│   ├── task.types.ts
│   └── user.types.ts
├── utils/               # Вспомогательные функции
│   └── AppError.ts      # Класс ошибок
└── app.ts               # Главный файл (всё подключается здесь)
```

---

# 📦 **ОСНОВНЫЕ ПАКЕТЫ**

```json
"dependencies": {
  "express": "^4.18.0",        // Веб-сервер
  "pg": "^8.11.0",             // PostgreSQL клиент
  "bcryptjs": "^2.4.3",        // Хеширование паролей
  "jsonwebtoken": "^9.0.0"     // JWT токены
},
"devDependencies": {
  "typescript": "^5.0.0",       // TypeScript
  "@types/node": "^20.0.0",     // Типы для Node.js
  "@types/express": "^4.17.0",  // Типы для Express
  "@types/pg": "^8.10.0",       // Типы для PostgreSQL
  "@types/bcryptjs": "^2.4.0",  // Типы для bcrypt
  "@types/jsonwebtoken": "^9.0.0", // Типы для JWT
  "ts-node": "^10.9.0"          // Запуск .ts файлов
}
```

---

# 🗄️ **РАБОТА С БАЗОЙ ДАННЫХ (models/)**

## **config/db.ts**
```typescript
import { Pool } from 'pg';
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'todo_app',
    password: 'твой_пароль',
    port: 5432,
});
export default pool;
```

## **Модель = SQL запросы**
```typescript
// READ — получить все
export const getAll = async (): Promise<Type[]> => {
    const result = await pool.query('SELECT * FROM table');
    return result.rows;
};

// READ — получить один по ID
export const getById = async (id: number): Promise<Type | null> => {
    const result = await pool.query('SELECT * FROM table WHERE id = $1', [id]);
    return result.rows[0] || null;
};

// CREATE — создать
export const create = async (data: any): Promise<Type> => {
    const result = await pool.query(
        'INSERT INTO table (col1, col2) VALUES ($1, $2) RETURNING *',
        [data.col1, data.col2]
    );
    return result.rows[0];
};

// UPDATE — обновить
export const update = async (id: number, data: any): Promise<Type | null> => {
    const result = await pool.query(
        'UPDATE table SET col1 = $1 WHERE id = $2 RETURNING *',
        [data.col1, id]
    );
    return result.rows[0] || null;
};

// DELETE — удалить
export const delete_ = async (id: number): Promise<boolean> => {
    const result = await pool.query('DELETE FROM table WHERE id = $1 RETURNING id', [id]);
    return (result.rowCount ?? 0) > 0;
};
```

**Важно:** `$1`, `$2` — это параметры (защита от SQL инъекций)

---

# 🎮 **КОНТРОЛЛЕРЫ (controllers/)**

```typescript
import { Request, Response, NextFunction } from 'express';
import * as Model from '../models/...';
import AppError from '../utils/AppError';

export const getItems = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const items = await Model.getAll();
        res.json(items);
    } catch (error) {
        next(error); // передаём в обработчик ошибок
    }
};

export const getItemById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = parseInt(req.params.id);
        const item = await Model.getById(id);
        
        if (!item) {
            return next(new AppError('Not found', 404));
        }
        
        res.json(item);
    } catch (error) {
        next(error);
    }
};
```

**Паттерн контроллера:**
1. `try/catch` — ловим ошибки
2. Получаем данные из `req.params` или `req.body`
3. Вызываем модель
4. Проверяем результат (if(!item) return next(error))
5. Отправляем ответ `res.json()`

---

# 🛣️ **МАРШРУТЫ (routes/)**

```typescript
import { Router } from 'express';
import * as controller from '../controllers/...';

const router = Router();

router.get('/', controller.getItems);
router.get('/:id', controller.getItemById);
router.post('/', controller.createItem);
router.put('/:id', controller.updateItem);
router.delete('/:id', router.deleteItem);

export default router;
```

**В `app.ts` подключаем:**
```typescript
app.use('/api/items', itemRoutes);
```

---

# 🔐 **JWT АВТОРИЗАЦИЯ**

## **Схема работы:**
```
Регистрация → сохраняем пользователя в БД (пароль хешируем)
     ↓
Логин → проверяем пароль → создаём JWT токен → отдаём клиенту
     ↓
Клиент хранит токен и присылает в заголовке Authorization
     ↓
Защищённые роуты проверяют токен → пускают или нет
```

## **Хеширование пароля (bcrypt):**
```typescript
const hashedPassword = await bcrypt.hash(password, 10);
const isValid = await bcrypt.compare(inputPassword, user.password);
```

## **Создание JWT:**
```typescript
const token = jwt.sign(
    { id: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: '24h' }
);
```

## **Проверка JWT:**
```typescript
try {
    const decoded = jwt.verify(token, JWT_SECRET);
    // decoded = { id: 1, email: '...' }
} catch {
    // токен недействителен
}
```

---

# 📚 **ГЛАВНЫЕ ПАТТЕРНЫ ДЛЯ ЗАПОМИНАНИЯ**

| Компонент | Что делает | Где лежит |
|-----------|------------|-----------|
| **Model** | SQL запросы к БД | `models/*.ts` |
| **Controller** | Обработка `req` и `res` | `controllers/*.ts` |
| **Route** | Связь URL → controller | `routes/*.ts` |
| **Type** | TypeScript интерфейсы | `types/*.ts` |
| **Middleware** | Функции до/после роутов | в `app.ts` |

**Порядок работы над новой сущностью:**
1. Создать таблицу в БД
2. Создать TypeScript типы
3. Написать модель (SQL запросы)
4. Написать контроллер
5. Создать маршруты
6. Подключить в app.ts

---