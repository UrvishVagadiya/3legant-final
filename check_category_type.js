const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkType() {
    // Attempt to get column info
    const { data, error } = await supabase.rpc('get_column_info', { table_name: 'products' });
    
    // If RPC doesn't exist, just select and check values carefully
    if (error) {
        console.log('RPC failed, fetching sample records...');
        const { data: records, error: err2 } = await supabase.from('products').select('category').limit(5);
        if (err2) {
            console.error(err2);
            return;
        }
        records.forEach((r, i) => {
            console.log(`Record ${i}:`, r.category, typeof r.category, Array.isArray(r.category) ? 'ARRAY' : 'NOT ARRAY');
        });
    } else {
        console.log('Column info:', data);
    }
}

checkType();
