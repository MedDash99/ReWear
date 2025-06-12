"use client"; // This remains a client component

import React, { useState, useEffect } from 'react';
import { CldUploadButton, CloudinaryUploadWidgetResults } from 'next-cloudinary';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSession } from "next-auth/react";
import { getAllCategoryIds, getCategoryTranslationKey, type CategoryId } from '@/lib/categories';
import { useTranslation } from '@/i18n/useTranslation';
// To use useRouter for redirection after success, uncomment the next line
// import { useRouter } from 'next/navigation';

// Interface defining the structure for storing Cloudinary image info
interface CloudinaryImageState {
  id: string; // asset_id or public_id from Cloudinary
  src: string; // secure_url from Cloudinary (this is the main URL you'll store)
  publicId: string; // public_id from Cloudinary (useful for transformations or deletion)
  originalFilename?: string;
  width?: number;
  height?: number;
}

interface ProductListingFormProps {
  // You can define props here if needed in the future, e.g., for editing an existing product
}

// Loading skeleton components
const FormSkeleton = () => (
  <div className="bg-[#F6F6F6] min-h-screen py-10 px-2 sm:px-6">
    <div className="max-w-md mx-auto">
      {/* Header skeleton */}
      <div className="mb-8 text-center animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-2"></div>
      </div>
      
      {/* Form card skeleton */}
      <div className="bg-white rounded-2xl shadow-md p-6 space-y-6">
        {/* Image upload skeleton */}
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded w-40 animate-pulse"></div>
          <div className="h-40 bg-gray-200 rounded-md animate-pulse"></div>
        </div>

        {/* Form fields skeleton */}
        <div className="space-y-4">
          {/* Title field */}
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
          </div>

          {/* Description field */}
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
            <div className="h-20 bg-gray-200 rounded animate-pulse"></div>
          </div>

          {/* Category field */}
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
          </div>

          {/* Price field */}
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-28 animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
          </div>

          {/* Submit button skeleton */}
          <div className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>
      </div>
    </div>
  </div>
);

