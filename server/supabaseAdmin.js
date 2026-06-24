import { createClient } from '@supabase/supabase-js';

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('SUPABASE URL:', url);
console.log('SERVICE KEY EXISTS:', !!key);

if (!url || !key) {
  throw new Error(
    'Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY'
  );
}

export const supabaseAdmin = createClient(
  url,
  key,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);
