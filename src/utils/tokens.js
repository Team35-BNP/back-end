// src/utils/tokens.js
const jwt = require('jsonwebtoken');

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const ACCESS_EXPIRES = process.env.ACCESS_EXPIRES || '15m';
const REFRESH_EXPIRES = process.env.REFRESH_EXPIRES || '30d';

exports.issueAccessToken = (user) => {
  return jwt.sign(
    { sub: user._id.toString(), email: user.email, roles: user.roles || [] },
    ACCESS_SECRET,
    { expiresIn: ACCESS_EXPIRES }
  );
};

exports.issueRefreshToken = (user) => {
  return jwt.sign(
    { sub: user._id.toString(), typ: 'refresh' },
    REFRESH_SECRET,
    { expiresIn: REFRESH_EXPIRES }
  );
};

exports.verifyRefreshToken = (token) => {
  return jwt.verify(token, REFRESH_SECRET);
};