const ProductListingForm: React.FC<ProductListingFormProps> = () => {
  const { t } = useTranslation();
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [category, setCategory] = useState<CategoryId | ''>('');
  const [price, setPrice] = useState<string>(''); // Stored as string from input, parsed on submit
  const [images, setImages] = useState<CloudinaryImageState[]>([]); // Array to hold Cloudinary image states
  const { data: session, status } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  // Get category data for dropdown
  const categoryIds = getAllCategoryIds();
  const categoryData = categoryIds.map(id => ({
    id,
    label: t(getCategoryTranslationKey(id) as any)
  }));

  // Optional: if you use useRouter for redirection after success, uncomment the next line
  // const router = useRouter();

  // Simulate initial page loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setPageLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleUploadSuccess = (results: CloudinaryUploadWidgetResults) => {
    if (results.event === 'success' && results.info && typeof results.info === 'string' === false) {
      // Ensure results.info is not a string (it's an object with image details)
      const info = results.info as any; // Cast to any to access properties, or define a more specific type
      const newImage: CloudinaryImageState = {
        id: info.asset_id || info.public_id,
        src: info.secure_url,
        publicId: info.public_id,
        originalFilename: info.original_filename,
        width: info.width,
        height: info.height,
      };
      setImages((prevImages) => [...prevImages, newImage]); // Add to array if allowing multiple images
      console.log('Image uploaded to Cloudinary and data captured:', newImage);
    }
  };

  const removeImage = (publicIdToRemove: string) => {
    setImages(prevImages => prevImages.filter(img => img.publicId !== publicIdToRemove));
    // Note: This only removes the image from the local preview.
    // The image is already uploaded to Cloudinary. If you need to delete it from Cloudinary
    // when a user removes it here (before form submission), you'd need a separate API call
    // to your backend, which then calls Cloudinary's delete API. This is more advanced.
    console.log(`Image preview for ${publicIdToRemove} removed from form.`);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    // Check if user is authenticated
    if (status !== "authenticated" || !session?.user?.id) {
      alert('You must be logged in to create a product listing.');
      setIsSubmitting(false);
      return;
    }

    // Basic validation
    if (!title || !description || !category || !price) {
      alert('Please fill in all product details.');
      setIsSubmitting(false);
      return;
    }
    if (images.length === 0) {
      alert('Please upload at least one image for the product.');
      setIsSubmitting(false);
      return;
    }

    // For Option A, we send JSON data to the backend.
    // Your backend API (/api/products/create) will need to be updated
    // to expect `imageUrl` and `cloudinaryPublicId` (and other fields) in the JSON body.

    // Assuming your backend is set up to handle a single primary image URL for now.
    // If your backend can handle multiple images, you can send the whole `images` array.
    const primaryImage = images[0]; // Using the first uploaded image as the primary

    const productData = {
      name: title, // Your backend API was expecting 'name'
      description,
      category,
      price: parseFloat(price), // Convert price string to a number
      imageUrl: primaryImage.src, // The secure URL from Cloudinary
      cloudinaryPublicId: primaryImage.publicId, // The public ID from Cloudinary (good for later management)
      sellerId: session.user.id, // Use the authenticated user's ID from the session
    };

    console.log('Submitting Product Data as JSON:', productData);

    try {
      const response = await fetch('/api/products/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', // This is crucial for Option A
        },
        body: JSON.stringify(productData), // Send the data as a JSON string
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Product created successfully:', result);
        alert('Product listing created successfully!');
        // Reset form fields after successful submission
        setTitle('');
        setDescription('');
        setCategory('');
        setPrice('');
        setImages([]);
        // Optionally, redirect the user to their listings page or the new product page
        // router.push('/dashboard/seller/listings');
      } else {
        const errorData = await response.json().catch(() => ({ message: "Failed to parse error response." }));
        console.error('Failed to create product - Status:', response.status, 'Error:', errorData);
        alert(`Error creating product: ${errorData.message || 'Unknown error. Please check the console.'}`);
      }
    } catch (error) {
      console.error('An unexpected error occurred during form submission:', error);
      alert('An unexpected error occurred. Please try again and check the console.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading skeleton during initial load or session loading
  if (status === "loading" || pageLoading) {
    return <FormSkeleton />;
  }

  if (status === "unauthenticated") {
    return (
      <div className="bg-[#F6F6F6] min-h-screen py-10 px-2 sm:px-6">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-2xl shadow-md p-6 text-center">
            <h2 className="text-2xl font-bold text-teal-700 mb-4">Authentication Required</h2>
            <p className="text-gray-600 mb-6">You need to be logged in to create a product listing.</p>
            <Button className="bg-teal-600 hover:bg-teal-700 w-full py-3 text-base font-semibold" onClick={() => window.location.href = '/api/auth/signin'}>
              Sign In
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F6F6F6] min-h-screen py-10 px-2 sm:px-6">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Sell Your Clothing</h1>
          <p className="text-gray-500">Create a new product listing</p>
        </div>
        
        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Cloudinary Upload Button and Image Previews Area */}
            <div className="space-y-4">
              <Label className="text-base font-medium text-gray-700">Product Images (up to 5)</Label>
              <div className="flex justify-center">
                <CldUploadButton
                  uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
                  onSuccess={handleUploadSuccess}
                  options={{
                    sources: ['local', 'url', 'camera'],
                    multiple: true,
                    maxFiles: 5,
                    folder: process.env.NEXT_PUBLIC_CLOUDINARY_FOLDER,
                    uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
                  }}
                >
                  <div className="cursor-pointer border-2 border-dashed border-teal-300 rounded-lg w-full h-40 flex items-center justify-center overflow-hidden hover:border-teal-400 transition-colors bg-gray-50 hover:bg-gray-100">
                    {images.length > 0 ? (
                      <img 
                        src={images[0].src} 
                        alt="Primary preview" 
                        className="object-cover h-full w-full rounded-lg" 
                      />
                    ) : (
                      <div className="text-center">
                        <div className="text-teal-600 mb-2">
                          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        </div>
                        <span className="text-base text-gray-500 font-medium">Upload Images</span>
                        <p className="text-sm text-gray-400 mt-1">Click to add photos</p>
                      </div>
                    )}
                  </div>
                </CldUploadButton>
              </div>

              {/* Image Previews */}
              {images.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-700 mb-3">Uploaded Images ({images.length})</p>
                  <div className="flex flex-wrap gap-3">
                    {images.map((img) => (
                      <div key={img.publicId} className="relative w-20 h-20 border-2 border-gray-200 rounded-lg overflow-hidden">
                        <img
                          src={img.src}
                          alt={img.originalFilename || 'Uploaded image preview'}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(img.publicId)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 transition-colors shadow-lg"
                          aria-label="Remove image"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Form Fields */}
            <div className="space-y-5">
              <div>
                <Label htmlFor="title" className="text-base font-medium text-gray-700 mb-2 block">Product Title</Label>
                <Input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter product title"
                  required
                  className="h-12 text-base border-gray-300 focus:border-teal-500 focus:ring-teal-500"
                />
              </div>

              <div>
                <Label htmlFor="description" className="text-base font-medium text-gray-700 mb-2 block">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your item..."
                  rows={4}
                  required
                  className="text-base border-gray-300 focus:border-teal-500 focus:ring-teal-500 resize-none"
                />
              </div>

              <div>
                <Label htmlFor="category" className="text-base font-medium text-gray-700 mb-2 block">Category</Label>
                <Select value={category} onValueChange={(value: string) => setCategory(value as CategoryId)} required>
                  <SelectTrigger className="h-12 text-base border-gray-300 focus:border-teal-500 focus:ring-teal-500">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryData.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="price" className="text-base font-medium text-gray-700 mb-2 block">Price (₪)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                  required
                  className="h-12 text-base border-gray-300 focus:border-teal-500 focus:ring-teal-500"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 text-base font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating Listing...
                </div>
              ) : (
                'Create Listing'
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProductListingForm;