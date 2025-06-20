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
    if (pathname.includes("/seller")) {
      setActiveView("seller");
    } else if (pathname.includes("/buyer")) {
      setActiveView("buyer");
    } else {
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
            <div className="relative inline-flex items-center bg-gray-100 rounded-full p-1 w-full max-w-md sm:w-auto overflow-x-auto">
              {/* Sliding background indicator */}
              <div 
                className="absolute top-1 bottom-1 bg-white shadow-sm rounded-full transition-all duration-300 ease-out"
                style={{
                  left: activeView === "seller" ? "0.25rem" : activeView === "overview" ? "33.333%" : "66.666%",
                  width: "calc(33.333% - 0.125rem)"
                }}
              />
              
              {/* Navigation buttons */}
              <Link href="/dashboard/seller/dashboard" passHref>
                <button
                  className={`relative z-10 flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 rounded-full transition-all duration-200 text-sm whitespace-nowrap ${
                    activeView === "seller"
                      ? "text-teal-700 font-semibold"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <Store className="h-4 w-4 text-orange-500" />
                  <span className="hidden xs:inline">Seller</span>
                  <span className="xs:hidden">Sell</span>
                </button>
              </Link>
              <Link href="/dashboard" passHref>
                <button
                  className={`relative z-10 flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 rounded-full transition-all duration-200 text-sm whitespace-nowrap ${
                    activeView === "overview"
                      ? "text-teal-700 font-semibold"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Overview</span>
                </button>
              </Link>
              <Link href="/dashboard/buyer/dashboard" passHref>
                <button
                  className={`relative z-10 flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 rounded-full transition-all duration-200 text-sm whitespace-nowrap ${
                    activeView === "buyer"
                      ? "text-teal-700 font-semibold"
                      : "text-gray-500 hover:text-gray-700"
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
