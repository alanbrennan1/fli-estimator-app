import { createClient } from '@supabase/supabase-js';

// 🔍 Debug logs to verify Vite environment variables in the browser
console.log('👀 SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('👀 SUPABASE_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY);

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey, {
  global: {
    headers: {
      Accept: 'application/json', // ✅ required to avoid 406 errors
    },
  },
});
