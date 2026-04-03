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
                },
                Pagination: {
            type: 'object',
            properties: {
                page: { type: 'integer', example: 1 },
                limit: { type: 'integer', example: 10 },
                total: { type: 'integer', example: 25 },
                totalPages: { type: 'integer', example: 3 },
                hasNextPage: { type: 'boolean', example: true },
                hasPrevPage: { type: 'boolean', example: false }
            }
        }
            }
        },
    },
    apis: ['./src/routes/*.ts', './src/controllers/*.ts'], // файлы с JSDoc комментариями
};

export const specs = swaggerJsdoc(options);