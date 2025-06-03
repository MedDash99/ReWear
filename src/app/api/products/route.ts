// src/app/api/products/route.ts
import { NextResponse } from 'next/server';
import { getDB } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// This Item type might be used for structuring the response or internal typing.
type Item = {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  cloudinaryPublicId?: string; // Added this as it's in your DB
  seller: {
    name: string;
    avatarUrl: string;
  };
};

export async function POST(request: Request) { // Or NextRequest
  const session = await getServerSession(authOptions);

  // Explicitly check for session and user first
  if (!session || !session.user) {
    console.log('[API create product] Authentication check failed: No session or session.user.');
    return NextResponse.json({ message: "Not authenticated. Please log in." }, { status: 401 });
  }

  const sellerIdFromSession = session.user.id as string | number;
  console.log('[API create product] sellerIdFromSession FROM session.user.id:', sellerIdFromSession, '(Type:', typeof sellerIdFromSession, ')');

  // Check if the ID was actually found in the session.
  if (typeof sellerIdFromSession === 'undefined') {
    console.error("User ID (sellerId) not found in session object:", session?.user);
    return NextResponse.json({ message: "Authenticated user ID missing from session data. Check NextAuth callbacks." }, { status: 500 });
  }
  try {
    const db = await getDB();

    // 3. Parse the JSON payload from the request
    const body = await request.json();
    const {
      name,
      description,
      price, // Client might send this as a string or number
      category,
      imageUrl,
      cloudinaryPublicId,
    } = body;

    // 4. Validate the received data (price is converted to number)
    const numericPrice = Number(price); // Convert price to a number for validation and database insertion

    if (
      !name || typeof name !== 'string' ||
      !description || typeof description !== 'string' ||
      price === undefined || isNaN(numericPrice) || numericPrice <= 0 || // Validate numericPrice
      !category || typeof category !== 'string' ||
      !imageUrl || typeof imageUrl !== 'string' ||
      !cloudinaryPublicId || typeof cloudinaryPublicId !== 'string'
    ) {
      return NextResponse.json(
        { message: "Missing or invalid required fields. Ensure name, description, price, category, imageUrl, and cloudinaryPublicId are provided and correctly formatted." },
        { status: 400 }
      );
    }

    // 5. Log and Save item data to the SQLite database using the session-derived sellerId
    console.log('Attempting to insert item with values:', {
      name,
      description,
      price: numericPrice, // Use the validated numeric price
      category,
      imageUrl,
      cloudinaryPublicId,
      sellerId: sellerIdFromSession // ✨ Use the ID from the session here
    });

    const insertStmt = await db.prepare(`
      INSERT INTO items (name, description, price, category, imageUrl, cloudinaryPublicId, sellerId)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    // Execute the insert statement
    const info = await insertStmt.run(
      name,
      description,
      numericPrice, // Use the validated numeric price
      category,
      imageUrl,
      cloudinaryPublicId,
      sellerIdFromSession // ✨ Use the ID from the session here
    );

    const newItemId = info.lastInsertRowid;
    if (!newItemId) {
      console.error("Database insert failed or did not return a lastInsertRowid.", info);
      return NextResponse.json({ message: "Failed to save the item to the database." }, { status: 500 });
    }

    // 6. Fetch the newly created item along with seller info (your existing logic)
    const selectNewItemStmt = await db.prepare(
      'SELECT i.id, i.name, i.description, i.price, i.imageUrl, i.category, i.cloudinaryPublicId, ' +
      'u.name as sellerName, u.profile_image_url as sellerAvatarUrl ' + // Ensure 'u.profile_image_url' is correct
      'FROM items i JOIN users u ON i.sellerId = u.id ' +
      'WHERE i.id = ?'
    );

    const newItemFromDb: any = await selectNewItemStmt.get(newItemId);

    if (!newItemFromDb) {
      console.error(`Failed to retrieve item with ID ${newItemId} after insert.`);
      return NextResponse.json({ message: `Item created with ID ${newItemId}, but failed to retrieve confirmation details.` }, { status: 207 });
    }

    // Structure the response (your existing logic)
    const responseItem: Item = { // Using the Item type for the response
      id: newItemFromDb.id,
      name: newItemFromDb.name,
      description: newItemFromDb.description,
      price: Number(newItemFromDb.price), // Ensure price is a number in the response
      imageUrl: newItemFromDb.imageUrl,
      category: newItemFromDb.category,
      cloudinaryPublicId: newItemFromDb.cloudinaryPublicId,
      seller: {
        name: newItemFromDb.sellerName,
        avatarUrl: newItemFromDb.sellerAvatarUrl,
      },
    };
    // The aliased fields like sellerName are now part of the nested seller object, so no need to delete.

    return NextResponse.json(responseItem, { status: 201 });

  } catch (error: any) {
    console.error("Error in /api/products/create:", error);
    if (error instanceof SyntaxError && error.message.toLowerCase().includes("json")) {
      return NextResponse.json({ message: "Invalid JSON payload provided.", details: error.message }, { status: 400 });
    }
    // You might want to add more specific error handling for database errors if needed
    return NextResponse.json({ message: "Failed to create product due to an internal server error.", details: error.message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const db = await getDB();
    
    // Fetch ALL products from ALL sellers for browsing
    const items = await db.prepare(
      'SELECT i.id, i.name, i.description, i.price, i.imageUrl, i.category, i.cloudinaryPublicId, ' +
      'u.name as sellerName, u.profile_image_url as sellerAvatarUrl ' +
      'FROM items i JOIN users u ON i.sellerId = u.id ' +
      'ORDER BY i.id DESC' // Show newest items first
    ).all();

    // Map DB rows to Item type
    const responseItems = items.map((item: any) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      price: Number(item.price),
      imageUrl: item.imageUrl,
      category: item.category,
      cloudinaryPublicId: item.cloudinaryPublicId,
      sellerId: item.sellerId, // Include sellerId for reference
      seller: {
        name: item.sellerName,
        avatarUrl: item.sellerAvatarUrl,
      },
    }));

    return NextResponse.json(responseItems, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching products:", error);
    return NextResponse.json({ message: 'Failed to fetch products', error: error.message }, { status: 500 });
  }
}