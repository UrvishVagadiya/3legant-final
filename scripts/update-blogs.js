const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase environment variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const blogs = [
  {
    id: 5,
    img: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?q=80&w=1000&auto=format&fit=crop",
  },
  {
    id: 6,
    img: "https://images.unsplash.com/photo-1449247666642-264389f5f5b1?q=80&w=1000&auto=format&fit=crop",
  },
  {
    id: 7,
    img: "https://images.unsplash.com/photo-1554995207-c18c20360a59?q=80&w=1000&auto=format&fit=crop",
  },
  {
    id: 11,
    img: "https://images.unsplash.com/photo-1565814636199-ae8133055c1c?q=80&w=1000&auto=format&fit=crop",
  }
];

async function updateBlogs() {
  console.log("Starting blog image update...");
  for (const blog of blogs) {
    const { error } = await supabase
      .from("blogs")
      .update({ img: blog.img })
      .eq("id", blog.id);

    if (error) {
      console.error(`Error updating blog ${blog.id}:`, error.message);
    } else {
      console.log(`Successfully updated image for blog ${blog.id}`);
    }
  }
  console.log("Update complete!");
}

updateBlogs();
