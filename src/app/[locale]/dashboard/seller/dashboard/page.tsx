// src/app/seller-dashboard/page.tsx
'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useState, useEffect, useCallback } from 'react';
import { Pencil, Trash2, DollarSign, Inbox, CheckCircle, XCircle, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import Link from 'next/link';
import { ConversationList } from '@/components/messaging';
import { useMessaging } from '@/contexts/MessagingContext';

// Types
interface Listing {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  status: 'Active' | 'Sold' | 'Draft';
  seller: {
    name: string;
    avatarUrl: string;
  };
}

interface Offer {
  id: string;
  offer_price: number;
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  updated_at: string;
  buyer_name: string;
  buyer_email: string;
}

interface OfferOnProduct {
  product_id: number;
  product_name: string;
  product_price: number;
  product_image: string;
  offers: Offer[];
}

interface Order {
  id: string;
  buyerName: string;
  item: string;
  status: 'Pending' | 'Shipped' | 'Delivered' | 'Canceled';
}

// Loading skeleton components
const MetricCardSkeleton = () => (
  <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col items-center animate-pulse">
    <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
    <div className="h-4 bg-gray-200 rounded w-24"></div>
    <div className="h-8 bg-gray-200 rounded w-full mt-3"></div>
  </div>
);

const ListingItemSkeleton = () => (
  <li className="flex items-center gap-6 p-4 bg-gray-50 rounded-xl animate-pulse">
    <div className="w-20 h-20 bg-gray-200 rounded-xl"></div>
    <div className="flex-1 min-w-0 space-y-2">
      <div className="h-5 bg-gray-200 rounded w-48"></div>
      <div className="h-3 bg-gray-200 rounded w-24"></div>
      <div className="h-4 bg-gray-200 rounded w-16"></div>
      <div className="h-6 bg-gray-200 rounded-full w-16"></div>
    </div>
    <div className="flex flex-col gap-2 min-w-fit">
      <div className="h-8 bg-gray-200 rounded-lg w-16"></div>
      <div className="h-8 bg-gray-200 rounded-lg w-16"></div>
      <div className="h-8 bg-gray-200 rounded-lg w-20"></div>
    </div>
  </li>
);

const OfferProductSkeleton = () => (
  <div className="bg-gray-50 rounded-xl p-4 animate-pulse">
    <div className="flex items-center gap-4 mb-4">
      <div className="w-14 h-14 bg-gray-200 rounded-lg"></div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-32"></div>
        <div className="h-3 bg-gray-200 rounded w-24"></div>
        <div className="h-3 bg-gray-200 rounded w-16"></div>
      </div>
    </div>
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-5 p-3 bg-white rounded-lg border">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-4 bg-gray-200 rounded w-24"></div>
            <div className="h-3 bg-gray-200 rounded w-16"></div>
          </div>
          <div className="h-3 bg-gray-200 rounded w-40"></div>
        </div>
        <div className="flex flex-col gap-1 items-end min-w-[110px]">
          <div className="h-6 bg-gray-200 rounded-full w-20"></div>
          <div className="flex gap-2 mt-1">
            <div className="h-6 bg-gray-200 rounded-lg w-12"></div>
            <div className="h-6 bg-gray-200 rounded-lg w-12"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const OrderItemSkeleton = () => (
  <li className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-gray-50 p-4 rounded-lg animate-pulse">
    <div className="space-y-2">
      <div className="h-4 bg-gray-200 rounded w-24"></div>
      <div className="h-3 bg-gray-200 rounded w-40"></div>
    </div>
    <div className="flex items-center gap-3">
      <div className="h-6 bg-gray-200 rounded-full w-16"></div>
      <div className="h-8 bg-gray-200 rounded-lg w-20"></div>
      <div className="h-8 bg-gray-200 rounded-lg w-24"></div>
    </div>
  </li>
);

const MessageSkeleton = () => (
  <li className="bg-gray-50 px-4 py-2 rounded-lg animate-pulse">
    <div className="h-4 bg-gray-200 rounded w-full"></div>
  </li>
);

// Accordion Components for Offers
const ItemAccordion: React.FC<{ 
  item: OfferOnProduct, 
  isOpen: boolean, 
  onToggle: () => void,
  onOfferAction: (offerId: string, action: 'accepted' | 'rejected') => Promise<void>
}> = ({ item, isOpen, onToggle, onOfferAction }) => {
    const pendingOffersCount = item.offers.filter(o => o.status === 'pending').length;

    return (
        <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
            {/* Accordion Header/Trigger */}
            <button 
                className="w-full flex items-center p-4 cursor-pointer hover:bg-gray-50 transition-colors text-left border-none bg-transparent"
                onClick={() => {
                    console.log('Accordion clicked for item:', item.product_id);
                    onToggle();
                }}
                type="button"
            >
                <img 
                    src={item.product_image} 
                    alt={item.product_name} 
                    className="w-16 h-16 rounded-lg object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/64x64/e2e8f0/e2e8f0?text='; }}
                />
                <div className="flex-1 ml-4">
                    <p className="font-semibold text-gray-800 text-lg">{item.product_name}</p>
                    <p className="text-gray-500">Listed Price: ₪{item.product_price}</p>
                </div>
                <div className="flex items-center space-x-3">
                     {pendingOffersCount > 0 && (
                        <span className="text-sm font-semibold text-teal-600 bg-teal-50 px-3 py-1 rounded-full">
                            {pendingOffersCount} New Offer{pendingOffersCount > 1 ? 's' : ''}
                        </span>
                    )}
                    <svg 
                        className={`w-6 h-6 text-gray-400 transition-transform transform ${isOpen ? 'rotate-180' : ''}`} 
                        xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </button>

            {/* Accordion Body: Collapsible content area */}
            <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
                isOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
            }`}>
                <div className="bg-gray-50 p-4 space-y-4 border-t border-gray-200">
                    {item.offers.length > 0 ? (
                      item.offers.map(offer => <OfferCard key={offer.id} offer={offer} onOfferAction={onOfferAction} />)
                    ) : (
                      <p className="text-center text-gray-500 text-sm py-4">No offers for this item yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

const OfferCard: React.FC<{ 
  offer: Offer,
  onOfferAction: (offerId: string, action: 'accepted' | 'rejected') => Promise<void>
}> = ({ offer, onOfferAction }) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAction = async (action: 'accepted' | 'rejected') => {
    setIsProcessing(true);
    try {
      await onOfferAction(offer.id, action);
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusDisplay = () => {
      switch (offer.status) {
          case 'accepted':
              return (
                  <div className="flex items-center space-x-2 text-teal-600 font-semibold">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                      <span>Accepted</span>
                  </div>
              );
          case 'rejected':
              return (
                  <div className="flex items-center space-x-2 text-red-600 font-semibold">
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                       <span>Rejected</span>
                  </div>
              );
          default:
              return null; // For 'pending', we show buttons instead.
      }
  };

  return (
    <div className="bg-white p-3 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-600 font-semibold text-sm">
                        {offer.buyer_name?.charAt(0).toUpperCase() || 'U'}
                    </span>
                </div>
                <div className="flex-1">
                    <p className="font-semibold text-gray-800">{offer.buyer_name}</p>
                    <p className="text-gray-600 italic text-sm">"{offer.message}"</p>
                    <p className="text-gray-400 text-xs">{new Date(offer.created_at).toLocaleDateString()}</p>
                </div>
            </div>
             <p className="font-bold text-lg text-gray-800">₪{offer.offer_price}</p>
        </div>
        
        {offer.status === 'pending' ? (
            <div className="flex justify-end items-center space-x-2 mt-2">
                <button 
                    onClick={() => handleAction('rejected')}
                    disabled={isProcessing}
                    className="bg-white text-gray-700 font-semibold py-1.5 px-6 rounded-full text-sm border border-gray-300 hover:bg-gray-100 transition-colors disabled:opacity-50"
                >
                    Reject
                </button>
                <button 
                    onClick={() => handleAction('accepted')}
                    disabled={isProcessing}
                    className="bg-teal-500 text-white font-semibold py-1.5 px-6 rounded-full text-sm hover:bg-teal-600 transition-colors disabled:opacity-50"
                >
                    Accept
                </button>
            </div>
        ) : (
             <div className="flex justify-end items-center mt-2">
                {getStatusDisplay()}
            </div>
        )}
    </div>
  );
};

export default function SellerDashboard() {
  const { data: session } = useSession();
  const router = useRouter();
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [offers, setOffers] = useState<OfferOnProduct[]>([]);
  const [loadingOffers, setLoadingOffers] = useState(true);
  const { conversations, unreadCount } = useMessaging();
  
  // State for dashboard metrics
  const [totalListed, setTotalListed] = useState<number>(0);
  const [totalSales, setTotalSales] = useState<number>(0);
  const [currentBalance, setCurrentBalance] = useState<number>(0);
  
  // State for accordion offers UI
  const [activeTab, setActiveTab] = useState<'needsAction' | 'history'>('needsAction');
  const [openItemId, setOpenItemId] = useState<number | null>(null);

  // Placeholder data for orders
  const ordersReceived: Order[] = [
    { id: 'o1', buyerName: 'Alice', item: 'Handmade Scarf', status: 'Pending' },
    { id: 'o2', buyerName: 'Bob', item: 'Old Book', status: 'Delivered' },
  ];

  // Fetch listings on component mount
  const fetchListings = async () => {
    try {
      const response = await fetch('/api/products/my-listings');
      if (!response.ok) {
        throw new Error('Failed to fetch listings');
      }
      const data = await response.json();
      setListings(data);
      setTotalListed(data.length);
      
      // Calculate total sales (sum of prices for sold items)
      const sales = data
        .filter((item: Listing) => item.status === 'Sold')
        .reduce((sum: number, item: Listing) => sum + item.price, 0);
      setTotalSales(sales);
      
      setIsLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch listings');
      setIsLoading(false);
    }
  };

  // Fetch offers
  const fetchOffers = async () => {
    try {
      setLoadingOffers(true);
      const response = await fetch('/api/seller/offers');
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

  const handleOfferAction = async (offerId: string, action: 'accepted' | 'rejected') => {
    try {
      const response = await fetch(`/api/offers/${offerId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: action }),
      });

      if (!response.ok) throw new Error(`Failed to ${action} offer`);

      const result = await response.json();
      toast.success(`Offer ${action} successfully!`);
      
      // Refresh offers and listings
      await Promise.all([fetchOffers(), fetchListings()]);
    } catch (error) {
      console.error(`Error ${action} offer:`, error);
      toast.error(`Failed to ${action} offer`);
    }
  };

  useEffect(() => {
    if (session?.user) {
      fetchListings();
      fetchOffers();
    }
  }, [session]);

  // Auto-open first item with pending offers
  useEffect(() => {
    if (offers.length > 0 && !openItemId) {
      const firstItemWithPending = offers.find(item => 
        item.offers.some(offer => offer.status === 'pending')
      );
      if (firstItemWithPending) {
        setOpenItemId(firstItemWithPending.product_id);
      }
    }
  }, [offers]); // Only depends on offers, not openItemId

  // --- Handlers ---
  const handleAddNewItem = () => {
    console.log('Navigating to add new item page');
    router.push('/dashboard/seller/listings/new');
  };

  const handleEditItem = (itemId: number) => {
    console.log(`Editing item: ${itemId}`);
    router.push(`/dashboard/seller/listings/edit/${itemId}`);
  };

  const handleDeleteItem = async (itemId: number) => {
    if (!confirm('Are you sure you want to delete this item?')) {
      return;
    }

    try {
      const response = await fetch(`/api/products/${itemId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete item');
      }

      // Update local state
      setListings(listings.filter(item => item.id !== itemId));
      setTotalListed(prev => prev - 1);
      toast.success('Item deleted successfully');
    } catch (err) {
      console.error('Error deleting item:', err);
      toast.error('Failed to delete item. Please try again.');
    }
  };

  const handleMarkAsSold = async (itemId: number) => {
    try {
      const item = listings.find(l => l.id === itemId);
      if (!item) return;

      const response = await fetch(`/api/products/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: item.name,
          description: item.description,
          price: item.price,
          category: item.category,
          status: 'Sold',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update item status');
      }

      // Update local state
      setListings(listings.map(l => 
        l.id === itemId ? { ...l, status: 'Sold' } : l
      ));
      toast.success('Item marked as sold');
    } catch (err) {
      console.error('Error marking item as sold:', err);
      toast.error('Failed to mark item as sold. Please try again.');
    }
  };

  const handleWithdraw = () => {
    console.log(`Withdrawing balance: $${currentBalance.toFixed(2)}`);
    toast.info('Withdrawal feature coming soon!');
  };

  const handleViewOrder = (orderId: string) => {
    console.log(`Viewing order details: ${orderId}`);
    router.push(`/seller/orders/${orderId}`);
  };

  // --- Utility ---
  const statusBadge = (status: string) => {
    switch (status) {
      case 'Active':   return <span className="bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-xs font-semibold">Active</span>;
      case 'Sold':     return <span className="bg-gray-200 text-gray-600 px-3 py-1 rounded-full text-xs font-semibold">Sold</span>;
      case 'Draft':    return <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-semibold">Draft</span>;
      case 'pending':  return <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1"><Inbox className="w-4 h-4" /> Pending</span>;
      case 'accepted': return <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1"><CheckCircle className="w-4 h-4" /> Accepted</span>;
      case 'rejected': return <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1"><XCircle className="w-4 h-4" /> Rejected</span>;
      case 'Pending':  return <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-semibold">Pending</span>;
      case 'Shipped':  return <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold">Shipped</span>;
      case 'Delivered': return <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold">Delivered</span>;
      case 'Canceled': return <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-semibold">Canceled</span>;
      default:         return null;
    }
  };

  // Accordion helpers
  const handleToggle = useCallback((itemId: number) => {
    console.log('handleToggle called with itemId:', itemId);
    setOpenItemId(prevId => (prevId === itemId ? null : itemId));
  }, []); // Empty dependency array - we use prevId pattern so no dependencies needed

  // Filter items based on the active tab for accordion view
  const filteredOffers = offers.filter(item => {
    if (activeTab === 'needsAction') {
      return item.offers.some(offer => offer.status === 'pending');
    } else { 
      return item.offers.length > 0 && item.offers.every(offer => offer.status !== 'pending');
    }
  });



  if (isLoading) {
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

          {/* METRICS SKELETON */}
          <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-6 mb-8">
            <MetricCardSkeleton />
            <MetricCardSkeleton />
            <MetricCardSkeleton />
          </div>

          {/* LISTINGS SKELETON */}
          <section className="bg-white rounded-2xl shadow-md p-6 mb-8">
            <div className="h-6 bg-gray-200 rounded w-32 mb-4 animate-pulse"></div>
            <ul className="flex flex-col gap-5">
              <ListingItemSkeleton />
              <ListingItemSkeleton />
              <ListingItemSkeleton />
            </ul>
          </section>

          {/* OFFERS SKELETON */}
          <section className="bg-white rounded-2xl shadow-md p-6 mb-8">
            <div className="h-6 bg-gray-200 rounded w-40 mb-4 animate-pulse"></div>
            <div className="flex flex-col gap-7">
              <OfferProductSkeleton />
              <OfferProductSkeleton />
            </div>
          </section>

          {/* ORDERS SKELETON */}
          <section className="bg-white rounded-2xl shadow-md p-6 mb-8">
            <div className="h-6 bg-gray-200 rounded w-36 mb-4 animate-pulse"></div>
            <ul className="flex flex-col gap-5">
              <OrderItemSkeleton />
              <OrderItemSkeleton />
            </ul>
          </section>

          {/* MESSAGES SKELETON */}
          <section className="bg-white rounded-2xl shadow-md overflow-hidden">
            <div className="p-4 border-b">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-6 bg-gray-200 rounded w-24 animate-pulse"></div>
              </div>
            </div>
            <div className="h-[400px] p-4 space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex items-center space-x-3 p-3">
                    <div className="rounded-full bg-gray-300 h-12 w-12"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#F6F6F6] min-h-screen py-10 px-2 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="py-12 text-center text-red-600 text-base">Error: {error}</div>
        </div>
      </div>
    );
  }

  // --- UI ---
  return (
    <div className="bg-[#F6F6F6] min-h-screen py-10 px-2 sm:px-6">
      <div className="max-w-5xl mx-auto">
        {/* HEADER */}
        <div className="mb-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Seller Dashboard</h1>
            <p className="text-gray-500 mt-1">Welcome, {session?.user?.name || 'Seller'}!</p>
          </div>
          <Button onClick={handleAddNewItem} className="bg-teal-600 hover:bg-teal-700 rounded-full text-base px-6 py-2 font-semibold shadow">
            + Add New Item
          </Button>
        </div>

        {/* METRICS */}
        <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col items-center">
            <span className="text-2xl font-bold text-teal-600">{totalListed}</span>
            <span className="text-gray-700 mt-1">Active Listings</span>
          </div>
          <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col items-center">
            <span className="text-2xl font-bold text-teal-600">
              ₪{totalSales.toFixed(2)}
            </span>
            <span className="text-gray-700 mt-1">Total Sales</span>
          </div>
          <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col items-center">
            <span className="text-2xl font-bold text-teal-600">₪{currentBalance.toFixed(2)}</span>
            <span className="text-gray-700 mt-1">Available Balance</span>
            <Button
              onClick={handleWithdraw}
              className="mt-3 w-full bg-black text-white rounded-lg hover:bg-gray-900 transition text-sm font-medium"
              disabled={currentBalance <= 0}
            >
              Withdraw Funds
            </Button>
          </div>
        </div>

        {/* LISTINGS */}
        <section className="bg-white rounded-2xl shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Your Listings</h2>
          {listings.length === 0 ? (
            <div className="py-12 text-center text-gray-400 text-base">You have no active listings.</div>
          ) : (
            <ul className="flex flex-col gap-5">
              {listings.map((item) => (
                <li key={item.id} className="flex items-center gap-6 p-4 bg-gray-50 rounded-xl hover:shadow-lg transition-shadow">
                  <img src={item.imageUrl} alt={item.name} className="w-20 h-20 rounded-xl object-cover border" />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-lg text-gray-800 truncate">{item.name}</div>
                    <div className="text-sm text-gray-500">{item.category}</div>
                    <div className="text-base font-bold text-teal-600 mt-1">₪{item.price}</div>
                    <div className="mt-2">{statusBadge(item.status)}</div>
                  </div>
                  <div className="flex flex-col gap-2 min-w-fit">
                    <button className="flex items-center gap-1 px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium transition"
                      onClick={() => handleEditItem(item.id)} title="Edit">
                      <Pencil className="w-4 h-4" /> Edit
                    </button>
                    <button className="flex items-center gap-1 px-3 py-1 rounded-lg bg-gray-100 hover:bg-red-100 text-red-600 text-sm font-medium transition"
                      onClick={() => handleDeleteItem(item.id)} title="Delete">
                      <Trash2 className="w-4 h-4" /> Delete
                    </button>
                    {item.status === "Active" && (
                      <button className="flex items-center gap-1 px-3 py-1 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium transition"
                        onClick={() => handleMarkAsSold(item.id)} title="Mark as Sold">
                        <DollarSign className="w-4 h-4" /> Mark Sold
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* OFFERS ON MY ITEMS - New Accordion UI */}
        <section className="bg-white rounded-2xl shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Offers on My Items</h2>

          {/* Tabs for filtering */}
          <div className="flex border-b border-gray-200 mb-6">
            <button
              onClick={() => setActiveTab('needsAction')}
              className={`py-2 px-4 text-lg font-semibold transition-colors ${
                activeTab === 'needsAction'
                  ? 'text-teal-500 border-b-2 border-teal-500'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Needs Action
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`py-2 px-4 text-lg font-semibold transition-colors ${
                activeTab === 'history'
                  ? 'text-teal-500 border-b-2 border-teal-500'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              History
            </button>
          </div>

          {loadingOffers ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-xl shadow-md border border-gray-200 p-4">
                  <div className="animate-pulse flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOffers.length > 0 ? (
                filteredOffers.map(item => (
                  <ItemAccordion
                    key={item.product_id}
                    item={item}
                    isOpen={openItemId === item.product_id}
                    onToggle={() => handleToggle(item.product_id)}
                    onOfferAction={handleOfferAction}
                  />
                ))
              ) : (
                <p className="text-center text-gray-500 pt-12">No items in this category.</p>
              )}
            </div>
          )}
        </section>

        {/* ORDERS RECEIVED */}
        <section className="bg-white rounded-2xl shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Orders Received</h2>
          {ordersReceived.length === 0 ? (
            <div className="py-8 text-center text-gray-400">No new orders.</div>
          ) : (
            <ul className="flex flex-col gap-5">
              {ordersReceived.map((order) => (
                <li key={order.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-gray-50 p-4 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-700">Order #{order.id}</div>
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">{order.item}</span> — <span className="font-medium">{order.buyerName}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {statusBadge(order.status)}
                    <Button
                      variant="outline"
                      className="text-xs rounded-lg"
                      onClick={() => handleViewOrder(order.id)}
                    >
                      View Details
                    </Button>
                    {order.status === "Pending" && (
                      <Button
                        className="bg-teal-600 text-white hover:bg-teal-700 rounded-lg text-xs"
                        onClick={() => toast.info("Mark Shipped feature coming soon!")}
                      >
                        Mark Shipped
                      </Button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* MESSAGES */}
        <section className="bg-white rounded-2xl shadow-md overflow-hidden">
          <ConversationList />
        </section>
      </div>
    </div>
  );
}