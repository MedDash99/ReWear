// app/dashboard/layout.js
"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { Store, ShoppingBag, LayoutDashboard } from "lucide-react";
import MinimalHeader from "@/components/ui/minimalHeader"; // Make sure this path is correct
import Link from 'next/link';
import { usePathname } from 'next/navigation';
// import PageTransition from '@/components/pageTransition'; // Make sure path is correct if you re-enable

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const userName = session?.user?.name || "User";
  const pathname = usePathname();

  const [activeView, setActiveView] = useState("overview");

  useEffect(() => {
    // Using startsWith for more flexibility if these dashboards have sub-pages
    if (pathname.startsWith("/dashboard/seller/dashboard")) { // Check without trailing slash or use startsWith
      setActiveView("seller");
    } else if (pathname.startsWith("/dashboard/buyer/dashboard")) {
      setActiveView("buyer");
    } else if (pathname === "/dashboard" || pathname.startsWith("/dashboard/overview")) { // overview could also use startsWith
      setActiveView("overview");
    }
  }, [pathname]);

  return (
    <main className="max-w-5xl mx-auto px-4 py-6 sm:py-10 space-y-6 sm:space-y-8">
      <MinimalHeader />
      <div className="text-center">
        <h1 className="text-2xl sm:text-3xl font-bold">Hello, {userName}</h1>
        <div className="flex justify-center mt-4">
          <div className="inline-flex items-center bg-muted rounded-full p-1 w-full max-w-md sm:w-auto overflow-x-auto">
            {/* Seller Button - CORRECTED HREF */}
            <Link href="/dashboard/seller/dashboard" passHref>
              <button
                className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 rounded-full transition-all text-sm whitespace-nowrap ${
                  activeView === "seller" ? "bg-white shadow text-foreground font-semibold" : "text-muted-foreground"
                }`}
              >
                <Store className="h-4 w-4 text-orange-500" /> 
                <span className="hidden xs:inline">Seller</span>
                <span className="xs:hidden">Sell</span>
              </button>
            </Link>

            {/* Overview Button (links to the main dashboard page) */}
            <Link href="/dashboard" passHref>
              <button
                className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 rounded-full transition-all text-sm whitespace-nowrap ${
                  activeView === "overview" ? "bg-white shadow text-foreground font-semibold" : "text-muted-foreground"
                }`}
              >
                <LayoutDashboard className="h-4 w-4" /> 
                <span>Overview</span>
              </button>
            </Link>

            {/* Buyer Button - CORRECTED HREF */}
            <Link href="/dashboard/buyer/dashboard" passHref>
              <button
                className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 rounded-full transition-all text-sm whitespace-nowrap ${
                  activeView === "buyer" ? "bg-white shadow text-foreground font-semibold" : "text-muted-foreground"
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

      <div className="mt-6">
        {/* If you re-enable PageTransition, ensure the import path is correct:
            e.g., import PageTransition from '@/components/PageTransition';
            (assuming PageTransition.js is in a top-level components folder)
        */}
        {/* <PageTransition> */}
          {children}
        {/* </PageTransition> */}
      </div>
    </main>
  );
}