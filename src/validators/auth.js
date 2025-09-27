// src/validators/auth.js
const { z } = require('zod');

const email = z.string().email().max(254);
const password = z.string().min(8).max(128);

exports.registerSchema = z.object({ email, password });
exports.loginSchema = z.object({ email, password });
exports.refreshSchema = z.object({ refreshToken: z.string().min(20).max(500) });
