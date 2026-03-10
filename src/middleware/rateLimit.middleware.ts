import rateLimit from 'express-rate-limit';

// Общий лимит для всех запросов
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 100, // максимум 100 запросов с одного IP
  message: {
    status: 'error',
    message: 'Too many requests, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Пропускаем rate limiting в тестовом режиме
  skip: (req) => process.env.NODE_ENV === 'test'
});

// Строгий лимит для авторизации (защита от брутфорса)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 5, // только 5 попыток входа
  message: {
    status: 'error',
    message: 'Too many login attempts, please try again later'
  },
  skipSuccessfulRequests: true, // не считаем успешные входы
  // Пропускаем rate limiting в тестовом режиме
  skip: (req) => process.env.NODE_ENV === 'test'
});