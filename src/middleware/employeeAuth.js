// src/middleware/employeeAuth.js
const jwt = require('jsonwebtoken');

const EMP_ACCESS_SECRET = process.env.EMP_JWT_ACCESS_SECRET || process.env.JWT_ACCESS_SECRET;
const ALGS = ['HS256'];

exports.requireEmployeeAuth = (roles = []) => (req, res, next) => {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Missing token' });

  try {
    const payload = jwt.verify(token, EMP_ACCESS_SECRET, { algorithms: ALGS });
    if (payload.aud && payload.aud !== 'employee') return res.status(403).json({ error: 'Wrong audience' });
    if (roles.length && !payload.roles?.some(r => roles.includes(r))) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};
