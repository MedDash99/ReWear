"use client"; // This remains a client component

import React, { useState } from 'react';
import { CldUploadButton, CloudinaryUploadWidgetResults } from 'next-cloudinary';
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

  // Optional: if you use useRouter for redirection
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

    // Basic validation
    if (!title || !description || !category || !price) {
      alert('Please fill in all product details.');
      return;
    }
    if (images.length === 0) {
      alert('Please upload at least one image for the product.');
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
      // TODO: Get the actual sellerId from your authentication system (e.g., session)
      sellerId: '1', // Placeholder: replace with actual authenticated seller ID
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
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '30px', border: '1px solid #e0e0e0', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', fontFamily: 'Arial, sans-serif' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '25px', color: '#333' }}>Create New Product Listing</h2>
      <form onSubmit={handleSubmit}>
        {/* Title Input */}
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="title" style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold', color: '#555' }}>Title:</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            style={{ width: '100%', padding: '10px', boxSizing: 'border-box', border: '1px solid #ccc', borderRadius: '4px' }}
          />
        </div>

        {/* Description Textarea */}
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="description" style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold', color: '#555' }}>Description:</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={4}
            style={{ width: '100%', padding: '10px', boxSizing: 'border-box', border: '1px solid #ccc', borderRadius: '4px' }}
          />
        </div>

        {/* Category Input */}
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="category" style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold', color: '#555' }}>Category:</label>
          <input
            type="text"
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
            style={{ width: '100%', padding: '10px', boxSizing: 'border-box', border: '1px solid #ccc', borderRadius: '4px' }}
          />
        </div>

        {/* Price Input */}
        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="price" style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold', color: '#555' }}>Price ($):</label>
          <input
            type="number"
            id="price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            min="0.01" // Assuming price must be positive
            step="0.01"
            style={{ width: '100%', padding: '10px', boxSizing: 'border-box', border: '1px solid #ccc', borderRadius: '4px' }}
          />
        </div>

        {/* Cloudinary Upload Button and Image Previews Area */}
        <div style={{ marginBottom: '25px' }}>
          <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold', color: '#555' }}>Product Images (up to 5):</label>
          <CldUploadButton
            uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET} // Ensure this var is in .env.local
            onSuccess={handleUploadSuccess}
            options={{
              sources: ['local', 'url', 'camera'],
              multiple: true, // Allows user to select multiple files
              maxFiles: 5,    // Limits number of files
              // Optional: configure Cloudinary's cropping widget
              // cropping: true,
              // croppingAspectRatio: 1, // Example: 1 for square, 16/9 for landscape
            }}
          >
            <span style={{
              padding: '10px 18px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              display: 'inline-block',
              transition: 'background-color 0.2s ease',
            }}
             onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#0056b3')}
             onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#007bff')}
            >
              Upload Images
            </span>
          </CldUploadButton>

          {/* Image Previews */}
          {images.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '15px', border: '1px solid #eee', padding: '12px', borderRadius: '4px' }}>
              {images.map((img) => (
                <div key={img.publicId} style={{ border: '1px solid #ddd', borderRadius: '4px', position: 'relative', width: '100px', height: '100px', overflow: 'hidden', background: '#f9f9f9' }}>
                  <img
                    src={img.src}
                    alt={img.originalFilename || 'Uploaded image preview'}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <button
                    type="button" // Prevents form submission
                    onClick={() => removeImage(img.publicId)}
                    title="Remove image"
                    style={{
                      position: 'absolute', top: '4px', right: '4px', background: 'rgba(0, 0, 0, 0.5)',
                      color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px',
                      cursor: 'pointer', fontSize: '14px', lineHeight: '20px', textAlign: 'center',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'background-color 0.2s ease',
                    }}
                       onMouseOver={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 0, 0, 0.7)')}
                       onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.5)')}
                  >
                    &times; {/* Multiplication sign for 'X' icon */}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          style={{
            padding: '12px 25px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
            width: '100%',
            transition: 'background-color 0.2s ease',
          }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#218838')}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#28a745')}
        >
          Create Listing
        </button>
      </form>
    </div>
  );
};

export default ProductListingForm;