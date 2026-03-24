import Link from "next/link";
import Image from "next/image";
import { FiUser, FiCalendar } from "react-icons/fi";
import SuggestedArticles from "@/components/sections/SuggestedArticles";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { MDXRemote } from "next-mdx-remote/rsc";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

const MDXComponents = {
  Image,
  Link,
  h2: ({ children }: any) => (
    <h2 className="text-[22px] md:text-[28px] font-medium mb-3 md:mb-4">
      {children}
    </h2>
  ),
  h3: ({ children }: any) => (
    <h3 className="text-lg md:text-[22px] font-medium mb-2 md:mb-3">
      {children}
    </h3>
  ),
  p: ({ children }: any) => <div className="mb-6 md:mb-8 text-[#6C7275]">{children}</div>,
};

const BlogPost = async ({
  params,
}: {
  params: Promise<{ blogId: string }>;
}) => {
  const { blogId } = await params;
  const parseId = parseInt(blogId);
  const supabase = await createClient(cookies());

  // Fetch current blog
  const { data: blog, error: blogError } = await supabase
    .from("blogs")
    .select("*")
    .eq("id", parseId)
    .single();

  if (blogError || !blog) {
    return notFound();
  }

  // Fetch suggested articles (random 3 excluding current)
  const { data: suggestedData } = await supabase
    .from("blogs")
    .select("id, title, img, date")
    .neq("id", parseId)
    .limit(3);

  const suggested = suggestedData || [];

  return (
    <div className="max-w-310 mx-auto px-4 sm:px-6 lg:px-8 mb-20 mt-8 font-poppins text-[#141718]">
      <div className="flex flex-wrap items-center gap-3 text-[14px] font-medium mb-8 text-[#6C7275]">
        <Link href="/" className="hover:text-[#141718] transition-colors">
          Home
        </Link>
        <span className="text-xs">{">"}</span>
        <Link href="/blogs" className="hover:text-[#141718] transition-colors">
          Blog
        </Link>
        <span className="text-xs">{">"}</span>
        <span className="text-[#141718]">{blog.title}</span>
      </div>

      <div className="space-y-4 mb-8 md:mb-10 w-full lg:w-[85%]">
        <span className="text-xs font-bold uppercase tracking-wider text-[#6C7275]">
          ARTICLE
        </span>
        <h1 className="text-[34px] md:text-5xl lg:text-[54px] font-medium leading-[1.1] text-[#141718]">
          {blog.title}
        </h1>
        <div className="flex items-center gap-6 text-[#6C7275] text-xs md:text-sm font-medium pt-2">
          <div className="flex items-center gap-2">
            <FiUser size={18} />
            <span>{blog.author || "admin"}</span>
          </div>
          <div className="flex items-center gap-2">
            <FiCalendar size={18} />
            <span>{blog.date}</span>
          </div>
        </div>
      </div>

      <div className="w-full aspect-4/3 md:aspect-21/9 relative rounded-lg overflow-hidden mb-8 md:mb-12">
        <Image
          src={blog.img}
          alt={blog.title}
          fill
          className="object-cover object-center"
        />
      </div>

      <div className="w-full text-[#141718] text-[15px] md:text-[18px] leading-[1.6]">
        <MDXRemote source={blog.content} components={MDXComponents} />
      </div>

      <SuggestedArticles articles={suggested} />
    </div>
  );
};

export default BlogPost;
