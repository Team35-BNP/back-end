// src/server.js
require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/auth');
const clientsRoutes = require('./routes/clients');

require('./db');

// Swagger setup
const swaggerUi = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');

const app = express();
app.use(express.json());
app.use(cookieParser());

// Swagger/OpenAPI spec via swagger-jsdoc
const swaggerDefinition = {
  openapi: '3.0.3',
  info: {
    title: 'Auth API',
    version: '1.0.0',
    description: 'JWT auth with access/refresh tokens using Express and MongoDB',
  },
  servers: [
    { url: process.env.PUBLIC_BASE_URL || 'http://localhost:3000', description: 'API' },
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

const swaggerOptions = {
  definition: swaggerDefinition,
  apis: ['src/routes/*.js'], // scan route files for @openapi blocks
};

const swaggerSpec = swaggerJSDoc(swaggerOptions); // builds OpenAPI from JSDoc [web:101]

// Serve Swagger UI and raw JSON
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true })); // [web:100]
app.get('/docs-json', (_req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
}); // [web:100]

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/clients', clientsRoutes);

app.get('/health', (_req, res) => res.json({ ok: true }));

const port = process.env.PORT || 3000;
const baseUrl = process.env.PUBLIC_BASE_URL || `http://localhost:${port}`;
app.listen(port, () => {
  console.log(`Auth server on :${port}`);
  console.log(`Swagger UI: ${baseUrl}/docs`);
  console.log(`OpenAPI JSON: ${baseUrl}/docs-json`);
}); // [web:100]
