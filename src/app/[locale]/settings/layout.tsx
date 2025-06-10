"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { 
  User, 
  CreditCard, 
  Truck, 
  Settings as SettingsIcon, 
  Bell, 
  Shield, 
  Lock,
  ChevronRight
} from "lucide-react";
import MinimalHeader from "@/components/ui/minimalHeader";
import Link from "next/link";
import { usePathname } from "next/navigation";

const settingsNavItems = [
  {
    title: "Profile details",
    href: "/settings/profile",
    icon: User,
  },
  {
    title: "Account settings", 
    href: "/settings/account",
    icon: SettingsIcon,
  },
  {
    title: "Shipping",
    href: "/settings/shipping", 
    icon: Truck,
  },
  {
    title: "Payments",
    href: "/settings/payments",
    icon: CreditCard,
  },
  {
    title: "Bundle discounts",
    href: "/settings/bundle-discounts",
    icon: SettingsIcon,
  },
  {
    title: "Preferences",
    href: "/settings/preferences",
    icon: SettingsIcon,
  },
  {
    title: "Notifications", 
    href: "/settings/notifications",
    icon: Bell,
  },
  {
    title: "Privacy settings",
    href: "/settings/privacy",
    icon: Shield,
  },
  {
    title: "Security",
    href: "/settings/security", 
    icon: Lock,
  },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#F6F6F6]">
      <MinimalHeader />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Settings</h2>
              <nav className="space-y-2">
                {settingsNavItems.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                        isActive
                          ? "bg-teal-50 text-teal-700 font-medium"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </div>
                      <ChevronRight className="h-4 w-4 opacity-50" />
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
} 