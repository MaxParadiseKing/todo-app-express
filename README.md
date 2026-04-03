# 📝 Todo App API

RESTful API для управления задачами с аутентификацией, авторизацией и системой ролей.  
Построен на **Node.js**, **Express**, **TypeScript** и **PostgreSQL**.

[![Express](https://img.shields.io/badge/Express-4.x-blue?style=flat-square&logo=express)](https://expressjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15.x-blue?style=flat-square&logo=postgresql)](https://www.postgresql.org/)
[![JWT](https://img.shields.io/badge/JWT-Auth-orange?style=flat-square&logo=json-web-tokens)](https://jwt.io/)
[![Swagger](https://img.shields.io/badge/Swagger-Docs-brightgreen?style=flat-square&logo=swagger)](https://swagger.io/)

---

## 🚀 Демо

API доступно по адресу:  
🔗 **`https://todo-app-express.onrender.com`** *(после деплоя)*  

📚 Интерактивная документация Swagger:  
🔗 **`https://todo-app-express.onrender.com/api-docs`**

---

## 📋 Функциональность

### 🔐 Аутентификация и авторизация
- Регистрация и вход (JWT)
- Защита маршрутов middleware `protect`
- Разграничение прав: `user` / `admin`

### ✅ Управление задачами
- Полный CRUD для задач
- **Пагинация** (страницы, лимиты)
- **Поиск** по названию (публичный и личный)
- **Фильтрация** по статусу (выполненные/невыполненные)
- **Сортировка** по дате создания

### 🛡️ Безопасность
- Хеширование паролей (bcrypt)
- JWT токены с ограничением времени жизни
- Rate limiting (защита от брутфорса)
- Валидация данных (Zod)

### 📚 Документация
- Swagger UI (интерактивная документация)
- Полное описание всех эндпоинтов

---

## 🛠️ Стек технологий

| Технология | Назначение |
|------------|------------|
| **Node.js** | Среда выполнения |
| **Express** | Веб-фреймворк |
| **TypeScript** | Статическая типизация |
| **PostgreSQL** | База данных |
| **JWT** | Аутентификация |
| **bcryptjs** | Хеширование паролей |
| **Zod** | Валидация данных |
| **Jest + Supertest** | Тестирование |
| **Swagger** | Документация API |

---

## ⚙️ Установка и запуск

### 1. Клонирование репозитория
```bash
git clone https://github.com/MaxParadiseKing/todo-app-express.git
cd todo-app-express
```

### 2. Установка зависимостей
```bash
npm install
```

### 3. Настройка переменных окружения
Создай файл `.env` на основе `.env.example`:
```bash
cp .env.example .env
```

**Пример `.env`**
```env
# PostgreSQL
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=todo_app
DB_PORT=5432

# JWT
JWT_SECRET=your_super_secret_key

# Server
PORT=3001
```

### 4. Создание базы данных
```sql
CREATE DATABASE todo_app;
```

### 5. Запуск приложения

**Режим разработки (с автоперезагрузкой):**
```bash
npm run dev
```

**Сборка и запуск:**
```bash
npm run build
npm start
```

### 6. Проверка работы
После запуска открой в браузере:
```
http://localhost:3001/api-docs
```

---

## 🧪 Тестирование

Запуск всех тестов:
```bash
npm test
```

Тесты покрывают:
- Аутентификацию (14 тестов)
- CRUD задачи (21 тест)
- Подключение к БД (1 тест)

**Итого:** 36 тестов ✅

---

## 📡 API Эндпоинты

### 🔐 Аутентификация

| Метод | Эндпоинт | Описание | Доступ |
|-------|----------|----------|--------|
| POST | `/api/auth/register` | Регистрация | Публичный |
| POST | `/api/auth/login` | Вход | Публичный |
| GET | `/api/auth/me` | Получить профиль | Требуется токен |

### ✅ Задачи

| Метод | Эндпоинт | Описание | Доступ |
|-------|----------|----------|--------|
| GET | `/api/tasks` | Все задачи (пагинация) | Публичный |
| GET | `/api/tasks/search?search=` | Поиск задач | Публичный |
| GET | `/api/tasks/incomplete` | Невыполненные задачи | Публичный |
| GET | `/api/tasks/sorted-by-date` | Задачи по дате | Публичный |
| GET | `/api/tasks/:id` | Задача по ID | Публичный |
| POST | `/api/tasks` | Создать задачу | Публичный |
| PUT | `/api/tasks/:id` | Обновить задачу | Публичный |
| DELETE | `/api/tasks/:id` | Удалить задачу | Публичный |

### 🔒 Личные задачи (требуется токен)

| Метод | Эндпоинт | Описание |
|-------|----------|----------|
| GET | `/api/tasks/my` | Все мои задачи |
| GET | `/api/tasks/my/search?search=` | Поиск среди моих задач |
| GET | `/api/tasks/my/:id` | Моя задача по ID |
| POST | `/api/tasks/my` | Создать задачу |
| PUT | `/api/tasks/my/:id` | Обновить мою задачу |
| DELETE | `/api/tasks/my/:id` | Удалить мою задачу |

---

## 📊 Примеры запросов

### Регистрация
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name": "Иван", "email": "ivan@mail.com", "password": "123456"}'
```

### Логин
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "ivan@mail.com", "password": "123456"}'
```

### Поиск задач
```bash
curl "http://localhost:3001/api/tasks/search?search=купить&page=1&limit=10"
```

### Личный поиск (с токеном)
```bash
curl "http://localhost:3001/api/tasks/my/search?search=купить" \
  -H "Authorization: Bearer <ваш_токен>"
```

---

## 📁 Структура проекта

```
src/
├── config/          # Настройки (БД, Swagger)
├── controllers/     # Обработчики запросов
├── middleware/      # Промежуточные обработчики
├── models/          # Работа с БД (SQL)
├── routes/          # Маршруты API
├── types/           # TypeScript интерфейсы
├── utils/           # Вспомогательные функции
├── tests/           # Тесты (Jest)
├── validations/     # Zod схемы
└── app.ts           # Точка входа
```

---

## 📄 Лицензия

MIT

---

**Автор:** [MaxParadiseKing](https://github.com/MaxParadiseKing)
```

---

