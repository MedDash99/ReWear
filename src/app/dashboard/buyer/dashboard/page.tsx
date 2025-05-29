// src/app/dashboard/buyer/dashboard/page.tsx
"use client";

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import React, { useState, useEffect } from 'react';
// import MinimalHeader from '@/components/ui/minimalHeader'; // REMOVE THIS IMPORT if not used elsewhere in this file

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

const BuyerDashboard: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState<string>('');

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

  // --- Authentication Check and Redirect --- 
  useEffect(() => {
    if (status === 'unauthenticated') {
      console.log("User is unauthenticated, redirecting to landing page...");
      router.push('/');
    }
  }, [status, router]);

  // ... (Render Logic for loading and unauthenticated states remains the same) ...

  if (status === 'loading') {
    return (
      <div style={{ padding: '20px', fontFamily: 'sans-serif', textAlign: 'center', color: '#333' }}>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div style={{ padding: '20px', fontFamily: 'sans-serif', textAlign: 'center', color: '#333' }}>
        <p>Access Denied. Redirecting...</p>
      </div>
    );
  }

  const userName = session.user?.name ?? 'Buyer';
  const profileImageUrl = session.user?.image ?? '/default-profile.png';

  const sectionStyle: React.CSSProperties = {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '20px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  };
  const buttonStyle: React.CSSProperties = {
    padding: '10px 15px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    cursor: 'pointer',
    backgroundColor: '#f8f8f8',
    color: '#333',
    fontSize: '14px',
  };
  const primaryButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    backgroundColor: '#5cb85c',
    color: 'white',
    border: 'none',
  };

  return (
    // The main div style can remain if it's for the page content's background and padding,
    // but ensure it doesn't conflict with styles from layout.js's <main> element.
    // Often, the page component just returns its direct content sections.
    <div style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif', color: '#333' /* Removed padding, bg color, minHeight as layout might handle this */ }}>
      {/* REMOVED MinimalHeader /> */}
      {/* REMOVED <header> element with ReWear h1 and hamburger icon */}

      {/* Welcome / Profile Section */}
      <section style={{ ...sectionStyle, display: 'flex', alignItems: 'center', gap: '20px' }}>
        <img
          src={profileImageUrl}
          alt="Profile"
          style={{ width: '80px', height: '80px', borderRadius: '50%' }}
          referrerPolicy="no-referrer"
        />
        <div>
          <h2 style={{ margin: '0 0 10px 0', fontSize: '22px', fontWeight: 'normal' }}>Welcome, {userName}!</h2>
          <Button onClick={handleEditProfile} style={primaryButtonStyle}>Edit Profile</Button>
        </div>
      </section>

      {/* Orders and Saved Items - Side by Side */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
        {/* Current Orders */}
        <section style={sectionStyle}>
          <h3 style={{ marginTop: '0', marginBottom: '15px', fontSize: '18px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>Current Orders</h3>
          {currentOrders.length > 0 ? (
            <ul style={{ listStyle: 'none', padding: '0', margin: '0' }}>
              {currentOrders.map((order) => (
                <li key={order.id} style={{ marginBottom: '15px', paddingBottom: '15px', borderBottom: currentOrders.length > 1 ? '1px solid #f0f0f0' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>{order.item}</span>
                    <span style={{
                      backgroundColor: order.status === 'Shipped' ? '#e6f7ff' : '#fffbe6',
                      color: order.status === 'Shipped' ? '#1890ff' : '#faad14',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      fontSize: '12px'
                    }}>
                      {order.status}
                    </span>
                  </div>
                  <button onClick={() => handleViewOrder(order.id)} style={{...buttonStyle, backgroundColor: 'transparent', border: 'none', color: '#4CAF50', padding: '5px', textDecoration: 'underline' }}>View Details</button>
                </li>
              ))}
            </ul>
          ) : (
            <p>No current orders.</p>
          )}
        </section>

        {/* Saved Items */}
        <section style={sectionStyle}>
          <h3 style={{ marginTop: '0', marginBottom: '15px', fontSize: '18px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>Saved Items</h3>
          {savedItems.length > 0 ? (
            <ul style={{ listStyle: 'none', padding: '0', margin: '0' }}>
              {savedItems.map((item) => (
                <li key={item.id} style={{ marginBottom: '15px', paddingBottom: '15px', borderBottom: savedItems.length > 1 ? '1px solid #f0f0f0' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 'bold'}}>{item.name}</span>
                    <button onClick={() => handleViewSavedItem(item.id)} style={{...buttonStyle, backgroundColor: 'transparent', border: 'none', color: '#4CAF50', padding: '5px', textDecoration: 'underline' }}>View Item</button>
                </li>
              ))}
            </ul>
          ) : (
            <p>No saved items.</p>
          )}
        </section>
      </div>

      {/* Notifications */}
      <section style={sectionStyle}>
        <h3 style={{ marginTop: '0', marginBottom: '15px', fontSize: '18px' }}>Notifications</h3>
        {notifications.length > 0 ? (
          <ul style={{ listStyle: 'disc', paddingLeft: '20px', margin: '0' }}>
            {notifications.map((note, index) => (
              <li key={index} style={{ marginBottom: '8px', fontSize: '14px' }}>{note}</li>
            ))}
          </ul>
        ) : (
          <p>No new notifications.</p>
        )}
      </section>

      {/* Support */}
      <section style={sectionStyle}>
        <h3 style={{ marginTop: '0', marginBottom: '15px', fontSize: '18px' }}>Support</h3>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Button onClick={handleViewFAQ} style={{...buttonStyle, flexGrow: 1}}>View FAQ</Button>
          <Button onClick={handleContactSupport} style={{...buttonStyle, flexGrow: 1}}>Contact Support</Button>
        </div>
      </section>
    </div>
  );
};

export default BuyerDashboard;