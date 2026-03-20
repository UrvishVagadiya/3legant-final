const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY; // Use Service Role to bypass RLS
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkProfiles() {
    console.log('--- USER PROFILES ---');
    const { data: profiles, error } = await supabase.from('user_profiles').select('*');
    if (error) {
        console.error(error);
        return;
    }
    profiles.forEach(p => {
        console.log(`ID: ${p.id}, Email: ${p.email}, Role: ${p.role}`);
    });

    console.log('\n--- AUTH USERS ---');
    // We can't easily list auth users from client lib, but we can check the current user if we had a session.
    // However, since we are using service_role, we focus on the public.user_profiles table.
}

checkProfiles();
