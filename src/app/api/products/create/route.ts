// src/app/api/products/create/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/db'; // Your database helper
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

    const db = await getDB();

    // 1. Parse the JSON payload from the request
    // The client (ProductListingForm.tsx) now sends a JSON object.
    const body = await request.json();
    const {
      name,
      description,
      price, // Client should send this as a number (e.g., parseFloat(price))
      category,
      imageUrl, // This is the secure_url from Cloudinary, sent by the client
      cloudinaryPublicId, // The public_id from Cloudinary, sent by the client
    } = body;

    // 2. Validate the received data
    //    (Add more specific validation as needed)
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

    // 3. The image is already uploaded to Cloudinary by the client.
    //    No server-side upload logic is needed here. We directly use the provided
    //    imageUrl and cloudinaryPublicId.

    // 4. Save item data to the SQLite database
    // Start of Selection
    // Log the values before preparing the statement
    console.log('Attempting to insert item with values:', {
      name,
      description,
      price,
      category,
      imageUrl,
      cloudinaryPublicId,
      sellerId
    });

    const insertStmt = await db.prepare(`
      INSERT INTO items (name, description, price, category, imageUrl, cloudinaryPublicId, sellerId)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const info = await insertStmt.run(
      name,
      description,
      price,
      category,
      imageUrl,
      cloudinaryPublicId,
      sellerId
    );

    const newItemId = info.lastInsertRowid;
    if (!newItemId) {
      console.error("Database insert failed or did not return a lastInsertRowid.", info);
      return NextResponse.json({ message: "Failed to save the item to the database." }, { status: 500 });
    }

     // 5. Fetch the newly created item along with seller info
     const selectNewItemStmt = await db.prepare(
       'SELECT i.id, i.name, i.description, i.price, i.imageUrl, i.category, i.cloudinaryPublicId, ' +
       'u.name as sellerName, u.profile_image_url as sellerAvatarUrl ' +
       'FROM items i JOIN users u ON i.sellerId = u.id ' +
       'WHERE i.id = ?'
     );
    
     const newItemFromDb: any = await selectNewItemStmt.get(newItemId); /* CORRECTED WITH AWAIT */
    
     if (!newItemFromDb) {
       console.error(`Failed to retrieve item with ID ${newItemId} after insert.`);
       return NextResponse.json({ message: `Item created with ID ${newItemId}, but failed to retrieve confirmation details.` }, { status: 207 });
     }
    
     // Structure the response
     const responseItem = {
         ...newItemFromDb,
         seller: {
             name: newItemFromDb.sellerName,
             avatarUrl: newItemFromDb.sellerAvatarUrl, // This alias matches what client expects
         },
     };
     delete responseItem.sellerName;
     delete responseItem.sellerAvatarUrl; // These were aliased into responseItem.seller.avatarUrl
    
     return NextResponse.json(responseItem, { status: 201 });
    // ... } catch (error: any) { ... } ...

  } catch (error: any) {
    console.error("Error in /api/products/create:", error);
    // Handle JSON parsing errors specifically, as that's a common issue with request.json()
    if (error instanceof SyntaxError && error.message.toLowerCase().includes("json")) {
        return NextResponse.json({ message: "Invalid JSON payload provided.", details: error.message }, { status: 400 });
    }
    return NextResponse.json({ message: "Failed to create product due to an internal server error.", details: error.message }, { status: 500 });
  }
}