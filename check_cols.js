const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCols() {
    // We can query information_schema if we have service role key, but usually we don't.
    // Instead, let's just fetch one record and check the type/values.
    const { data, error } = await supabase.from('products').select('*').limit(1);
    if (error) {
        console.error(error);
        return;
    }
    console.log('Product example:', data[0]);
    
    const { data: profile, error: err2 } = await supabase.from('user_profiles').select('*').limit(1);
    if (!err2) {
        console.log('Profile example:', profile[0]);
    }
}

checkCols();
