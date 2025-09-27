// src/server.js
require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const clientsRoutes = require('./routes/clients');
require('./db'); // initializes mongoose connection

// Swagger
const swaggerUi = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');

const app = express();

// CORS — allow local dev UIs
const allowedOrigins = [
  'http://127.0.0.1:3001',
  'http://localhost:3001',
  'http://127.0.0.1:5173',
  'http://localhost:5173',
];
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true); // allow tools like Postman
      cb(null, allowedOrigins.includes(origin));
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: false, // use true only if sending cookies across origins
  })
);

// CORS middleware already handles OPTIONS requests
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true); // allow Postman, curl, etc.
      cb(null, allowedOrigins.includes(origin));
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: false,
  })
);

app.use(express.json());
app.use(cookieParser());

// Swagger/OpenAPI spec via swagger-jsdoc
const swaggerDefinition = {
  openapi: '3.0.3',
  info: {
    title: 'Auth & Clients API',
    version: '1.0.0',
    description: 'JWT auth with access/refresh tokens and Clients CRUD using Express and MongoDB',
  },
  servers: [{ url: process.env.PUBLIC_BASE_URL || 'http://localhost:3000', description: 'API' }],
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
        properties: { accessToken: { type: 'string' }, refreshToken: { type: 'string' } },
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
      Error: { type: 'object', properties: { error: { type: 'string' } } },
    },
  },
};
const swaggerOptions = { definition: swaggerDefinition, apis: ['src/routes/*.js'] };
const swaggerSpec = swaggerJSDoc(swaggerOptions); // builds spec from JSDoc comments [web:101]

// Serve Swagger UI and raw JSON
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true })); // [web:100]
app.get('/docs-json', (_req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/clients', clientsRoutes);

// Health
app.get('/health', (_req, res) => res.json({ ok: true }));

// Start
const port = process.env.PORT || 3000;
const baseUrl = process.env.PUBLIC_BASE_URL || `http://localhost:${port}`;
app.listen(port, () => {
  console.log(`Server running on ${baseUrl}`);
  console.log(`Swagger UI: ${baseUrl}/docs`);
  console.log(`OpenAPI JSON: ${baseUrl}/docs-json`);
});

