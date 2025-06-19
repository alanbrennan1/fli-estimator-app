import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey, {
  global: {
    headers: {
      Accept: 'application/json', // ✅ required to fix 406
    },
  },
});

// 🛠 Debug: verify client was created successfully
console.log("🛠 Supabase client initialized with headers:", supabase);

