// src/docs/swagger.js
const swaggerJSDoc = require('swagger-jsdoc');

const swaggerDefinition = {
  openapi: '3.0.3',
  info: {
    title: 'Auth API',
    version: '1.0.0',
    description: 'JWT auth with access/refresh tokens using Express and MongoDB',
  },
  servers: [
    { url: 'http://localhost:3000', description: 'Local dev' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
    schemas: {
      RegisterRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email', example: 'a@b.com' },
          password: { type: 'string', minLength: 8, example: 'StrongPass123' },
        },
      },
      LoginRequest: { $ref: '#/components/schemas/RegisterRequest' },
      TokenPair: {
        type: 'object',
        properties: {
          accessToken: { type: 'string' },
          refreshToken: { type: 'string' },
        },
      },
      RefreshRequest: {
        type: 'object',
        required: ['refreshToken'],
        properties: { refreshToken: { type: 'string' } },
      },
      UserResponse: {
        type: 'object',
        properties: {
          user: {
            type: 'object',
            properties: {
              _id: { type: 'string' },
              email: { type: 'string' },
              roles: { type: 'array', items: { type: 'string' } },
              createdAt: { type: 'string', format: 'date-time' },
            },
          },
        },
      },
      Error: {
        type: 'object',
        properties: { error: { type: 'string' } },
      },
    },
  },
};

const options = {
  definition: swaggerDefinition,
  apis: ['src/routes/*.js'], // JSDoc annotations in route files
};

const swaggerSpec = swaggerJSDoc(options);
module.exports = { swaggerSpec };
