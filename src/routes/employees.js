// src/routes/employees.js
const express = require('express');
const { requireEmployeeAuth } = require('../middleware/employeeAuth');
const Employee = require('../models/Employee');

const router = express.Router();

router.get('/me', requireEmployeeAuth(), async (req, res) => {
  const me = await Employee.findById(req.user.sub).select('_id email roles createdAt');
  if (!me) return res.status(404).json({ error: 'Not found' });
  res.json({ employee: me });
});

// Admin/HR reading employees
router.get('/', requireEmployeeAuth(['admin','hr']), async (req, res) => {
  const list = await Employee.find().limit(100).lean();
  res.json({ employees: list });
});

module.exports = router;
