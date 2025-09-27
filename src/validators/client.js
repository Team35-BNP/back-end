const { z } = require('zod');

const floats = {
  ebitda_margin_pct: z.number(),
  ebit_margin_pct: z.number(),
  debt_to_equity: z.number(),
  interest_coverage: z.number(),
  dscr: z.number(),
  current_ratio: z.number(),
  quick_ratio: z.number(),
  revenue_usd_m: z.number(),
  revenue_cagr_3y_pct: z.number(),
};

const ints = {
  years_in_operation: z.number().int(),
  governance_score_0_100: z.number().int(),
  esg_controversies_3y: z.number().int(),
  country_risk_0_100: z.number().int(),
  fx_revenue_pct: z.number().int(),
  collateral_coverage_pct: z.number().int(),
  payment_incidents_12m: z.number().int(),
  legal_disputes_open: z.number().int(),
};

const base = { ...floats, ...ints };

exports.createClientSchema = z.object(base);
exports.updateClientSchema = z.object(base).partial(); // allow partial updates
