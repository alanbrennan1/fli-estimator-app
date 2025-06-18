// /api/supabaseUtils.js

import supabase from './supabaseServerClient'; // ✅ uses server-side config


// ✅ Utility to check if an Opportunity already exists in Supabase
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
