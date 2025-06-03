import { NextResponse } from 'next/server';
import { getDB } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET() {
  try {
    // Get the authenticated user's session
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    const sellerId = session.user.id;
    console.log(`[API my-listings] Fetching listings for user: ${sellerId}`);

    const db = await getDB();
    
    // Fetch ONLY products from the current authenticated user
    const items = await db.prepare(
      'SELECT i.id, i.name, i.description, i.price, i.imageUrl, i.category, i.cloudinaryPublicId, i.status, ' +
      'u.name as sellerName, u.profile_image_url as sellerAvatarUrl ' +
      'FROM items i JOIN users u ON i.sellerId = u.id ' +
      'WHERE i.sellerId = ? ' +
      'ORDER BY i.id DESC' // Show newest items first
    ).all(sellerId);

    console.log(`[API my-listings] Found ${items.length} listings for user ${sellerId}`);

    // Map DB rows to response format
    const responseItems = items.map((item: any) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      price: Number(item.price),
      imageUrl: item.imageUrl,
      category: item.category,
      cloudinaryPublicId: item.cloudinaryPublicId,
      status: item.status || 'Active', // Default to 'Active' if status is null
      seller: {
        name: item.sellerName,
        avatarUrl: item.sellerAvatarUrl,
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