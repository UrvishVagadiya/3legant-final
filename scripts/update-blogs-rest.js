const fs = require('fs');
const path = require('path');

// Extract env vars from .env.local manually to avoid dependency issues with dotenv if possible
const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) env[key.trim()] = value.trim();
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase environment variables in .env.local");
  process.exit(1);
}

const blogs = [
  { id: 5, img: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?q=80&w=1000&auto=format&fit=crop" },
  { id: 6, img: "https://images.unsplash.com/photo-1449247666642-264389f5f5b1?q=80&w=1000&auto=format&fit=crop" },
  { id: 7, img: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1000&auto=format&fit=crop" },
  { id: 11, img: "https://images.unsplash.com/photo-1565814636199-ae8133055c1c?q=80&w=1000&auto=format&fit=crop" }
];

async function updateAll() {
  for (const blog of blogs) {
    console.log(`Updating blog ${blog.id}...`);
    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/blogs?id=eq.${blog.id}`, {
        method: 'PATCH',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({ img: blog.img })
      });
      
      if (response.ok) {
        console.log(`Successfully updated blog ${blog.id}`);
      } else {
        const errText = await response.text();
        console.error(`Failed to update blog ${blog.id}: ${response.status} ${errText}`);
      }
    } catch (err) {
      console.error(`Error updating blog ${blog.id}: ${err.message}`);
    }
  }
}

updateAll();
