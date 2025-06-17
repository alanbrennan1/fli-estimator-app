// utils/quoteHelpers.js
import { supabase } from './supabaseClient';

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
