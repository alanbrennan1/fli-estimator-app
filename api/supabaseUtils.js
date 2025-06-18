// /api/supabaseUtils.js

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// ✅ Utility to check if an Opportunity already exists
export async function checkOpportunityExists(opportunityId) {
  const { data, error } = await supabase
    .from('quotes')
    .select('opportunityNumber')
    .eq('opportunityNumber', opportunityId)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw error;
  }

  return !!data;
}
