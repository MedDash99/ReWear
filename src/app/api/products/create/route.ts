// src/app/api/products/create/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createItem } from '@/lib/database'; // Updated import
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// The Cloudinary SDK configuration might still be useful if you plan to perform
// other Cloudinary operations from your backend in different routes (e.g., deleting images,
// generating signed URLs for more advanced upload scenarios later).
// For this specific 'create' operation under Option A, you are not using cloudinary.uploader.
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

type Item = {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  seller: {
    name: string;
    avatarUrl: string;
  };
};

export async function POST(request: NextRequest) {
  try {
    // Get the authenticated user's session
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated
    if (!session || !session.user) {
      console.log('[API create product] Authentication check failed: No session or session.user.');
      return NextResponse.json({ message: "Not authenticated. Please log in." }, { status: 401 });
    }
    
    // Get the seller ID from the session
    const sellerId = session.user.id;
    console.log('[API create product] sellerId FROM session.user.id:', sellerId, '(Type:', typeof sellerId, ')');
    
    // Validate the seller ID
    if (!sellerId || typeof sellerId !== 'string') {
      console.error("User ID (sellerId) not found in session object:", session?.user);
      return NextResponse.json({ message: "Authenticated user ID missing from session data. Check NextAuth callbacks." }, { status: 500 });
    }

    // 1. Parse the JSON payload from the request
    const body = await request.json();
    const {
      name,
      description,
      price,
      category,
      imageUrl,
      cloudinaryPublicId,
    } = body;

    // 2. Validate the received data
    if (
      !name || typeof name !== 'string' ||
      !description || typeof description !== 'string' ||
      price === undefined || typeof price !== 'number' || isNaN(price) || price <= 0 ||
      !category || typeof category !== 'string' ||
      !imageUrl || typeof imageUrl !== 'string' ||
      !cloudinaryPublicId || typeof cloudinaryPublicId !== 'string'
    ) {
      return NextResponse.json(
        { message: "Missing or invalid required fields. Ensure name, description, price, category, imageUrl, and cloudinaryPublicId are provided and correctly formatted." },
        { status: 400 }
      );
    }

    // 3. Save item data to Supabase
    console.log('Attempting to insert item with values:', {
      name,
      description,
      price,
      category,
      imageUrl,
      cloudinaryPublicId,
      sellerId
    });

    const newItem = await createItem({
      name,
      description,
      price,
      category,
      image_url: imageUrl,
      cloudinary_public_id: cloudinaryPublicId,
      seller_id: sellerId,
      status: 'Active'
    });

    if (!newItem) {
      console.error("Database insert failed.");
      return NextResponse.json({ message: "Failed to save the item to the database." }, { status: 500 });
    }

    // Structure the response - note: Supabase createItem doesn't include user data, so we'll use the basic item
    const responseItem = {
      id: newItem.id,
      name: newItem.name,
      description: newItem.description,
      price: newItem.price,
      imageUrl: newItem.image_url,
      category: newItem.category,
      cloudinaryPublicId: newItem.cloudinary_public_id,
      status: newItem.status,
      seller: {
        name: session.user.name || 'Unknown',
        avatarUrl: session.user.image || null,
      },
    };

    return NextResponse.json(responseItem, { status: 201 });

  } catch (error: any) {
    console.error("Error in /api/products/create:", error);
    if (error instanceof SyntaxError && error.message.toLowerCase().includes("json")) {
        return NextResponse.json({ message: "Invalid JSON payload provided.", details: error.message }, { status: 400 });
    }
    return NextResponse.json({ message: "Failed to create product due to an internal server error.", details: error.message }, { status: 500 });
  }
}