// app/dashboard/page.tsx
"use client";

// Import only what's needed for the OVERVIEW content
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ShoppingBag, Package, DollarSign, MessageCircle, Eye, Activity } from "lucide-react";
import { useState, useEffect } from "react";

// Loading skeleton components
const MetricCardSkeleton = () => (
  <div className="bg-white rounded-2xl shadow-md p-6 animate-pulse">
    <div className="flex items-center gap-3 mb-3">
      <div className="w-6 h-6 bg-gray-200 rounded"></div>
      <div className="h-4 bg-gray-200 rounded w-24"></div>
    </div>
    <div className="h-8 bg-gray-200 rounded w-16"></div>
  </div>
);

const SectionSkeleton = ({ title }: { title: string }) => (
  <section className="bg-white rounded-2xl shadow-md p-6 mb-8">
    <div className="flex items-center gap-2 mb-4">
      <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
      <div className="h-5 bg-gray-200 rounded w-32 animate-pulse"></div>
    </div>
    <div className="bg-gray-50 rounded-xl p-8">
      <div className="animate-pulse space-y-3">
        <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
      </div>
    </div>
  </section>
);

const ActionButtonSkeleton = () => (
  <div className="h-12 bg-gray-200 rounded-lg animate-pulse w-full sm:w-48"></div>
);

export default function OverviewDashboardPage() {
  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading for demonstration - in real app this would be actual data fetching
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="bg-[#F6F6F6] min-h-screen py-10 px-2 sm:px-6">
        <div className="max-w-5xl mx-auto">
          {/* HEADER SKELETON */}
          <div className="mb-8 animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-80"></div>
          </div>

          {/* SUMMARY CARDS SKELETON */}
          <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <MetricCardSkeleton />
            <MetricCardSkeleton />
            <MetricCardSkeleton />
            <MetricCardSkeleton />
          </div>

          {/* ACTION BUTTONS SKELETON */}
          <section className="bg-white rounded-2xl shadow-md p-6 mb-8">
            <div className="h-6 bg-gray-200 rounded w-32 mb-6 animate-pulse"></div>
            <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-4">
              <ActionButtonSkeleton />
              <ActionButtonSkeleton />
            </div>
          </section>

          {/* RECENT ORDERS SKELETON */}
          <SectionSkeleton title="Recent Orders Summary" />

          {/* MESSAGES SKELETON */}
          <SectionSkeleton title="Messages Overview" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F6F6F6] min-h-screen py-10 px-2 sm:px-6">
      <div className="max-w-5xl mx-auto">
        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Overview</h1>
          <p className="text-gray-500">Get a complete view of your ReWear activity</p>
        </div>

        {/* SUMMARY CARDS */}
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-md p-6 hover:bg-teal-600 hover:text-white hover:-translate-y-1 transition-all duration-200 cursor-pointer group">
            <div className="flex items-center gap-3 mb-3">
              <ShoppingBag className="w-6 h-6 text-teal-600 group-hover:text-white" />
              <h3 className="text-base font-semibold">Overall Purchases</h3>
            </div>
            <p className="text-2xl font-bold text-teal-600 group-hover:text-white">Data Here</p>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6 hover:bg-teal-600 hover:text-white hover:-translate-y-1 transition-all duration-200 cursor-pointer group">
            <div className="flex items-center gap-3 mb-3">
              <Package className="w-6 h-6 text-teal-600 group-hover:text-white" />
              <h3 className="text-base font-semibold">Overall Listings</h3>
            </div>
            <p className="text-2xl font-bold text-teal-600 group-hover:text-white">Data Here</p>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6 hover:bg-teal-600 hover:text-white hover:-translate-y-1 transition-all duration-200 cursor-pointer group">
            <div className="flex items-center gap-3 mb-3">
              <DollarSign className="w-6 h-6 text-teal-600 group-hover:text-white" />
              <h3 className="text-base font-semibold">Total Sales</h3>
            </div>
            <p className="text-2xl font-bold text-teal-600 group-hover:text-white">Data Here</p>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6 hover:bg-teal-600 hover:text-white hover:-translate-y-1 transition-all duration-200 cursor-pointer group">
            <div className="flex items-center gap-3 mb-3">
              <MessageCircle className="w-6 h-6 text-teal-600 group-hover:text-white" />
              <h3 className="text-base font-semibold">Messages</h3>
            </div>
            <p className="text-2xl font-bold text-teal-600 group-hover:text-white">Data Here</p>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <section className="bg-white rounded-2xl shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Quick Actions</h2>
          <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-4">
            <Button 
              variant="outline" 
              className="hover:bg-black hover:text-white transition-colors text-base font-medium rounded-lg px-6 py-3 flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              Browse All Items
            </Button>
            <Button 
              variant="outline" 
              className="hover:bg-black hover:text-white transition-colors text-base font-medium rounded-lg px-6 py-3 flex items-center gap-2"
            >
              <Activity className="w-4 h-4" />
              View Recent Activity
            </Button>
          </div>
        </section>

        {/* RECENT ORDERS SUMMARY */}
        <section className="bg-white rounded-2xl shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-teal-600" />
            Recent Orders Summary
          </h2>
          <div className="bg-gray-50 rounded-xl p-8 text-center">
            <p className="text-gray-600">No recent orders to display</p>
          </div>
        </section>

        {/* MESSAGES OVERVIEW */}
        <section className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <MessageCircle className="w-6 h-6 text-teal-600" />
            Messages Overview
          </h2>
          <div className="bg-gray-50 rounded-xl p-8 text-center">
            <p className="text-gray-600">No new messages</p>
          </div>
        </section>
      </div>
    </div>
  );
}