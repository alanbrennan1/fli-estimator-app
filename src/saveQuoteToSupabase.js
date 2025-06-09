import { supabase } from './supabaseClient';

export const saveQuoteToSupabase = async (quoteData) => {
  if (!quoteData || typeof quoteData !== 'object') {
    console.error('❌ Invalid quote data:', quoteData);
    return { success: false, error: 'Invalid data' };
  }

  const { data, error } = await supabase
    .from('quotes')
    .insert([quoteData]);

  if (error) {
    console.error('❌ Error saving quote:', error);
    return { success: false, error };
  }

  console.log('✅ Quote saved to Supabase:', data);
  return { success: true, data };
};
