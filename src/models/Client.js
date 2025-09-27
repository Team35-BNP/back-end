const mongoose = require('mongoose');

const ClientSchema = new mongoose.Schema({
  // floats
  ebitda_margin_pct: { type: Number, required: true },
  ebit_margin_pct: { type: Number, required: true },
  debt_to_equity: { type: Number, required: true },
  interest_coverage: { type: Number, required: true },
  dscr: { type: Number, required: true },
  current_ratio: { type: Number, required: true },
  quick_ratio: { type: Number, required: true },
  revenue_usd_m: { type: Number, required: true },
  revenue_cagr_3y_pct: { type: Number, required: true },

  // integers (use min/max to hint integer domain; Mongoose Number is double, but will validate ranges)
  years_in_operation: { type: Number, required: true, min: 0 },
  governance_score_0_100: { type: Number, required: true, min: 0, max: 100 },
  esg_controversies_3y: { type: Number, required: true, min: 0 },
  country_risk_0_100: { type: Number, required: true, min: 0, max: 100 },
  fx_revenue_pct: { type: Number, required: true, min: 0, max: 100 },
  collateral_coverage_pct: { type: Number, required: true, min: 0, max: 100 },
  payment_incidents_12m: { type: Number, required: true, min: 0 },
  legal_disputes_open: { type: Number, required: true, min: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Client', ClientSchema);
