// src/models/RefreshToken.js (augment existing)
const mongoose = require('mongoose');

const refreshTokenSchema = new mongoose.Schema({
  token: { type: String, unique: true, required: true, trim: true },
  user: { type: mongoose.Schema.Types.ObjectId, refPath: 'subjectType', index: true },
  subjectType: { type: String, enum: ['User', 'Employee'], required: true, index: true },
  expiresAt: { type: Date, required: true, index: true },
  revokedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('RefreshToken', refreshTokenSchema);
