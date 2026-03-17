const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkOrdersSchema() {
  console.log('--- Checking Orders Table Schema ---');
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .limit(1);

  if (error) {
    console.error('Error fetching from orders:', error);
  } else {
    console.log('Successfully fetched from orders.');
    if (data && data.length > 0) {
      console.log('Columns in orders:', Object.keys(data[0]));
    } else {
      console.log('Orders table is empty, creating dummy order to check columns...');
      // We can try to fetch a specific non-existent column to see if it errors
    }
  }

  console.log('\n--- Testing Specific Query ---');
  const query = "id, order_code, created_at, status, subtotal, shipping_cost, discount, total, shipping_method, tracking_number, payments(status), refund_status, refund_request_reason, refund_requested_at";
  const { data: qData, error: qError } = await supabase
    .from('orders')
    .select(query)
    .limit(1);

  if (qError) {
    const match = qError.message.match(/column "(.*?)"/);
    if (match) {
       console.log('MISSING_COL:' + match[1]);
    } else {
       console.log('ERROR_MSG:' + qError.message);
    }
  } else {
    console.log('Query succeeded.');
  }
}

checkOrdersSchema();
