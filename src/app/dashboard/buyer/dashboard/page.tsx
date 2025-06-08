// src/app/dashboard/buyer/dashboard/page.tsx
"use client";

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { ShoppingBag, Heart, Bell, HelpCircle, Inbox, CheckCircle, XCircle } from 'lucide-react';

// Define types for data
interface Order {
  id: string;
  item: string;
  status: 'Shipped' | 'Delivered' | 'Processing' | 'Canceled';
}

interface SavedItem {
  id: string;
  name: string;
  price: number; 
}

interface Offer {
  id: string;
  offer_price: number;
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  updated_at: string;
  product_id: number;
  product_name: string;
  product_price: number;
  product_image: string;
  seller_name: string;
}

// Loading skeleton components
const ProfileSkeleton = () => (
  <section className="bg-white rounded-2xl shadow-md p-6 mb-8 animate-pulse">
    <div className="flex items-center gap-6">
      <div className="w-20 h-20 rounded-full bg-gray-200"></div>
      <div className="space-y-2">
        <div className="h-6 bg-gray-200 rounded w-48"></div>
        <div className="h-4 bg-gray-200 rounded w-64"></div>
      </div>
    </div>
  </section>
);

const OrderItemSkeleton = () => (
  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl animate-pulse">
    <div className="space-y-2">
      <div className="h-4 bg-gray-200 rounded w-32"></div>
      <div className="h-6 bg-gray-200 rounded w-16"></div>
    </div>
    <div className="h-8 bg-gray-200 rounded w-20"></div>
  </div>
);

const SavedItemSkeleton = () => (
  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl animate-pulse">
    <div className="space-y-2">
      <div className="h-4 bg-gray-200 rounded w-36"></div>
      <div className="h-5 bg-gray-200 rounded w-16"></div>
    </div>
    <div className="h-8 bg-gray-200 rounded w-20"></div>
  </div>
);

const OfferItemSkeleton = () => (
  <div className="flex items-center gap-6 p-4 bg-gray-50 rounded-xl animate-pulse">
    <div className="w-16 h-16 bg-gray-200 rounded-xl"></div>
    <div className="flex-1 space-y-2">
      <div className="h-5 bg-gray-200 rounded w-48"></div>
      <div className="h-3 bg-gray-200 rounded w-32"></div>
      <div className="h-4 bg-gray-200 rounded w-40"></div>
      <div className="h-3 bg-gray-200 rounded w-56"></div>
      <div className="h-3 bg-gray-200 rounded w-28"></div>
    </div>
    <div className="flex flex-col items-end gap-3 min-w-fit">
      <div className="h-6 bg-gray-200 rounded-full w-20"></div>
      <div className="h-6 bg-gray-200 rounded w-24"></div>
    </div>
  </div>
);

const NotificationSkeleton = () => (
  <div className="p-3 bg-gray-50 rounded-lg animate-pulse">
    <div className="h-4 bg-gray-200 rounded w-full"></div>
  </div>
);

