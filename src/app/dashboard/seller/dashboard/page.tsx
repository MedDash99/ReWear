// src/app/seller-dashboard/page.tsx
'use client';
import { Button } from '@/components/ui/button'; // Assuming this is your styled button
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
//import MinimalHeader from '@/components/ui/minimalHeader';
// Define types for data
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

interface Order {
  id: string;
  buyerName: string;
  item: string;
  status: 'Pending' | 'Shipped' | 'Delivered' | 'Canceled';
}

interface OfferOnProduct {
  product_id: number;
  product_name: string;
  product_price: number;
  product_image: string;
  offers: Array<{
    id: string;
    offer_price: number;
    message: string;
    status: 'pending' | 'accepted' | 'rejected';
    created_at: string;
    updated_at: string;
    buyer_name: string;
    buyer_email: string;
  }>;
}

const SellerDashboard: React.FC = () => {
  const { data: session } = useSession();
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [offers, setOffers] = useState<OfferOnProduct[]>([]);
  const [loadingOffers, setLoadingOffers] = useState(true);
  
  // --- State (using data that matches the image more closely for defaults) ---
  const [totalListed, setTotalListed] = useState<number>(0);
  const [totalSales, setTotalSales] = useState<number>(0);
  const [currentBalance, setCurrentBalance] = useState<number>(0);

  // Placeholder data for orders and messages
  const ordersReceived: Order[] = [
    { id: 'o1', buyerName: 'Alice', item: 'Handmade Scarf', status: 'Pending' },
    { id: 'o2', buyerName: 'Bob', item: 'Old Book', status: 'Delivered' },
  ];

  const messages: string[] = [
    'Inquiry about Vintage Lamp from Charlie',
    'Question about shipping for order #o1',
  ];

  // Fetch listings on component mount
  const fetchListings = async () => {
    try {
      // Use the secure endpoint that only returns the current user's listings
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
    }
  }, [session]);

  // Fetch offers
  useEffect(() => {
    if (session?.user) {
      fetchOffers();
    }
  }, [session]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return { backgroundColor: '#d4edda', color: '#155724' };
      case 'rejected':
        return { backgroundColor: '#f8d7da', color: '#721c24' };
      default:
        return { backgroundColor: '#fff3cd', color: '#856404' };
    }
  };

  // --- Handlers ---
  const router = useRouter();

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
    } catch (err) {
      console.error('Error deleting item:', err);
      alert('Failed to delete item. Please try again.');
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
    } catch (err) {
      console.error('Error marking item as sold:', err);
      alert('Failed to mark item as sold. Please try again.');
    }
  };

  const handleMarkAsShipped = (orderId: string) => {
    console.log(`Marking order as shipped: ${orderId}`);
    // Prompt for tracking number?
    // Call API to update order status
  };

  const handleViewOrder = (orderId: string) => {
    console.log(`Viewing order details: ${orderId}`);
    // Example: router.push(`/seller/orders/${orderId}`);
  };

  const handleWithdraw = () => {
    console.log(`Withdrawing balance: $${currentBalance.toFixed(2)}`);
    // Navigate to withdrawal page or open modal
    // Call API
  };


  // --- Styles ---
  const sectionStyle: React.CSSProperties = {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '20px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
  };

  const listItemStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 0',
    borderBottom: '1px solid #eee',
  };

  const lastListItemStyle: React.CSSProperties = { // To remove border from last item
    ...listItemStyle,
    borderBottom: 'none',
  };

  const itemDetailStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '15px', // Space between item name, price, and buttons
  };

  const itemNameStyle: React.CSSProperties = {
    flexGrow: 1, // Allow item name to take available space
    fontWeight: 500,
  };

  const itemPriceStyle: React.CSSProperties = {
    minWidth: '70px', // Ensure price alignment
    textAlign: 'right',
    color: '#555',
  };

  const actionButtonStyle: React.CSSProperties = {
    padding: '6px 12px',
    fontSize: '13px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    backgroundColor: '#f7f7f7',
    cursor: 'pointer',
    marginLeft: '5px', // Spacing between action buttons
  };
  
  const primaryButtonStyle: React.CSSProperties = { // For "Add New Item" and "Withdraw Funds"
    backgroundColor: '#28a745', // Green color from image
    color: 'white',
    padding: '8px 15px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  };


  if (isLoading) {
    return <div style={{ padding: '20px' }}>Loading...</div>;
  }

  if (error) {
    return <div style={{ padding: '20px', color: 'red' }}>Error: {error}</div>;
  }

  return (
    <div style={{ padding: '20px', fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif', backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '25px', color: '#333' }}>Seller Dashboard</h1>

      {/* 1. Welcome + Overview */}
      <section style={sectionStyle}>
        <h2 style={{ marginTop: '0', marginBottom: '10px', fontSize: '22px', fontWeight: 'normal' }}>Welcome, {session?.user?.name || 'Seller'}!</h2>
        <div style={{ display: 'flex', gap: '20px', color: '#555', fontSize: '14px' }}>
          <span>Total Items Listed: <strong>{totalListed}</strong></span>
          <span>Total Sales: <strong>${totalSales.toFixed(2)}</strong></span>
          {/* This "Current Balance" seems different from the "Earnings" section in the image.
              The image shows $50 here. If this is a distinct value, you'll need a separate state for it.
              For now, I'm reflecting the structure but you might need to adjust the data source.
              Let's assume the image's "$50" is an example and use the existing currentBalance for structure.
              If it's truly different, you'd have another state like `overviewBalance`.
          */}
          <span>Current Balance: <strong>${(50).toFixed(2)}</strong></span> {/* Hardcoding $50 as per image example for this spot */}
        </div>
      </section>

      {/* 2. Your Listings */}
      <section style={sectionStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h2 style={{ marginTop: '0', marginBottom: '0', fontSize: '20px', fontWeight: 500 }}>Your Listings</h2>
          {/* Using Button component for Add New Item */}
          <Button onClick={handleAddNewItem} style={primaryButtonStyle}>+ Add New Item</Button>
        </div>
        {listings.length > 0 ? (
          <ul style={{ listStyle: 'none', padding: '0', margin: '0' }}>
            {listings.map((item, index) => (
              <li key={item.id} style={index === listings.length - 1 ? lastListItemStyle : listItemStyle}>
                <div style={itemDetailStyle}>
                  <span style={itemNameStyle}>{item.name}</span>
                  <span style={itemPriceStyle}>${item.price.toFixed(2)}</span>
                </div>
                <div style={{display: 'flex', alignItems: 'center'}}> {/* Action buttons container */}
                  <button onClick={() => handleEditItem(item.id)} style={actionButtonStyle}>Edit</button>
                  <button onClick={() => handleDeleteItem(item.id)} style={actionButtonStyle}>Delete</button>
                  {item.status === 'Active' && (
                    <button onClick={() => handleMarkAsSold(item.id)} style={{...actionButtonStyle, backgroundColor: '#007bff', color: 'white' /* Example styling for Mark Sold */}}>Mark Sold</button>
                  )}
                  {/* The image shows "Delete" twice for "Vintage Lamp". This is likely an error in the mock.
                      Assuming standard Edit, Delete, Mark Sold actions. If a second delete means something else, adjust accordingly.
                  */}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ margin: '10px 0', color: '#777' }}>You have no active listings.</p>
        )}
      </section>

      {/* 3. Offers on My Items */}
      <section style={sectionStyle}>
        <h2 style={{ marginTop: '0', marginBottom: '15px', fontSize: '20px', fontWeight: 500 }}>Offers on My Items</h2>
        {loadingOffers ? (
          <p>Loading offers...</p>
        ) : offers.length > 0 ? (
          <div style={{ display: 'grid', gap: '20px' }}>
            {offers.map((productOffer) => (
              <div key={productOffer.product_id} style={{ 
                border: '1px solid #ddd', 
                borderRadius: '8px', 
                padding: '15px',
                backgroundColor: '#f9f9f9'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                  <img 
                    src={productOffer.product_image} 
                    alt={productOffer.product_name}
                    style={{ 
                      width: '60px', 
                      height: '60px', 
                      borderRadius: '4px', 
                      objectFit: 'cover' 
                    }}
                  />
                  <div>
                    <h4 style={{ margin: '0 0 5px 0', fontSize: '16px' }}>{productOffer.product_name}</h4>
                    <p style={{ margin: '0', fontSize: '14px', color: '#666' }}>
                      Listed Price: <strong>${productOffer.product_price.toFixed(2)}</strong>
                    </p>
                    <p style={{ margin: '0', fontSize: '14px', color: '#666' }}>
                      {productOffer.offers.length} offer{productOffer.offers.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                
                <div style={{ display: 'grid', gap: '10px' }}>
                  {productOffer.offers.map((offer) => (
                    <div key={offer.id} style={{ 
                      backgroundColor: '#fff',
                      border: '1px solid #eee',
                      borderRadius: '6px',
                      padding: '12px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: '0 0 5px 0', fontSize: '14px' }}>
                          <strong>{offer.buyer_name}</strong> offered <strong style={{ color: '#28a745' }}>${offer.offer_price.toFixed(2)}</strong>
                        </p>
                        {offer.message && (
                          <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#666', fontStyle: 'italic' }}>
                            "{offer.message}"
                          </p>
                        )}
                        <p style={{ margin: '0', fontSize: '12px', color: '#888' }}>
                          {new Date(offer.created_at).toLocaleDateString()} at {new Date(offer.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{
                          ...getStatusColor(offer.status),
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}>
                          {offer.status.charAt(0).toUpperCase() + offer.status.slice(1)}
                        </span>
                        
                        {offer.status === 'pending' && (
                          <div style={{ display: 'flex', gap: '5px' }}>
                            <button 
                              onClick={() => handleOfferAction(offer.id, 'accepted')}
                              style={{
                                ...actionButtonStyle,
                                backgroundColor: '#28a745',
                                color: 'white',
                                fontSize: '12px',
                                padding: '4px 8px'
                              }}
                            >
                              Accept
                            </button>
                            <button 
                              onClick={() => handleOfferAction(offer.id, 'rejected')}
                              style={{
                                ...actionButtonStyle,
                                backgroundColor: '#dc3545',
                                color: 'white',
                                fontSize: '12px',
                                padding: '4px 8px'
                              }}
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ margin: '10px 0', color: '#777' }}>No offers received yet.</p>
        )}
      </section>

      {/* 4. Orders Received */}
      <section style={sectionStyle}>
        <h2 style={{ marginTop: '0', marginBottom: '15px', fontSize: '20px', fontWeight: 500 }}>Orders Received</h2>
        {ordersReceived.length > 0 ? (
          <ul style={{ listStyle: 'none', padding: '0', margin: '0' }}>
            {ordersReceived.map((order, index) => (
              <li key={order.id} style={index === ordersReceived.length - 1 ? lastListItemStyle : {...listItemStyle, display: 'block' /* Orders have more text, block display might be better */ } }>
                <div>
                  Order #{order.id} - Item: <span style={{ fontWeight: 500 }}>{order.item}</span> - Buyer: <span style={{ fontWeight: 500 }}>{order.buyerName}</span> - Status: <strong style={{color: order.status === 'Pending' ? '#ffc107' : (order.status === 'Delivered' ? '#28a745' : '#333')}}>{order.status}</strong>
                </div>
                <div style={{ marginTop: '8px' }}> {/* Actions for orders */}
                  <button onClick={() => handleViewOrder(order.id)} style={{...actionButtonStyle, marginRight: '8px'}}>View Details</button>
                  {order.status === 'Pending' && (
                    <button onClick={() => handleMarkAsShipped(order.id)} style={{...actionButtonStyle, backgroundColor: '#17a2b8', color: 'white' /* Example for Mark Shipped */}}>Mark Shipped</button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ margin: '10px 0', color: '#777' }}>No new orders.</p>
        )}
      </section>

      {/* 5. Earnings / Balance */}
      <section style={sectionStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
                <h2 style={{ marginTop: '0', marginBottom: '5px', fontSize: '20px', fontWeight: 500 }}>Earnings</h2>
                <p style={{ margin: '0', fontSize: '16px', color: '#333' }}>
                    Available Balance: <strong style={{fontSize: '18px'}}>${currentBalance.toFixed(2)}</strong>
                </p>
            </div>
            {/* Using Button component for Withdraw Funds */}
            <Button onClick={handleWithdraw} disabled={currentBalance <= 0} style={primaryButtonStyle}>Withdraw Funds</Button>
        </div>
      </section>

      {/* 6. Messages */}
      <section style={sectionStyle}>
        <h2 style={{ marginTop: '0', marginBottom: '10px', fontSize: '20px', fontWeight: 500 }}>Messages</h2>
        {messages.length > 0 ? (
          <ul style={{ listStyle: 'none', padding: '0', margin: '0 0 15px 0' }}>
            {messages.map((msg, index) => (
              <li key={index} style={{ padding: '8px 0', borderBottom: index === messages.length - 1 ? 'none' : '1px solid #f0f0f0', fontSize: '14px', color: '#444' }}>
                {msg}
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ margin: '10px 0 15px 0', color: '#777' }}>No new messages.</p>
        )}
        <Link href="/seller/messages" style={{ color: '#007bff', textDecoration: 'none', fontSize: '14px' }}>
          View All Messages
        </Link>
      </section>

      {/* Placeholder for Performance Section if you plan to add it */}
      {/*
      <section style={sectionStyle}>
        <h2 style={{ marginTop: '0', marginBottom: '10px', fontSize: '20px', fontWeight: 500 }}>Performance</h2>
        <p style={{ margin: '0', color: '#777' }}>Performance metrics will be displayed here.</p>
      </section>
      */}
    </div>
  );
};

export default SellerDashboard;