// src/models/EmployeeRefreshToken.js
const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  token: { type: String, unique: true, required: true, trim: true },
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', index: true },
  expiresAt: { type: Date, required: true, index: true },
  revokedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('EmployeeRefreshToken', schema);
