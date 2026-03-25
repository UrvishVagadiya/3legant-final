const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Load .env.local
const envFile = fs.readFileSync(path.join(process.cwd(), '.env.local'), 'utf8');
const env = dotenv.parse(envFile);

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY);

async function migrate() {
    console.log("Starting migration...");

    // 1. Alter the table
    // PostgreSQL SQL for the migration
    const sql = `
        -- 1. Remove description and timestamp
        ALTER TABLE blogs DROP COLUMN IF EXISTS description;
        ALTER TABLE blogs DROP COLUMN IF EXISTS timestamp;

        -- 2. Alter date column to timestamptz
        -- We handle existing string dates by trying to cast them, 
        -- or setting to now() if they are empty/invalid.
        ALTER TABLE blogs 
        ALTER COLUMN date TYPE timestamptz 
        USING (
            CASE 
                WHEN date IS NULL OR date = '' THEN now()
                ELSE date::timestamptz 
            END
        );

        -- Set default to now()
        ALTER TABLE blogs ALTER COLUMN date SET DEFAULT now();
    `;

    // Note: To run arbitrary SQL via the JS client, we need a special RPC 
    // or we can use the 'postgres' extension if available.
    // Since we don't know if a 'run_sql' RPC exists, we'll try to use 
    // a common pattern or just perform the edits via the client if possible.
    // HOWEVER, dropping columns and changing types requires raw SQL.
    
    // Attempting to run SQL via a common RPC name if it exists:
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
    
    if (error) {
        if (error.message.includes("function \"exec_sql\" does not exist")) {
            console.error("MIGRATION FAILED: The 'exec_sql' RPC is not available.");
            console.log("Please run the following SQL manually in the Supabase SQL Editor:");
            console.log(sql);
        } else {
            console.error("MIGRATION ERROR:", error);
        }
    } else {
        console.log("MIGRATION SUCCESSFUL!");
    }
}

migrate();
