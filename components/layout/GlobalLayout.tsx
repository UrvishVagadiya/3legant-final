"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/layout/Header";
import Navbar from "@/components/layout/Navbar";
import NewsLetter from "@/components/sections/NewsLetter";
import Footer from "@/components/layout/Footer";
import CartDrawer from "@/components/cart/CartDrawer";
import { useStoreSync } from "@/hooks/useStoreSync";

const GlobalLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  useStoreSync();

  const isAuthPage = pathname === "/signin" || pathname === "/signup";
  const isContactPage = pathname === "/contact";
  const isCartPage = pathname === "/cart";
  const isAccountPage = pathname === "/account";
  const isResetPassword = pathname === "/reset-password";
  const isAdminPage = pathname.startsWith("/admin");

  // Admin pages have their own layout
  if (isAdminPage) {
    return <>{children}</>;
  }

  return (
    <>
      {!isAuthPage && <Header /> && !isResetPassword && <Header />}
      {!isAuthPage && <Navbar /> && !isResetPassword && <Navbar />}
      {children}
      {!isAuthPage && <NewsLetter /> &&
        !isContactPage && <NewsLetter /> &&
        !isCartPage && <NewsLetter /> &&
        !isAccountPage && <NewsLetter /> &&
        !isResetPassword && <NewsLetter />}
      {!isAuthPage && <Footer /> && !isResetPassword && <Footer />}
      <CartDrawer />
    </>
  );
};

export default GlobalLayout;
