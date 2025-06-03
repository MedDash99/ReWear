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
    const sellerId = session.user.id;

    // Get all offers on products owned by this seller
    const offers = await db.prepare(`
      SELECT o.id, o.offer_price, o.message, o.status, o.created_at, o.updated_at,
             i.id as product_id, i.name as product_name, i.price as product_price, 
             i.imageUrl as product_image,
             u.name as buyer_name, u.email as buyer_email
      FROM offers o
      JOIN items i ON o.product_id = i.id
      JOIN users u ON o.buyer_id = u.id
      WHERE i.sellerId = ?
      ORDER BY o.created_at DESC
    `).all(sellerId);

    // Group offers by product
    const offersByProduct = offers.reduce((acc: any, offer: any) => {
      if (!acc[offer.product_id]) {
        acc[offer.product_id] = {
          product_id: offer.product_id,
          product_name: offer.product_name,
          product_price: offer.product_price,
          product_image: offer.product_image,
          offers: []
        };
      }
      acc[offer.product_id].offers.push({
        id: offer.id,
        offer_price: offer.offer_price,
        message: offer.message,
        status: offer.status,
        created_at: offer.created_at,
        updated_at: offer.updated_at,
        buyer_name: offer.buyer_name,
        buyer_email: offer.buyer_email
      });
      return acc;
    }, {});

    return NextResponse.json(Object.values(offersByProduct), { status: 200 });

  } catch (error: any) {
    console.error("Error fetching seller offers:", error);
    return NextResponse.json({ 
      message: "Failed to fetch offers", 
      error: error.message 
    }, { status: 500 });
  }
} 