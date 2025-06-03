import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import crypto from 'crypto';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;
  if (!id || isNaN(Number(id))) {
    return NextResponse.json({ message: "Valid Product ID is required" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { offer, message } = body;
    const buyerId = session.user.id;

    // Validate offer
    const numericOffer = Number(offer);
    if (isNaN(numericOffer) || numericOffer <= 0) {
      return NextResponse.json({ message: "Invalid offer amount" }, { status: 400 });
    }

    const db = await getDB();

    // Check if product exists and get its price
    const product = await db.prepare('SELECT price, sellerId FROM items WHERE id = ?').get(Number(id));
    if (!product) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 });
    }

    // Prevent users from making offers on their own products
    if (product.sellerId === buyerId) {
      return NextResponse.json({ message: "Cannot make offer on your own product" }, { status: 400 });
    }

    // Check if offer is reasonable (less than product price)
    if (numericOffer >= product.price) {
      return NextResponse.json({ message: "Offer must be less than the product price" }, { status: 400 });
    }

    // Create offer
    const offerId = crypto.randomUUID();
    const stmt = await db.prepare(`
      INSERT INTO offers (id, product_id, buyer_id, offer_price, message, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, 'pending', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `);

    await stmt.run(offerId, Number(id), buyerId, numericOffer, message || null);

    return NextResponse.json({ 
      message: "Offer submitted successfully",
      offerId: offerId
    }, { status: 201 });

  } catch (error: any) {
    console.error("Error creating offer:", error);
    return NextResponse.json({ 
      message: "Failed to create offer", 
      error: error.message 
    }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;
  if (!id || isNaN(Number(id))) {
    return NextResponse.json({ message: "Valid Product ID is required" }, { status: 400 });
  }

  try {
    const db = await getDB();
    const userId = session.user.id;

    // Check if user owns this product
    const product = await db.prepare('SELECT sellerId FROM items WHERE id = ?').get(Number(id));
    if (!product) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 });
    }

    if (product.sellerId !== userId) {
      return NextResponse.json({ message: "Not authorized to view offers for this product" }, { status: 403 });
    }

    // Get all offers for this product
    const offers = await db.prepare(`
      SELECT o.id, o.offer_price, o.message, o.status, o.created_at,
             u.name as buyer_name, u.email as buyer_email
      FROM offers o
      JOIN users u ON o.buyer_id = u.id
      WHERE o.product_id = ?
      ORDER BY o.created_at DESC
    `).all(Number(id));

    return NextResponse.json(offers, { status: 200 });

  } catch (error: any) {
    console.error("Error fetching offers:", error);
    return NextResponse.json({ 
      message: "Failed to fetch offers", 
      error: error.message 
    }, { status: 500 });
  }
} 