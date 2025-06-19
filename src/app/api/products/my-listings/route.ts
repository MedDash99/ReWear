import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getItemsBySeller } from '@/lib/database';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    const sellerId = session.user.id;
    console.log(`[API my-listings] Fetching listings for user: ${sellerId}`);

    // Fetch ONLY products from the current authenticated user using Supabase
    const items = await getItemsBySeller(sellerId);

    console.log(`[API my-listings] Found ${items.length} listings for user ${sellerId}`);

    // Map DB rows to response format
    const responseItems = items.map((item: any) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      price: Number(item.price),
      imageUrl: item.image_url,
      category: item.category,
      cloudinaryPublicId: item.cloudinary_public_id,
      status: item.status || 'Active', // Default to 'Active' if status is null
      seller: {
        name: session.user.name || 'Unknown',
        avatarUrl: session.user.image || null,
      },
    }));

    return NextResponse.json(responseItems, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching user's listings:", error);
    return NextResponse.json({ 
      message: 'Failed to fetch your listings', 
      error: error.message 
    }, { status: 500 });
  }
} 