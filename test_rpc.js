const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY; // Need service role for RPC typically or if RLS is strict
const supabase = createClient(supabaseUrl, supabaseKey);

async function testStockReduction() {
    const productId = 'eae45650-0519-4b03-bb61-23e2788cd6ed'; // toaster
    console.log('Testing stock reduction for for:', productId);


    const { data: initialData } = await supabase.from('products').select('stock').eq('id', productId).single();
    console.log('Initial stock:', initialData.stock);

    const { error } = await supabase.rpc('reduce_product_stock', {
        items: [{ product_id: productId, quantity: 1 }]
    });

    if (error) {
        console.error('RPC Error:', error);
    } else {
        console.log('RPC Success');
        const { data: finalData } = await supabase.from('products').select('stock').eq('id', productId).single();
        console.log('Final stock:', finalData.stock);
    }
}

testStockReduction();
