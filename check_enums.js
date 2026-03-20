const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
    const { data: products, error } = await supabase
        .from('products')
        .select('category, color');

    if (error) {
        console.error('Error fetching products:', error);
        return;
    }

    const categories = new Set();
    const colors = new Set();

    products.forEach(p => {
        if (p.category) {
            if (Array.isArray(p.category)) {
                p.category.forEach(c => categories.add(c));
            } else {
                p.category.split(',').forEach(c => categories.add(c.trim()));
            }
        }
        if (p.color) {
            if (Array.isArray(p.color)) {
                p.color.forEach(c => colors.add(c));
            } else {
                colors.add(p.color);
            }
        }
    });

    console.log('Existing Categories:', Array.from(categories));
    console.log('Existing Colors:', Array.from(colors));
}

checkData();
