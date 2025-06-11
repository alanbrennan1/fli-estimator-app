import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  const authHeader = req.headers.authorization;
  const expectedToken = process.env.GPT_SECRET;

  if (authHeader !== `Bearer ${expectedToken}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { product_type, limit = 5 } = req.query;

  const limitNum = Number(limit) || 5;

let query = supabase
  .from('quotes')
  .select('product_type, price_per_tonne, profit_margin, hrs_per_tonne_job')
  .order('created_at', { ascending: false })
  .limit(limitNum);

if (product_type) {
  query = query.ilike('product_type', `%${product_type}%`);
}

const { data, error } = await query;


  if (error) return res.status(500).json({ error });

  res.status(200).json({ quotes: data });
}
