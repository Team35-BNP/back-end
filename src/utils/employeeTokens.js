// src/utils/employeeTokens.js
const jwt = require('jsonwebtoken');

const EMP_ACCESS_SECRET = process.env.EMP_JWT_ACCESS_SECRET || process.env.JWT_ACCESS_SECRET;
const EMP_REFRESH_SECRET = process.env.EMP_JWT_REFRESH_SECRET || process.env.JWT_REFRESH_SECRET;
const ACCESS_EXPIRES = process.env.EMP_ACCESS_EXPIRES || '15m';
const REFRESH_EXPIRES = process.env.EMP_REFRESH_EXPIRES || '30d';
const ALGS = ['HS256'];

exports.issueEmployeeAccessToken = (employee) => {
  return jwt.sign(
    { sub: employee._id.toString(), email: employee.email, roles: employee.roles || [], aud: 'employee', typ: 'access' },
    EMP_ACCESS_SECRET,
    { expiresIn: ACCESS_EXPIRES, algorithm: ALGS[0] }
  );
};

exports.issueEmployeeRefreshToken = (employee) => {
  return jwt.sign(
    { sub: employee._id.toString(), aud: 'employee', typ: 'refresh' },
    EMP_REFRESH_SECRET,
    { expiresIn: REFRESH_EXPIRES, algorithm: ALGS[0] }
  );
};

exports.verifyEmployeeRefreshToken = (token) => {
  return jwt.verify(token, EMP_REFRESH_SECRET, { algorithms: ALGS });
};
