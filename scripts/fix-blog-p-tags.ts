import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing Supabase env variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function updateBlogs() {
  console.log('Fetching all blogs...');
  const { data: blogs, error: fetchError } = await supabase
    .from('blogs')
    .select('id, content');

  if (fetchError) {
    console.error('Error fetching blogs:', fetchError.message);
    return;
  }

  console.log(`Found ${blogs.length} blogs. Updating content...`);
  for (const blog of blogs) {
    if (!blog.content) continue;

    // Replace <p and </p> with <div and </div>
    // Be careful with common patterns
    let newContent = blog.content
        .replace(/<p(\s|>)/g, '<div$1')
        .replace(/<\/p>/g, '</div>');

    if (newContent !== blog.content) {
        const { error: updateError } = await supabase
            .from('blogs')
            .update({ content: newContent })
            .eq('id', blog.id);
        
        if (updateError) {
            console.error(`Error updating blog ${blog.id}:`, updateError.message);
        } else {
            console.log(`Updated blog ${blog.id}`);
        }
    }
  }
  console.log('Done!');
}

updateBlogs();