const BuyerDashboard: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loadingOffers, setLoadingOffers] = useState(true);
  const [pageLoading, setPageLoading] = useState(true);

  // --- Placeholder Data --- 
  const currentOrders: Order[] = [
    { id: '123', item: 'Cool Gadget', status: 'Shipped' },
    { id: '124', item: 'Another Thing', status: 'Processing' },
  ];
  const savedItems: SavedItem[] = [
    { id: 's1', name: 'Wishlist Item 1', price: 29.99 },
    { id: 's2', name: 'Maybe Later Item', price: 105.50 },
  ];
  const notifications: string[] = [
    'Message from SellerX regarding order #123',
    'Price drop on Wishlist Item 1!',
  ];

  // Simulate initial page loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setPageLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Fetch offers
  useEffect(() => {
    if (session?.user) {
      fetchOffers();
    }
  }, [session]);

  const fetchOffers = async () => {
    try {
      setLoadingOffers(true);
      const response = await fetch('/api/offers');
      if (!response.ok) throw new Error('Failed to fetch offers');
      const data = await response.json();
      setOffers(data);
    } catch (error) {
      console.error('Error fetching offers:', error);
      toast.error('Failed to load offers');
    } finally {
      setLoadingOffers(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-700';
      case 'rejected':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'Accepted';
      case 'rejected':
        return 'Rejected';
      default:
        return 'Pending';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle className="w-4 h-4" />;
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Inbox className="w-4 h-4" />;
    }
  };

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case 'Shipped':
        return 'bg-blue-100 text-blue-800';
      case 'Delivered':
        return 'bg-green-100 text-green-800';
      case 'Processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'Canceled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  // --- Handlers --- 
  const handleEditProfile = () => {
    console.log('Navigate to edit profile page or open modal');
    // router.push('/profile/edit');
  };
  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log(`Searching for: ${searchTerm}`);
    // router.push(`/search?q=${searchTerm}`);
  };
  const handleViewOrder = (orderId: string) => {
    console.log(`Viewing details for order: ${orderId}`);
    // router.push(`/orders/${orderId}`);
  };
  const handleViewSavedItem = (itemId: string) => {
    console.log(`Viewing saved item: ${itemId}`);
    // router.push(`/items/${itemId}`);
  };
  const handleContactSupport = () => {
    console.log('Navigate to support page or open chat');
    // router.push('/support');
  };
  const handleViewFAQ = () => {
    console.log('Navigate to FAQ page');
    // router.push('/faq');
  };
  const handleViewProduct = (productId: number) => {
    router.push(`/products/${productId}`);
  };

  // --- Authentication Check and Redirect --- 
  useEffect(() => {
    if (status === 'unauthenticated') {
      console.log("User is unauthenticated, redirecting to landing page...");
      router.push('/');
    }
  }, [status, router]);

  // Show loading skeleton during initial load or session loading
  if (status === 'loading' || pageLoading) {
    return (
      <div className="bg-[#F6F6F6] min-h-screen py-10 px-2 sm:px-6">
        <div className="max-w-5xl mx-auto">
          {/* HEADER SKELETON */}
          <div className="mb-8 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-64 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-48"></div>
            </div>
            <div className="w-32 h-10 bg-gray-200 rounded-full animate-pulse"></div>
          </div>

          {/* PROFILE SKELETON */}
          <ProfileSkeleton />

          {/* ORDERS AND SAVED ITEMS SKELETON */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Current Orders Skeleton */}
            <section className="bg-white rounded-2xl shadow-md p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-5 bg-gray-200 rounded w-32 animate-pulse"></div>
              </div>
              <div className="flex flex-col gap-4">
                <OrderItemSkeleton />
                <OrderItemSkeleton />
              </div>
            </section>

            {/* Saved Items Skeleton */}
            <section className="bg-white rounded-2xl shadow-md p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-5 bg-gray-200 rounded w-24 animate-pulse"></div>
              </div>
              <div className="flex flex-col gap-4">
                <SavedItemSkeleton />
                <SavedItemSkeleton />
              </div>
            </section>
          </div>

          {/* OFFERS SKELETON */}
          <section className="bg-white rounded-2xl shadow-md p-6 mb-8">
            <div className="h-6 bg-gray-200 rounded w-24 mb-4 animate-pulse"></div>
            <div className="flex flex-col gap-5">
              <OfferItemSkeleton />
              <OfferItemSkeleton />
              <OfferItemSkeleton />
            </div>
          </section>

          {/* NOTIFICATIONS SKELETON */}
          <section className="bg-white rounded-2xl shadow-md p-6 mb-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-5 bg-gray-200 rounded w-28 animate-pulse"></div>
            </div>
            <div className="flex flex-col gap-3">
              <NotificationSkeleton />
              <NotificationSkeleton />
            </div>
          </section>

          {/* SUPPORT SKELETON */}
          <section className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-5 bg-gray-200 rounded w-16 animate-pulse"></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="h-10 bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="h-10 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
          </section>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="bg-[#F6F6F6] min-h-screen py-10 px-2 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="py-12 text-center text-gray-400 text-base">Access Denied. Redirecting...</div>
        </div>
      </div>
    );
  }

  const userName = session.user?.name ?? 'Buyer';
  const profileImageUrl = session.user?.image ?? '/default-profile.png';

  return (
    <div className="bg-[#F6F6F6] min-h-screen py-10 px-2 sm:px-6">
      <div className="max-w-5xl mx-auto">
        {/* HEADER */}
        <div className="mb-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Buyer Dashboard</h1>
            <p className="text-gray-500 mt-1">Welcome, {userName}!</p>
          </div>
          <Button onClick={handleEditProfile} className="bg-teal-600 hover:bg-teal-700 rounded-full text-base px-6 py-2 font-semibold shadow">
            Edit Profile
          </Button>
        </div>

        {/* PROFILE SECTION */}
        <section className="bg-white rounded-2xl shadow-md p-6 mb-8">
          <div className="flex items-center gap-6">
            <img
              src={profileImageUrl}
              alt="Profile"
              className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
              referrerPolicy="no-referrer"
            />
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">Welcome back, {userName}!</h2>
              <p className="text-gray-600">Manage your orders, offers, and saved items</p>
            </div>
          </div>
        </section>

        {/* ORDERS AND SAVED ITEMS - Side by Side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Current Orders */}
          <section className="bg-white rounded-2xl shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <ShoppingBag className="w-6 h-6 text-teal-600" />
              Current Orders
            </h3>
            {currentOrders.length > 0 ? (
              <div className="flex flex-col gap-4">
                {currentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:shadow-lg transition-shadow">
                    <div>
                      <div className="font-semibold text-gray-800 mb-1">{order.item}</div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getOrderStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                    <Button 
                      onClick={() => handleViewOrder(order.id)}
                      variant="ghost"
                      className="text-teal-600 hover:text-teal-700 text-sm"
                    >
                      View Details
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-gray-400">No current orders.</div>
            )}
          </section>

          {/* Saved Items */}
          <section className="bg-white rounded-2xl shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Heart className="w-6 h-6 text-teal-600" />
              Saved Items
            </h3>
            {savedItems.length > 0 ? (
              <div className="flex flex-col gap-4">
                {savedItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:shadow-lg transition-shadow">
                    <div>
                      <div className="font-semibold text-gray-800 mb-1">{item.name}</div>
                      <div className="text-teal-600 font-bold">₪{item.price.toFixed(2)}</div>
                    </div>
                    <Button 
                      onClick={() => handleViewSavedItem(item.id)}
                      variant="ghost"
                      className="text-teal-600 hover:text-teal-700 text-sm"
                    >
                      View Item
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-gray-400">No saved items.</div>
            )}
          </section>
        </div>

        {/* MY OFFERS SECTION */}
        <section className="bg-white rounded-2xl shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">My Offers</h2>
          {loadingOffers ? (
            <div className="flex flex-col gap-5">
              <OfferItemSkeleton />
              <OfferItemSkeleton />
              <OfferItemSkeleton />
            </div>
          ) : offers.length > 0 ? (
            <div className="flex flex-col gap-5">
              {offers.map((offer) => (
                <div key={offer.id} className="flex items-center gap-6 p-4 bg-gray-50 rounded-xl hover:shadow-lg transition-shadow">
                  <img 
                    src={offer.product_image} 
                    alt={offer.product_name}
                    className="w-16 h-16 rounded-xl object-cover border"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-lg text-gray-800 truncate mb-1">{offer.product_name}</h4>
                    <p className="text-sm text-gray-500 mb-2">Seller: {offer.seller_name}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="font-bold text-teal-600">My Offer: ₪{offer.offer_price.toFixed(2)}</span>
                      <span className="text-gray-500">(Original: ₪{offer.product_price.toFixed(2)})</span>
                    </div>
                    {offer.message && (
                      <p className="text-xs text-gray-400 italic mt-1">"{offer.message}"</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      Offered on: {new Date(offer.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-3 min-w-fit">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${getStatusColor(offer.status)}`}>
                      {getStatusIcon(offer.status)}
                      {getStatusText(offer.status)}
                    </span>
                    <Button 
                      onClick={() => handleViewProduct(offer.product_id)}
                      variant="ghost"
                      className="text-teal-600 hover:text-teal-700 text-xs"
                    >
                      View Product
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-gray-400">
              No offers made yet.{' '}
              <Button 
                onClick={() => router.push('/')} 
                variant="ghost"
                className="text-teal-600 hover:text-teal-700 p-0 text-base"
              >
                Browse products to make offers!
              </Button>
            </div>
          )}
        </section>

        {/* NOTIFICATIONS */}
        <section className="bg-white rounded-2xl shadow-md p-6 mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Bell className="w-6 h-6 text-teal-600" />
            Notifications
          </h3>
          {notifications.length > 0 ? (
            <div className="flex flex-col gap-3">
              {notifications.map((note, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg text-gray-700 text-sm">
                  {note}
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-gray-400">No new notifications.</div>
          )}
        </section>

        {/* SUPPORT */}
        <section className="bg-white rounded-2xl shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <HelpCircle className="w-6 h-6 text-teal-600" />
            Support
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button 
              onClick={handleViewFAQ} 
              variant="outline"
              className="w-full rounded-lg font-medium"
            >
              View FAQ
            </Button>
            <Button 
              onClick={handleContactSupport} 
              variant="outline"
              className="w-full rounded-lg font-medium"
            >
              Contact Support
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default BuyerDashboard;