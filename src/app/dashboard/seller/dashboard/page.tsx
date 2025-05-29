// src/app/seller-dashboard/page.tsx
'use client';
import { Button } from '@/components/ui/button'; // Assuming this is your styled button
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
//import MinimalHeader from '@/components/ui/minimalHeader';
// Define types for data
interface Listing {
  id: string;
  name: string;
  price: number;
  status: 'Active' | 'Sold' | 'Draft';
}

interface Order {
  id: string;
  buyerName: string;
  item: string;
  status: 'Pending' | 'Shipped' | 'Delivered' | 'Canceled';
}

const SellerDashboard: React.FC = () => {
  const { data: session } = useSession();
  // --- State (using data that matches the image more closely for defaults) ---
  const [totalListed, setTotalListed] = useState<number>(5);
  const [totalSales, setTotalSales] = useState<number>(1250.75);
  // Updated to match image; original was 350.50, image shows 50 in the top overview and 350.50 in earnings section
  // For consistency, let's assume the overview "Current Balance" in the image ($50) might be a different metric
  // or a typo, and we'll use the "Available Balance" for the earnings section.
  const [currentBalance, setCurrentBalance] = useState<number>(350.50);

  // Placeholder data - replace with API calls
  const listings: Listing[] = [
    { id: 'l1', name: 'Handmade Scarf', price: 45.00, status: 'Active' },
    { id: 'l2', name: 'Vintage Lamp', price: 75.00, status: 'Active' },
    { id: 'l3', name: 'Old Book', price: 15.00, status: 'Sold' },
  ];

  const ordersReceived: Order[] = [
    { id: 'o1', buyerName: 'Alice', item: 'Handmade Scarf', status: 'Pending' },
    { id: 'o2', buyerName: 'Bob', item: 'Old Book', status: 'Delivered' },
  ];

  const messages: string[] = [
    'Inquiry about Vintage Lamp from Charlie',
    'Question about shipping for order #o1',
  ];

  // --- Handlers ---
  const router = useRouter();

  const handleAddNewItem = () => {
    console.log('Navigating to add new item page');
    router.push('/dashboard/seller/listings/new'); // Make sure this route exists
  };

  function handleEditItem(itemId: string) {
    console.log(`Editing item: ${itemId}`);
    // Example: router.push(`/seller/listings/edit/${itemId}`);
  }

  const handleDeleteItem = (itemId: string) => {
    console.log(`Deleting item: ${itemId}`);
    // Add confirmation dialog here
    // Call API to delete
  };

  const handleMarkAsSold = (itemId: string) => {
    console.log(`Marking item as sold: ${itemId}`);
    // Call API to update status
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

      {/* 3. Orders Received */}
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

      {/* 4. Earnings / Balance */}
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

      {/* 5. Messages */}
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