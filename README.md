
# 📝 Todo App API

RESTful API для управления задачами с поддержкой аутентификации, авторизации и системы ролей. Проект построен на **Node.js**, **Express**, **TypeScript** и **PostgreSQL**.

[![Express](https://img.shields.io/badge/Express-4.x-blue?style=flat-square&logo=express)](https://expressjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15.x-blue?style=flat-square&logo=postgresql)](https://www.postgresql.org/)
[![JWT](https://img.shields.io/badge/JWT-Auth-orange?style=flat-square&logo=json-web-tokens)](https://jwt.io/)
[![Jest](https://img.shields.io/badge/Jest-Tests-red?style=flat-square&logo=jest)](https://jestjs.io/)

---

## 🚀 Функциональность

*   ✅ **Аутентификация и авторизация** (JWT)
*   ✅ **Система ролей** (`user` / `admin`)
*   ✅ **Полное CRUD** для задач
*   ✅ **Пагинация** и фильтрация задач
*   ✅ **Защита маршрутов**: пользователи видят и редактируют только свои задачи
*   ✅ **Валидация данных** (Zod)
*   ✅ **Rate Limiting** для защиты от брутфорса
*   ✅ **Интерактивная документация API** (Swagger)
*   ✅ **Модульная архитектура** (Models, Controllers, Routes)
*   ✅ **Тестирование** (Jest, 36+ тестов)

---

## 🛠️ Стек технологий

*   **Backend:** Node.js, Express
*   **Язык:** TypeScript
*   **База данных:** PostgreSQL (с драйвером `pg`)
*   **Аутентификация:** JWT (`jsonwebtoken`), Bcrypt
*   **Валидация:** Zod
*   **Тестирование:** Jest, Supertest
*   **Документация:** Swagger (`swagger-jsdoc`, `swagger-ui-express`)

---

## 📂 Структура проекта

```
src/
├── config/          # Настройки (подключение к БД, Swagger)
├── controllers/      # Обработчики запросов (бизнес-логика)
├── middleware/       # Промежуточные обработчики (auth, validate, rate-limit)
├── models/           # Работа с базой данных (SQL запросы)
├── routes/           # Определение маршрутов API
├── types/            # TypeScript интерфейсы и типы
├── utils/            # Вспомогательные функции (класс ошибок)
├── tests/            # Интеграционные и модульные тесты
└── app.ts            # Инициализация Express-приложения
```

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
Скопируйте файл `.env.example` в `.env` и отредактируйте его, подставив свои значения:
```bash
cp .env.example .env
```

**Содержимое `.env.example`:**
```env
# PostgreSQL
DB_USER=postgres
DB_PASSWORD=your_password_here
DB_NAME=todo_app
DB_PORT=5432

# JWT
JWT_SECRET=your_super_secret_key_here

# Server
PORT=3001
```

### 4. Создание базы данных
Подключитесь к PostgreSQL и выполните:
```sql
CREATE DATABASE todo_app;
```
*(Для тестов также потребуется база данных `todo_app_test`)*

### 5. Запуск приложения

**Режим разработки:**
```bash
npm run dev
```

**Сборка и запуск в production-режиме:**
```bash
npm run build
npm start
```

### 6. Проверка работы
После запуска сервер будет доступен по адресу: `http://localhost:3001`

---

## 📚 Документация API (Swagger)

После запуска проекта интерактивная документация будет доступна по адресу:
> **http://localhost:3001/api-docs**

Там вы сможете:
*   Просмотреть все доступные эндпоинты.
*   Увидеть схемы запросов и ответов.
*   Авторизоваться с помощью JWT-токена (кнопка **Authorize**).
*   Отправлять тестовые запросы прямо из браузера.

---

## 🧪 Тестирование

Проект покрыт интеграционными тестами (Jest + Supertest).

**Запуск всех тестов:**
```bash
npm test
```

**Запуск тестов с флагом `--runInBand` (для стабильности при параллельном выполнении):**
```bash
npm test -- --runInBand
```

**Запуск конкретного тестового файла:**
```bash
npx jest src/tests/auth.test.ts
npx jest src/tests/tasks.test.ts
```

---

## 🔗 Примеры API запросов

### Регистрация
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name": "Иван Петров", "email": "ivan@mail.com", "password": "123456"}'
```

### Логин
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "ivan@mail.com", "password": "123456"}'
```

### Создание задачи (требуется токен)
```bash
curl -X POST http://localhost:3001/api/tasks/my \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ваш_токен>" \
  -d '{"title": "Купить молоко", "completed": false}'
```

### Получение своих задач с пагинацией
```bash
curl -X GET "http://localhost:3001/api/tasks/my?page=1&limit=5" \
  -H "Authorization: Bearer <ваш_токен>"
```

### Получение невыполненных задач (публично)
```bash
curl -X GET http://localhost:3001/api/tasks/incomplete
```

---

## 🤝 Как внести вклад

1.  Форкните репозиторий.
2.  Создайте ветку для вашей функции (`git checkout -b feature/amazing-feature`).
3.  Зафиксируйте изменения (`git commit -m 'Add some amazing feature'`).
4.  Запушьте ветку (`git push origin feature/amazing-feature`).
5.  Откройте Pull Request.

---

**Автор:** [MaxParadiseKing](https://github.com/MaxParadiseKing)

---