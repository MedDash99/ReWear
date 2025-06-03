import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  try {
    const db = await getDB();
    const userId = session.user.id;

    // Get all offers made by this user
    const offers = await db.prepare(`
      SELECT o.id, o.offer_price, o.message, o.status, o.created_at, o.updated_at,
             i.id as product_id, i.name as product_name, i.price as product_price, 
             i.imageUrl as product_image,
             u.name as seller_name
      FROM offers o
      JOIN items i ON o.product_id = i.id
      JOIN users u ON i.sellerId = u.id
      WHERE o.buyer_id = ?
      ORDER BY o.created_at DESC
    `).all(userId);

    return NextResponse.json(offers, { status: 200 });

  } catch (error: any) {
    console.error("Error fetching user offers:", error);
    return NextResponse.json({ 
      message: "Failed to fetch offers", 
      error: error.message 
    }, { status: 500 });
  }
} 