// src/routes/auth.js
const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const { registerSchema, loginSchema, refreshSchema } = require('../validators/auth');
const { requireAuth } = require('../middleware/auth');
const { issueAccessToken, issueRefreshToken, verifyRefreshToken } = require('../utils/tokens');

const router = express.Router();
const SALT_ROUNDS = 10;

router.post('/register', async (req, res) => {
  const parse = registerSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: 'Invalid payload' });

  const { email, password } = parse.data;
  const existing = await User.findOne({ email });
  if (existing) return res.status(409).json({ error: 'Email already registered' });

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await User.create({ email, passwordHash });

  const accessToken = issueAccessToken(user);
  const refreshToken = issueRefreshToken(user);

  const { exp } = verifyRefreshToken(refreshToken);
  await RefreshToken.create({
    token: refreshToken,
    user: user._id,
    expiresAt: new Date(exp * 1000)
  });

  return res.status(201).json({ accessToken, refreshToken });
});

router.post('/login', async (req, res) => {
  const parse = loginSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: 'Invalid payload' });

  const { email, password } = parse.data;
  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const ok = await user.comparePassword(password);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

  const accessToken = issueAccessToken(user);
  const refreshToken = issueRefreshToken(user);

  const { exp } = verifyRefreshToken(refreshToken);
  await RefreshToken.create({
    token: refreshToken,
    user: user._id,
    expiresAt: new Date(exp * 1000)
  });

  return res.json({ accessToken, refreshToken });
});

router.get('/whoami', requireAuth(), async (req, res) => {
  const user = await User.findById(req.user.sub).select('_id email roles createdAt');
  return res.json({ user });
});

router.post('/token/refresh', async (req, res) => {
  const parsed = refreshSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid payload' });

  const { refreshToken } = parsed.data;
  const doc = await RefreshToken.findOne({ token: refreshToken });
  if (!doc || doc.revokedAt) return res.status(404).json({ error: 'Refresh token not found' });
  if (doc.expiresAt < new Date()) {
    await RefreshToken.deleteOne({ _id: doc._id });
    return res.status(403).json({ error: 'Refresh token expired' });
  }

  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    await RefreshToken.deleteOne({ _id: doc._id });
    return res.status(403).json({ error: 'Invalid refresh token' });
  }

  const user = await User.findById(payload.sub);
  if (!user) {
    await RefreshToken.deleteOne({ _id: doc._id });
    return res.status(404).json({ error: 'User not found' });
  }

  await RefreshToken.deleteOne({ _id: doc._id });

  const newAccess = issueAccessToken(user);
  const newRefresh = issueRefreshToken(user);
  const { exp } = verifyRefreshToken(newRefresh);
  await RefreshToken.create({
    token: newRefresh,
    user: user._id,
    expiresAt: new Date(exp * 1000)
  });

  return res.json({ accessToken: newAccess, refreshToken: newRefresh });
});

router.post('/logout', async (req, res) => {
  const parsed = refreshSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid payload' });

  const { refreshToken } = parsed.data;
  await RefreshToken.deleteOne({ token: refreshToken });
  return res.json({ success: true });
});

module.exports = router;
