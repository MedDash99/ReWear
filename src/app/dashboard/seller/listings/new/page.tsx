// src/app/seller/listings/new/page.tsx
"use client"; // Required for client-side components like forms

import ProductListingForm from '@/components/ui/productListingForm'; // Adjust path if needed
import React from 'react';

const AddNewListingPage: React.FC = () => {
  return (
    <div>
      {/* You can add page-specific titles or wrappers here if needed */}
      <ProductListingForm />
    </div>
  );
};

export default AddNewListingPage;