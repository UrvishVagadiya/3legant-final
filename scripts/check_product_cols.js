const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkProductColumns() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .limit(1);

  if (error) {
    console.error('Error fetching products:', error.message);
  } else if (data && data.length > 0) {
    console.log('Product columns:', Object.keys(data[0]));
    console.log('First product images:', data[0].images);
  } else {
    console.log('No products found.');
  }
}

checkProductColumns();
