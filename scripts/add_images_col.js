const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase environment variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function addImagesColumn() {
  console.log('--- Adding images column to products table ---');
  // Since we don't have a direct SQL execution tool, we use a trick: 
  // We check if it exists, and the user will have to run the migration 
  // OR we try to use a simple RPC if they have one for migrations.
  // Actually, I'll just check if the column exists first.
  const { data, error } = await supabase
    .from('products')
    .select('images')
    .limit(1);

  if (error && error.message.includes('column "images" does not exist')) {
    console.log('Column "images" DOES NOT exist. Please run the migration!');
    console.log('I will attempt to use a common RPC if available: "exec_sql"');
    
    // Attempting to run via RPC if it exists (some Supabase setups have this)
    const { error: rpcError } = await supabase.rpc('exec_sql', {
      sql_query: 'ALTER TABLE public.products ADD COLUMN IF NOT EXISTS images text[] DEFAULT \'{}\';'
    });
    
    if (rpcError) {
      console.error('RPC exec_sql failed:', rpcError.message);
      console.log('MANUAL ACTION REQUIRED: Run the SQL in supabase/migrations/202603240000_add_product_images_array.sql');
    } else {
      console.log('Successfully added column via RPC!');
    }
  } else if (error) {
    console.error('Error checking column:', error.message);
  } else {
    console.log('Column "images" ALREADY exists.');
  }
}

addImagesColumn();
