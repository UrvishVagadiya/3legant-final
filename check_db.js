const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkLikesTable() {
  console.log('--- Checking for likes (generic) ---');
  const { data, error } = await supabase
    .from('likes')
    .select('*')
    .limit(1);
  if (error) console.log('likes (generic) does NOT exist or Error:', error.message);
  else console.log('likes (generic) EXISTS. Columns:', Object.keys(data[0] || {}));
}

checkLikesTable();
