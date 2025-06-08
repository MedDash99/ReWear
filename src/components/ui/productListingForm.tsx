"use client"; // This remains a client component

import React, { useState, useEffect } from 'react';
import { CldUploadButton, CloudinaryUploadWidgetResults } from 'next-cloudinary';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSession } from "next-auth/react";
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

const ProductListingForm: React.FC<ProductListingFormProps> = () => {
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [price, setPrice] = useState<string>(''); // Stored as string from input, parsed on submit
  const [images, setImages] = useState<CloudinaryImageState[]>([]); // Array to hold Cloudinary image states
  const { data: session, status } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Optional: if you use useRouter for redirection after success, uncomment the next line
  // const router = useRouter();

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

  // Show loading state or redirect if not authenticated
  if (status === "loading") {
    return <div className="max-w-sm sm:max-w-md mx-auto p-4 sm:p-6 text-center">Loading...</div>;
  }

  if (status === "unauthenticated") {
    return (
      <div className="max-w-sm sm:max-w-md mx-auto p-4 sm:p-6 bg-white rounded-xl shadow-md space-y-4 sm:space-y-6 md:mt-10 text-center">
        <h2 className="text-xl sm:text-2xl font-semibold text-teal-700">Authentication Required</h2>
        <p className="text-sm sm:text-base text-gray-600">You need to be logged in to create a product listing.</p>
        <Button className="bg-teal-600 hover:bg-teal-700 w-full sm:w-auto" onClick={() => window.location.href = '/api/auth/signin'}>
          Sign In
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-sm sm:max-w-md mx-auto p-4 sm:p-6 bg-white rounded-xl shadow-md space-y-4 sm:space-y-6 md:mt-10">
      <h2 className="text-xl sm:text-2xl font-semibold text-center text-teal-700">Sell Your Clothing</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        {/* Cloudinary Upload Button and Image Previews Area */}
        <div className="space-y-3 sm:space-y-4">
          <Label className="text-sm sm:text-base">Product Images (up to 5)</Label>
          <div className="flex justify-center">
            <CldUploadButton
              uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
              onSuccess={handleUploadSuccess}
              options={{
                sources: ['local', 'url', 'camera'],
                multiple: true,
                maxFiles: 5,
                folder: process.env.NEXT_PUBLIC_CLOUDINARY_FOLDER,
                upload_preset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
              }}
            >
              <div className="cursor-pointer border-2 border-dashed border-teal-300 rounded-md w-full h-32 sm:h-40 flex items-center justify-center overflow-hidden hover:border-teal-400 transition-colors">
                {images.length > 0 ? (
                  <img 
                    src={images[0].src} 
                    alt="Primary preview" 
                    className="object-cover h-full w-full" 
                  />
                ) : (
                  <span className="text-sm sm:text-base text-gray-400">Upload Images</span>
                )}
              </div>
            </CldUploadButton>
          </div>

          {/* Image Previews */}
          {images.length > 0 && (
            <div className="flex flex-wrap gap-2 sm:gap-3 p-2 sm:p-3 border border-gray-200 rounded-md">
              {images.map((img) => (
                <div key={img.publicId} className="relative w-16 h-16 sm:w-20 sm:h-20 border border-gray-300 rounded-md overflow-hidden">
                  <img
                    src={img.src}
                    alt={img.originalFilename || 'Uploaded image preview'}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(img.publicId)}
                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                    aria-label="Remove image"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Form Fields */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="title" className="text-sm sm:text-base">Product Title</Label>
            <Input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter product title"
              required
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="description" className="text-sm sm:text-base">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your item..."
              rows={3}
              required
              className="mt-1 resize-none"
            />
          </div>

          <div>
            <Label htmlFor="category" className="text-sm sm:text-base">Category</Label>
            <Select value={category} onValueChange={setCategory} required>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Clothing">Clothing</SelectItem>
                <SelectItem value="Shoes">Shoes</SelectItem>
                <SelectItem value="Accessories">Accessories</SelectItem>
                <SelectItem value="Bags">Bags</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="price" className="text-sm sm:text-base">Price ($)</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
              required
              className="mt-1"
            />
          </div>
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-teal-600 hover:bg-teal-700 text-white py-2.5 sm:py-3 text-sm sm:text-base"
        >
          {isSubmitting ? 'Creating Listing...' : 'Create Listing'}
        </Button>
      </form>
    </div>
  );
};

export default ProductListingForm;