import { supabase } from './supabaseClient';

// 🔍 Fetch a full quote by project number
export async function fetchQuoteByProjectNumber(projectNumber) {
  const { data, error } = await supabase
    .from('quotes')
    .select('*')
    .eq('project_number', projectNumber)
    .single();

  if (error) {
    console.error('❌ Error fetching quote:', error);
    return null;
  }

  return data;
}

// ✅ Check whether a quote already exists in Supabase
export async function checkProjectExists(projectNumber) {
  const { data, error } = await supabase
    .from('quotes')
    .select('project_number')
    .eq('project_number', projectNumber)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('❌ Supabase error:', error);
    throw error;
  }

  return !!data;
}
