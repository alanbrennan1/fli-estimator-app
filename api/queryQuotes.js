import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  // 🔐 Auth check
  const authHeader = req.headers.authorization;
  const expectedToken = process.env.GPT_SECRET;

  // ✅ TEMP BYPASS: allow unauthenticated access if no token is provided (for GPT schema testing only)
  if (authHeader && authHeader !== `Bearer ${expectedToken}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { product_type, limit = 5 } = req.query;
  const limitNum = Number(limit) || 5;

  let query = supabase
    .from('quotes')
    .select(`
      project_number,
      project_name,
      client,
      sector,
      product_type,
      concrete_tonnage,
      steel_tonnage,
      hrs_per_tonne_job,
      price_per_tonne,
      profit_margin,
      total_labour_hours,
      total_design_hours,
      total_design_price,
      total_installation_days,
      total_installation_price,
      total_transport_loads,
      total_transport_price,
      total_price,
      project_city,
      project_country,
      sales_stage,
      created_at
    `)
    .order('created_at', { ascending: false })
    .limit(limitNum);

  if (product_type) {
    query = query.ilike('product_type', `%${product_type}%`);
  }

  const { data, error } = await query;

  if (error) return res.status(500).json({ error });

  res.status(200).json({ quotes: data });
}
