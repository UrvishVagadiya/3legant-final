const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Basic env parser for .env.local
const envFile = fs.readFileSync(path.join(process.cwd(), '.env.local'), 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) env[key.trim()] = value.trim();
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY);

const blogs = [
  {
    id: 1,
    title: "7 ways to decor your home like a professional",
    img: "https://images.unsplash.com/photo-1484154218962-a197022b5858?q=80&w=1000&auto=format&fit=crop",
    date: "2023-10-16",
    content: `<h3>1. Start with a Neutral Base</h3>...`
  },
  // ... adding a few more for the demo
  {
    id: 2,
    title: "Inside a beautiful kitchen organization",
    img: "https://images.unsplash.com/photo-1588854337236-6889d631faa8?q=80&w=1000&auto=format&fit=crop",
    date: "2023-10-16",
    content: `<h3>Maximize Vertical Space</h3>...`
  }
];

async function seed() {
    console.log("Seeding blogs...");
    for (const blog of blogs) {
        const { error } = await supabase.from('blogs').upsert(blog);
        if (error) console.error(`Error ${blog.id}:`, error.message);
        else console.log(`Seeded ${blog.id}`);
    }
}

seed();
