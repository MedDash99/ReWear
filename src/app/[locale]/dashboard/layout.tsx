"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { Store, ShoppingBag, LayoutDashboard } from "lucide-react";
import MinimalHeader from "@/components/ui/minimalHeader";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const userName = session?.user?.name || "User";
  const pathname = usePathname();

  const [activeView, setActiveView] = useState("overview");

  useEffect(() => {
    if (pathname.startsWith("/dashboard/seller/dashboard")) {
      setActiveView("seller");
    } else if (pathname.startsWith("/dashboard/buyer/dashboard")) {
      setActiveView("buyer");
    } else if (pathname === "/dashboard" || pathname.startsWith("/dashboard/overview")) {
      setActiveView("overview");
    }
  }, [pathname]);

  return (
    <div className="min-h-screen bg-[#F6F6F6]">
      {/* Header outside of main container for full-width, left-aligned logo */}
      <MinimalHeader />
      
      <main className="max-w-5xl mx-auto px-4 py-8 flex flex-col gap-8">
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-bold">Hello, {userName}</h1>
          <div className="flex justify-center mt-4">
            <div className="inline-flex items-center bg-gray-100 rounded-full p-1 w-full max-w-md sm:w-auto overflow-x-auto">
              <Link href="/dashboard/seller/dashboard" passHref>
                <button
                  className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 rounded-full transition-all text-sm whitespace-nowrap ${
                    activeView === "seller"
                      ? "bg-white shadow text-teal-700 font-semibold"
                      : "text-gray-500"
                  }`}
                >
                  <Store className="h-4 w-4 text-orange-500" />
                  <span className="hidden xs:inline">Seller</span>
                  <span className="xs:hidden">Sell</span>
                </button>
              </Link>
              <Link href="/dashboard" passHref>
                <button
                  className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 rounded-full transition-all text-sm whitespace-nowrap ${
                    activeView === "overview"
                      ? "bg-white shadow text-teal-700 font-semibold"
                      : "text-gray-500"
                  }`}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Overview</span>
                </button>
              </Link>
              <Link href="/dashboard/buyer/dashboard" passHref>
                <button
                  className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 rounded-full transition-all text-sm whitespace-nowrap ${
                    activeView === "buyer"
                      ? "bg-white shadow text-teal-700 font-semibold"
                      : "text-gray-500"
                  }`}
                >
                  <ShoppingBag className="h-4 w-4" />
                  <span className="hidden xs:inline">Buyer</span>
                  <span className="xs:hidden">Buy</span>
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Main dashboard card/content (cards should use bg-white, rounded-2xl, shadow-lg, p-8) */}
        <div>{children}</div>

        {/* Optional Footer */}
        <footer className="text-center text-gray-400 mt-8 text-sm">
          © 2025 ReWear
        </footer>
      </main>
    </div>
  );
}
