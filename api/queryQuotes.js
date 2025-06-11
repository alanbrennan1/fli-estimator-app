import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  const authHeader = req.headers.authorization;
  const expectedToken = process.env.GPT_SECRET;

  if (authHeader !== `Bearer ${expectedToken}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { product_type, limit = 5 } = req.query;

  const { data, error } = await supabase
    .from('quotes')
    .select('product_type, price_per_tonne, profit_margin')
    .eq('product_type', product_type)
    .order('created_at', { ascending: false })
    .limit(Number(limit));

  if (error) return res.status(500).json({ error });

  res.status(200).json({ quotes: data });
}
