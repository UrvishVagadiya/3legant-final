import Image from "next/image";
import { MdOutlineMail } from "react-icons/md";

const NewsLetter = () => {
  return (
    <div className="bg-[#F3F5F7] relative h-[auto] py-16 md:py-0 md:h-[360px] w-full overflow-hidden">
      <div className="hidden md:block">
        <Image
          style={{ mixBlendMode: "multiply" }}
          className="absolute top-[-140px] left-[-260px]"
          src="/cupboard.jpg"
          width={690}
          height={380}
          alt="Newsletter"
        />
        <Image
          style={{ mixBlendMode: "multiply" }}
          className="absolute top-[-80px] right-[-460px]"
          src="/chair.jpg"
          width={890}
          height={380}
          alt="Newsletter"
        />
      </div>

      <div className="flex flex-col items-center justify-center gap-8 md:gap-10 h-full relative text-center px-5 md:px-0">
        <div className="flex flex-col gap-2 md:gap-0 max-w-sm md:max-w-none mx-auto">
          <h1 className="text-center text-3xl md:text-3xl lg:text-4xl font-medium md:mb-2 text-[#141718]">
            Join Our Newsletter
          </h1>
          <h3 className="text-sm md:text-lg text-[#141718] font-normal">
            Sign up for deals, new products and promotions
          </h3>
        </div>

        <div className="flex w-full md:w-[60%] lg:w-[40%] xl:w-[30%] items-center justify-between pb-2 border-b border-gray-400 gap-3">
          <div className="flex items-center gap-3 w-full">
            <MdOutlineMail className="text-2xl text-[#141718]" />
            <input
              className="bg-transparent outline-none w-full text-base placeholder:text-[#6C7275] text-[#141718]"
              type="email"
              placeholder="Email address"
            />
          </div>
          <button className="text-[#6C7275] hover:text-[#141718] transition-colors font-medium cursor-pointer pl-4 duration-300 ease-in-out">
            Signup
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewsLetter;
