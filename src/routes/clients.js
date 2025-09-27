const express = require('express');
const mongoose = require('mongoose');
const { requireAuth } = require('../middleware/auth');
const Client = require('../models/Client');

const router = express.Router();
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

/**
 * @openapi
 * components:
 *   schemas:
 *     Client:
 *       type: object
 *       properties:
 *         _id: { type: string }
 *         name: { type: string }
 *         company: { type: string }
 *         industry: { type: string }
 *         location: { type: string }
 *         ebitda_margin_pct: { type: number }
 *         ebit_margin_pct: { type: number }
 *         debt_to_equity: { type: number }
 *         interest_coverage: { type: number }
 *         dscr: { type: number }
 *         current_ratio: { type: number }
 *         quick_ratio: { type: number }
 *         revenue_usd_m: { type: number }
 *         revenue_cagr_3y_pct: { type: number }
 *         years_in_operation: { type: number }
 *         governance_score_0_100: { type: number }
 *         esg_controversies_3y: { type: number }
 *         country_risk_0_100: { type: number }
 *         fx_revenue_pct: { type: number }
 *         collateral_coverage_pct: { type: number }
 *         payment_incidents_12m: { type: number }
 *         legal_disputes_open: { type: number }
 *         lastEvaluation: { type: string, format: date-time }
 *       required:
 *         - name
 *         - company
 *         - industry
 *         - location
 *         - ebitda_margin_pct
 *         - ebit_margin_pct
 *         - debt_to_equity
 *         - interest_coverage
 *         - dscr
 *         - current_ratio
 *         - quick_ratio
 *         - revenue_usd_m
 *         - revenue_cagr_3y_pct
 *         - years_in_operation
 *         - governance_score_0_100
 *         - esg_controversies_3y
 *         - country_risk_0_100
 *         - fx_revenue_pct
 *         - collateral_coverage_pct
 *         - payment_incidents_12m
 *         - legal_disputes_open
 */

/**
 * @openapi
 * /api/v1/clients:
 *   post:
 *     summary: Create client
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Client'
 *     responses:
 *       201: { description: Created }
 *       400: { description: Validation or bad request }
 */
router.post('/', async (req, res) => {
  if (!req.body || typeof req.body !== 'object') return res.status(400).json({ error: 'Body required' });
  try {
    const doc = await Client.create(req.body);
    return res.status(201).json(doc);
  } catch (err) {
    return res.status(400).json({ error: 'Validation failed', details: err.message });
  }
});

/**
 * @openapi
 * /api/v1/clients:
 *   get:
 *     summary: List clients
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of clients
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Client' }
 */
router.get('/', async (_req, res) => {
  const list = await Client.find().sort({ createdAt: -1 });
  return res.json(list);
});

/**
 * @openapi
 * /api/v1/clients/{id}:
 *   get:
 *     summary: Get client by id
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Found }
 *       404: { description: Not found }
 */
router.get('/:id', requireAuth(), async (req, res) => {
  const { id } = req.params;
  if (!isValidId(id)) return res.status(404).json({ error: 'Not found' });
  const doc = await Client.findById(id);
  if (!doc) return res.status(404).json({ error: 'Not found' });
  return res.json(doc);
});

/**
 * @openapi
 * /api/v1/clients/{id}:
 *   put:
 *     summary: Replace client
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Client'
 *     responses:
 *       200: { description: Updated }
 *       400: { description: Validation error }
 *       404: { description: Not found }
 */
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  if (!isValidId(id)) return res.status(404).json({ error: 'Not found' });
  try {
    const updated = await Client.findByIdAndUpdate(id, req.body, {
      new: true,
      overwrite: true,
      runValidators: true,
    });
    if (!updated) return res.status(404).json({ error: 'Not found' });
    return res.json(updated);
  } catch (err) {
    return res.status(400).json({ error: 'Validation failed', details: err.message });
  }
});

/**
 * @openapi
 * /api/v1/clients/{id}:
 *   patch:
 *     summary: Partially update client
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Client'
 *     responses:
 *       200: { description: Updated }
 *       400: { description: Validation error }
 *       404: { description: Not found }
 */
router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  if (!isValidId(id)) return res.status(404).json({ error: 'Not found' });
  try {
    const updated = await Client.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated) return res.status(404).json({ error: 'Not found' });
    return res.json(updated);
  } catch (err) {
    return res.status(400).json({ error: 'Validation failed', details: err.message });
  }
});

/**
 * @openapi
 * /api/v1/clients/{id}:
 *   delete:
 *     summary: Delete client
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Deleted }
 *       404: { description: Not found }
 */
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  if (!isValidId(id)) return res.status(404).json({ error: 'Not found' });
  const deleted = await Client.findByIdAndDelete(id);
  if (!deleted) return res.status(404).json({ error: 'Not found' });
  return res.json({ success: true });
});

module.exports = router;
