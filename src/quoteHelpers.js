import { supabase } from './supabaseClient';

// 🔍 Fetch a full quote by opportunity number
export async function fetchQuoteByOpportunityNumber(opportunityNumber) {
  const { data, error } = await supabase
    .from('quotes')
    .select('*')
    .eq('opportunity_number', opportunityNumber)
    .single();

  if (error) {
    console.error('❌ Error fetching quote:', error);
    return null;
  }

  return data;
}

// ✅ Check whether a quote already exists in Supabase
export async function checkOpportunityExists(opportunityId) {
  const { data, error } = await supabase
    .from('quotes')
    .select('opportunity_number')
    .eq('opportunity_number', opportunityId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('❌ Supabase error:', error);
    throw error;
  }

  return !!data;
}
