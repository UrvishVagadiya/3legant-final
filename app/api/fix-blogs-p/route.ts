import { createAdminClient } from "@/utils/supabase/admin";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = createAdminClient();
  const results = [];

  const { data: blogs, error: fetchError } = await supabase
    .from("blogs")
    .select("id, content");

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }

  for (const blog of blogs) {
    if (!blog.content) continue;

    const newContent = blog.content
      .replace(/<p(\s|>)/g, "<div$1")
      .replace(/<\/p>/g, "</div>");

    if (newContent !== blog.content) {
      const { error: updateError } = await supabase
        .from("blogs")
        .update({ content: newContent })
        .eq("id", blog.id);

      if (updateError) {
        results.push({ id: blog.id, status: "error", error: updateError.message });
      } else {
        results.push({ id: blog.id, status: "success" });
      }
    }
  }

  return NextResponse.json({ results });
}
