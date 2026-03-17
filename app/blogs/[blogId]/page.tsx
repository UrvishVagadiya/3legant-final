import Link from "next/link";
import Image from "next/image";
import { FiUser, FiCalendar } from "react-icons/fi";
import { blogsData } from "@/constants/blogsData";
import SuggestedArticles from "@/components/sections/SuggestedArticles";

export const dynamic = "force-dynamic";

const BlogPost = async ({
  params,
}: {
  params: Promise<{ blogId: string }>;
}) => {
  const { blogId } = await params;
  const parseId = parseInt(blogId);
  const blog = blogsData.find((b: any) => b.id === parseId) || {
    id: blogId,
    img: "/article-1.png",
    title: "How to make a busy bathroom a place to relax",
    date: "October 16, 2023",
  };
  const suggested = [...blogsData]
    .filter((b) => b.id !== parseId)
    .sort(() => 0.5 - Math.random())
    .slice(0, 3);

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
            <span>admin</span>
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

      <div className="max-w-212.5 w-full text-[#141718] text-[15px] md:text-[18px] leading-[1.6]">
        <p className="mb-6 md:mb-8 text-[#6C7275]">
          Your bathroom serves a string of busy functions on a daily basis. See
          how you can make all of them work, and still have room for comfort and
          relaxation.
        </p>
        <h2 className="text-[22px] md:text-[28px] font-medium mb-3 md:mb-4">
          A cleaning hub with built-in ventilation
        </h2>
        <p className="mb-8 md:mb-12 text-[#6C7275]">
          Use a wall-mounted shower system to create a handy cleaning post.
          Washing the floors is highly suggested to stretch out straight yet
          accessibility helps - and saves out floor mops dry up quickly too.
        </p>

        <div className="flex flex-col md:grid md:grid-cols-2 md:grid-rows-[auto_auto_auto] md:gap-x-6">
          <div className="md:col-start-1 md:row-start-1 w-full relative aspect-4/5 overflow-hidden rounded mb-6 md:mb-12">
            <Image
              src="/article-2.png"
              fill
              className="object-cover"
              alt="Interior Details"
            />
          </div>
          <div className="md:col-span-2 md:row-start-2">
            <h2 className="text-[22px] md:text-[28px] font-medium mb-3 md:mb-4">
              Storage with a calming effect
            </h2>
            <p className="mb-8 md:mb-12 text-[#6C7275]">
              Having a lot to store doesn't mean it all has to go in a cupboard.
              Many bathroom items are better kept out in the open - either to be
              close at hand or are nice to look at. Add a plant or two to set a
              calm mood for the entire room (and they'll thrive in the humid
              air).
            </p>
          </div>
          <div className="md:col-start-2 md:row-start-1 w-full relative aspect-4/5 overflow-hidden rounded mb-6 md:mb-12">
            <Image
              src="/article-3.png"
              fill
              className="object-cover"
              alt="Bathroom Decor"
            />
          </div>
          <div className="md:col-span-2 md:row-start-3">
            <h2 className="text-[22px] md:text-[28px] font-medium mb-3 md:mb-4">
              Kit your clutter for easy access
            </h2>
            <p className="mb-10 text-[#6C7275]">
              Even if you have a cabinet ready to swallow the clutter, it's
              worth investing in little storage boxes. Use translucent ones for
              different activities... Home spa, make-up, personal hygiene -
              nothing out of the dark at a moment's notice.
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6 md:gap-12 mb-16 md:mb-20 items-center">
          <div className="w-full md:w-1/2 relative aspect-4/5 overflow-hidden rounded">
            <Image
              src="/article-1.png"
              fill
              className="object-cover"
              alt="Clean Towels"
            />
          </div>
          <div className="w-full md:w-1/2 space-y-6 md:space-y-8">
            <div>
              <h3 className="text-lg md:text-[22px] font-medium mb-2 md:mb-3">
                An ecosystem of towels
              </h3>
              <p className="text-[#6C7275]">
                Racks or hooks that allow air to circulate around each towel
                prolong their freshness. They dry quick and the need for
                frequent washing is restricted.
              </p>
            </div>
            <div>
              <h3 className="text-lg md:text-[22px] font-medium mb-2 md:mb-3">
                Make your mop disappear
              </h3>
              <p className="text-[#6C7275]">
                Having your cleaning tools organized makes them easier to
                find/use and return to. When they're not needed, close the
                curtain and feel the peace of mind. It's magic!
              </p>
            </div>
          </div>
        </div>
      </div>

      <SuggestedArticles articles={suggested} />
    </div>
  );
};

export default BlogPost;
