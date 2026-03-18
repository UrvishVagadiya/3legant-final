"use client";

import { CircleUserRound, Handbag, Menu, Search, LogOut } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { usePathname, useRouter } from "next/navigation";
import { useCartStore } from "../../store/cartStore";
import { useIsMounted } from "@/hooks/useIsMounted";
import SearchOverlay from "./SearchOverlay";
import MobileMenu from "./MobileMenu";
import toast from "react-hot-toast";

const Navbar = () => {
  const [user, setUser] = useState<any>(null);
  const supabase = createClient();
  const router = useRouter();
  const pathname = usePathname();
  const { toggleCart, items } = useCartStore();

  const cartItemCount = items.length;
  const isMounted = useIsMounted();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };

    getUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      },
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase.auth]);

  const getInitial = () => {
    if (user?.user_metadata.name) {
      return user?.user_metadata.name.charAt(0).toUpperCase() || "S";
    }
    return "U";
  };

  return (
    <div className="px-5 md:px-10 lg:px-40 py-4 md:py-5 flex items-center justify-between w-full border-b text-gray-100">
      <div className="flex items-center gap-3">
        <Menu
          onClick={() => setIsMobileMenuOpen(true)}
          className="block md:hidden cursor-pointer w-6 h-6 text-[#141718] transition-all duration-300 ease-in-out"
        />
        <Link href="/">
          <h3 className="cursor-pointer font-medium text-xl md:text-2xl text-[#141718] transition-all duration-300 ease-in-out">
            3legant.
          </h3>
        </Link>
      </div>
      <div className="hidden md:flex items-center gap-6 lg:gap-10 text-sm font-medium text-[#6C7275]">
        <Link
          href={"/"}
          className={`${
            pathname === "/" ? "text-[#141718] font-bold" : "text-[#6C7275] hover:text-[#141718]"
          } transition-colors duration-300 ease-in-out`}
        >
          Home
        </Link>
        <Link
          href={"/shop"}
          className={`${
            pathname.startsWith("/shop") ? "text-[#141718] font-bold" : "text-[#6C7275] hover:text-[#141718]"
          } transition-colors duration-300 ease-in-out`}
        >
          Shop
        </Link>
        <Link
          href={"/blogs"}
          className={`${
            pathname.startsWith("/blogs") ? "text-[#141718] font-bold" : "text-[#6C7275] hover:text-[#141718]"
          } transition-colors duration-300 ease-in-out`}
        >
          Blog
        </Link>
        <Link
          href={"/contact"}
          className={`${
            pathname.startsWith("/contact") ? "text-[#141718] font-bold" : "text-[#6C7275] hover:text-[#141718]"
          } transition-colors duration-300 ease-in-out`}
        >
          Contact Us
        </Link>
      </div>

      <div className="flex items-center gap-3 md:gap-4 text-[#141718]">
        <Search
          onClick={() => setIsSearchOpen(true)}
          className="hidden md:block cursor-pointer w-5 h-5 lg:w-6 lg:h-6 hover:text-gray-500 transition-colors duration-300 ease-in-out"
        />
        <div className="relative">
          {user ? (
            <Link
              href={"/account"}
              className="hidden md:flex cursor-pointer w-7 h-7 lg:w-8 lg:h-8 bg-[#141718] text-white rounded-full items-center justify-center text-sm font-semibold hover:bg-gray-800 transition-colors"
            >
              {getInitial()}
            </Link>
          ) : (
            <Link href={"/signin"}>
              <CircleUserRound className="hidden md:block cursor-pointer w-5 h-5 lg:w-6 lg:h-6 hover:text-gray-500 transition-colors duration-300 ease-in-out" />
            </Link>
          )}
        </div>
        <div
          onClick={() => {
            if (items.length === 0) {
              toast.error("Your cart is empty!");
              return;
            }
            toggleCart();
          }}
          className="flex items-center gap-1.5 cursor-pointer group transition-all duration-300 ease-in-out"
        >
          <Handbag className="w-5 h-5 lg:w-6 lg:h-6 group-hover:text-gray-500 transition-colors duration-300 ease-in-out" />
          {isMounted && cartItemCount > 0 && (
            <div className="bg-[#141718] text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
              {cartItemCount}
            </div>
          )}
        </div>
      </div>

      <SearchOverlay
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        user={user}
      />
    </div>
  );
};

export default Navbar;
