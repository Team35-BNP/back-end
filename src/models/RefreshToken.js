// src/models/RefreshToken.js
const mongoose = require('mongoose');

const refreshTokenSchema = new mongoose.Schema({
  token: { type: String, unique: true, required: true, trim: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  expiresAt: { type: Date, required: true, index: true },
  revokedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('RefreshToken', refreshTokenSchema);
