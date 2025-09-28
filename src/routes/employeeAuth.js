// src/routes/employeeAuth.js
const express = require('express');
const bcrypt = require('bcrypt');
const Employee = require('../models/Employee');
const RefreshToken = require('../models/RefreshToken'); // or EmployeeRefreshToken
const { issueEmployeeAccessToken, issueEmployeeRefreshToken, verifyEmployeeRefreshToken } = require('../utils/employeeTokens');

const router = express.Router();
const SALT_ROUNDS = 10;

// POST /api/v1/employee-auth/register
router.post('/register', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password || password.length < 8) return res.status(400).json({ error: 'Invalid payload' });

  const existing = await Employee.findOne({ email });
  if (existing) return res.status(409).json({ error: 'Email already registered' });

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const employee = await Employee.create({ email, passwordHash, roles: ['employee'] });

  const accessToken = issueEmployeeAccessToken(employee);
  const refreshToken = issueEmployeeRefreshToken(employee);

  const { exp } = verifyEmployeeRefreshToken(refreshToken);
  await RefreshToken.create({
    token: refreshToken,
    user: employee._id,
    subjectType: 'Employee',
    expiresAt: new Date(exp * 1000)
  });

  return res.status(201).json({ accessToken, refreshToken });
});

// POST /api/v1/employee-auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'Invalid payload' });

  const employee = await Employee.findOne({ email });
  if (!employee) return res.status(401).json({ error: 'Invalid credentials' });

  const ok = await employee.comparePassword(password);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

  const accessToken = issueEmployeeAccessToken(employee);
  const refreshToken = issueEmployeeRefreshToken(employee);

  const { exp } = verifyEmployeeRefreshToken(refreshToken);
  await RefreshToken.create({
    token: refreshToken,
    user: employee._id,
    subjectType: 'Employee',
    expiresAt: new Date(exp * 1000)
  });

  return res.json({ accessToken, refreshToken });
});

// POST /api/v1/employee-auth/token/refresh
router.post('/token/refresh', async (req, res) => {
  const { refreshToken } = req.body || {};
  if (!refreshToken) return res.status(400).json({ error: 'Invalid payload' });

  const doc = await RefreshToken.findOne({ token: refreshToken, subjectType: 'Employee' });
  if (!doc || doc.revokedAt) return res.status(404).json({ error: 'Refresh token not found' });
  if (doc.expiresAt < new Date()) {
    await RefreshToken.deleteOne({ _id: doc._id });
    return res.status(403).json({ error: 'Refresh token expired' });
  }

  let payload;
  try {
    payload = verifyEmployeeRefreshToken(refreshToken);
  } catch {
    await RefreshToken.deleteOne({ _id: doc._id });
    return res.status(403).json({ error: 'Invalid refresh token' });
  }

  const employee = await Employee.findById(payload.sub);
  if (!employee) {
    await RefreshToken.deleteOne({ _id: doc._id });
    return res.status(404).json({ error: 'Employee not found' });
  }

  await RefreshToken.deleteOne({ _id: doc._id });

  const newAccess = issueEmployeeAccessToken(employee);
  const newRefresh = issueEmployeeRefreshToken(employee);
  const { exp } = verifyEmployeeRefreshToken(newRefresh);
  await RefreshToken.create({
    token: newRefresh,
    user: employee._id,
    subjectType: 'Employee',
    expiresAt: new Date(exp * 1000)
  });

  return res.json({ accessToken: newAccess, refreshToken: newRefresh });
});

// POST /api/v1/employee-auth/logout
router.post('/logout', async (req, res) => {
  const { refreshToken } = req.body || {};
  if (!refreshToken) return res.status(400).json({ error: 'Invalid payload' });
  await RefreshToken.deleteOne({ token: refreshToken, subjectType: 'Employee' });
  return res.json({ success: true });
});

module.exports = router;
