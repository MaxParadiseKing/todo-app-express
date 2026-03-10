import swaggerJsdoc from 'swagger-jsdoc';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Todo App API',
            version: '1.0.0',
            description: 'REST API для управления задачами с авторизацией и ролями',
        },
        servers: [
            {
                url: 'http://localhost:3001/api',
                description: 'Локальный сервер',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
            schemas: {  // ← ВАЖНО: schemas ВНУТРИ components
                User: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer', example: 1 },
                        name: { type: 'string', example: 'Иван Петров' },
                        email: { type: 'string', example: 'ivan@mail.com' },
                        role: { type: 'string', enum: ['user', 'admin'], example: 'user' },
                        created_at: { type: 'string', format: 'date-time' }
                    }
                },
                Task: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer', example: 1 },
                        title: { type: 'string', example: 'Купить продукты' },
                        completed: { type: 'boolean', example: false },
                        user_id: { type: 'integer', example: 1 },
                        created_at: { type: 'string', format: 'date-time' }
                    }
                }
            }
        },
    },
    apis: ['./src/routes/*.ts', './src/controllers/*.ts'], // файлы с JSDoc комментариями
};

export const specs = swaggerJsdoc(options);