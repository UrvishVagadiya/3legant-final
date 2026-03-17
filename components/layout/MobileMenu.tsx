"use client";

import { X, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import MobileSearch from "./MobileSearch";
import MobileMenuFooter from "./MobileMenuFooter";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
}

const navItems = [
  { label: "Home", href: "/" },
  {
    label: "Shop",
    children: [
      { label: "All Products", href: "/shop" },
      { label: "Living Room", href: "/shop?category=Living+Room" },
      { label: "Bedroom", href: "/shop?category=Bedroom" },
      { label: "Kitchen", href: "/shop?category=Kitchen" },
    ],
  },
  {
    label: "Product",
    children: [{ label: "Product Page", href: "/product" }],
  },
  { label: "Contact Us", href: "/contact" },
];

const MobileMenu = ({ isOpen, onClose, user }: MobileMenuProps) => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.width = "100%";
      document.body.style.top = `-${window.scrollY}px`;
    } else {
      const scrollY = document.body.style.top;
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
      document.body.style.top = "";
      window.scrollTo(0, parseInt(scrollY || "0") * -1);
      setOpenDropdown(null);
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
      document.body.style.top = "";
    };
  }, [isOpen]);

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/40 z-9998 transition-opacity duration-300 md:hidden ${
          isOpen
            ? "opacity-100 visible"
            : "opacity-0 invisible pointer-events-none"
        }`}
        style={{ touchAction: "none" }}
        onClick={onClose}
      />

      <div
        className={`fixed top-0 left-0 bottom-0 w-70 sm:w-80 bg-white z-9999 flex flex-col transition-transform duration-300 ease-in-out md:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={
          {
            height: "100dvh",
            touchAction: "none",
            overscrollBehavior: "none",
          } as React.CSSProperties
        }
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
          <Link href="/" onClick={onClose}>
            <h3 className="font-medium text-xl text-[#141718]">3legant.</h3>
          </Link>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-[#141718]" />
          </button>
        </div>

        <MobileSearch onResultClick={onClose} />

        <nav className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-5">
          {navItems.map((item) => (
            <div key={item.label} className="border-b border-gray-100">
              {item.children ? (
                <>
                  <button
                    onClick={() =>
                      setOpenDropdown(
                        openDropdown === item.label ? null : item.label,
                      )
                    }
                    className="flex items-center justify-between w-full py-3.5 text-sm font-medium text-[#141718]"
                  >
                    {item.label}
                    <ChevronDown
                      className={`w-4 h-4 text-[#6C7275] transition-transform duration-200 ${
                        openDropdown === item.label ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {openDropdown === item.label && (
                    <div className="pb-3 pl-4 flex flex-col gap-2">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          onClick={onClose}
                          className="text-sm text-[#6C7275] hover:text-[#141718] transition-colors py-1"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <Link
                  href={item.href!}
                  onClick={onClose}
                  className="block py-3.5 text-sm font-medium text-[#141718]"
                >
                  {item.label}
                </Link>
              )}
            </div>
          ))}
        </nav>

        <MobileMenuFooter user={user} onClose={onClose} />
      </div>
    </>
  );
};

export default MobileMenu;
