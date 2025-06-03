// src/app/api/products/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
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

  const sellerIdFromSession = session.user.id as string;
  console.log('[API create product] sellerIdFromSession FROM session.user.id:', sellerIdFromSession, '(Type:', typeof sellerIdFromSession, ')');

  // Check if the ID was actually found in the session.
  if (typeof sellerIdFromSession === 'undefined') {
    console.error("User ID (sellerId) not found in session object:", session?.user);
    return NextResponse.json({ message: "Authenticated user ID missing from session data. Check NextAuth callbacks." }, { status: 500 });
  }
  
  try {
    const supabase = await createClient();

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

    // 5. Log and Save item data to Supabase using the session-derived sellerId
    console.log('Attempting to insert item with values:', {
      name,
      description,
      price: numericPrice,
      category,
      image_url: imageUrl, // Note: using snake_case for Supabase
      cloudinary_public_id: cloudinaryPublicId, // Note: using snake_case for Supabase
      seller_id: sellerIdFromSession // Note: using snake_case for Supabase
    });

    const { data: newItem, error: insertError } = await supabase
      .from('items')
      .insert({
        name,
        description,
        price: numericPrice,
        category,
        image_url: imageUrl,
        cloudinary_public_id: cloudinaryPublicId,
        seller_id: sellerIdFromSession,
        status: 'Active'
      })
      .select(`
        id,
        name,
        description,
        price,
        image_url,
        category,
        cloudinary_public_id,
        users:seller_id (
          name,
          profile_image_url
        )
      `)
      .single();

    if (insertError) {
      console.error("Database insert failed:", insertError);
      return NextResponse.json({ message: "Failed to save the item to the database.", error: insertError.message }, { status: 500 });
    }

    if (!newItem) {
      console.error("No item returned after insert");
      return NextResponse.json({ message: "Failed to retrieve item after creation." }, { status: 500 });
    }

    // Structure the response
    const responseItem: Item = {
      id: newItem.id,
      name: newItem.name,
      description: newItem.description,
      price: Number(newItem.price),
      imageUrl: newItem.image_url,
      category: newItem.category,
      cloudinaryPublicId: newItem.cloudinary_public_id,
      seller: {
        name: (newItem.users as any)?.name || 'Unknown',
        avatarUrl: (newItem.users as any)?.profile_image_url || null,
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

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    
    // Fetch ALL products from ALL sellers for browsing
    const { data: items, error } = await supabase
      .from('items')
      .select(`
        id,
        name,
        description,
        price,
        image_url,
        category,
        cloudinary_public_id,
        seller_id,
        users:seller_id (
          name,
          profile_image_url
        )
      `)
      .eq('status', 'Active')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching products:", error);
      return NextResponse.json({ message: 'Failed to fetch products', error: error.message }, { status: 500 });
    }

    // Map DB rows to Item type
    const responseItems = (items || []).map((item: any) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      price: Number(item.price),
      imageUrl: item.image_url,
      category: item.category,
      cloudinaryPublicId: item.cloudinary_public_id,
      sellerId: item.seller_id,
      seller: {
        name: item.users?.name || 'Unknown',
        avatarUrl: item.users?.profile_image_url || null,
      },
    }));

    return NextResponse.json(responseItems, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching products:", error);
    return NextResponse.json({ message: 'Failed to fetch products', error: error.message }, { status: 500 });
  }
}