// src/models/Employee.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const employeeSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true, lowercase: true, trim: true, index: true },
  passwordHash: { type: String, required: true },
  roles: { type: [String], default: ['employee'], index: true }
}, { timestamps: true });

employeeSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.passwordHash);
};

module.exports = mongoose.model('Employee', employeeSchema);
