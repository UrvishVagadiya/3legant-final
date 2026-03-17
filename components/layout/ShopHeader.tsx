import Link from "next/link";

const ShopHeader = () => {
  return (
    <div
      className="w-full min-h-98 flex items-center justify-center rounded-lg mt-6"
      style={{
        backgroundImage: 'url("/shop.png")',
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="flex flex-col justify-center items-center text-center px-4">
        <div className="flex gap-3 text-sm md:text-base font-medium">
          <Link
            href={"/"}
            className="text-gray-500 hover:text-gray-900 transition-colors"
          >
            Home
          </Link>
          <span className="text-gray-400">{">"}</span>
          <Link href={"/shop"} className="text-black">
            Shop
          </Link>
        </div>
        <h1 className="my-5 font-poppins text-4xl md:text-[54px] font-medium">
          Shop Page
        </h1>
        <p className="text-base md:text-[20px] text-[#121212]">
          Let's design the place you always imagined.
        </p>
      </div>
    </div>
  );
};

export default ShopHeader;
