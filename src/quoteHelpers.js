import { supabase } from './supabaseClient';

// 🔍 Fetch the most recent quote by project number
export async function fetchQuoteByProjectNumber(projectNumber) {
  const { data, error } = await supabase
    .from('quotes')
    .select('*')
    .eq('project_number', projectNumber)
    .order('created_at', { ascending: false })
    .limit(1);

  if (error) {
    console.error('❌ Error fetching quote:', error);
    return null;
  }

  return data?.[0] || null; // Return the latest quote or null if none found
}

// ✅ Check whether quote exists in Supabase
export async function checkProjectExists(projectNumber) {
  const { data, error } = await supabase
    .from('quotes')
    .select('id') // only fetch ID for existence check
    .eq('project_number', projectNumber)
    .order('created_at', { ascending: false })
    .limit(1);

  if (error && error.code !== 'PGRST116') {
    console.error('❌ Supabase error:', error);
    throw error;
  }

  return data && data.length > 0;
}
