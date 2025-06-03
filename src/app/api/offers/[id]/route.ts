import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ message: "Offer ID is required" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { status } = body;
    const userId = session.user.id;

    if (!['accepted', 'rejected'].includes(status)) {
      return NextResponse.json({ message: "Invalid status. Must be 'accepted' or 'rejected'" }, { status: 400 });
    }

    const db = await getDB();

    // Get offer details and verify ownership
    const offer = await db.prepare(`
      SELECT o.*, i.sellerId, i.name as product_name
      FROM offers o
      JOIN items i ON o.product_id = i.id
      WHERE o.id = ?
    `).get(id);

    if (!offer) {
      return NextResponse.json({ message: "Offer not found" }, { status: 404 });
    }

    // Check if user owns the product
    if (offer.sellerId !== userId) {
      return NextResponse.json({ message: "Not authorized to update this offer" }, { status: 403 });
    }

    // Check if offer is still pending
    if (offer.status !== 'pending') {
      return NextResponse.json({ message: "Offer has already been processed" }, { status: 400 });
    }

    // Update offer status
    const updateStmt = await db.prepare(`
      UPDATE offers 
      SET status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    await updateStmt.run(status, id);

    // If offer is accepted, mark product as sold
    if (status === 'accepted') {
      const updateProductStmt = await db.prepare(`
        UPDATE items 
        SET status = 'Sold', updatedAt = CURRENT_TIMESTAMP
        WHERE id = ?
      `);
      await updateProductStmt.run(offer.product_id);

      // Reject all other pending offers for this product
      const rejectOthersStmt = await db.prepare(`
        UPDATE offers 
        SET status = 'rejected', updated_at = CURRENT_TIMESTAMP
        WHERE product_id = ? AND id != ? AND status = 'pending'
      `);
      await rejectOthersStmt.run(offer.product_id, id);
    }

    return NextResponse.json({ 
      message: `Offer ${status} successfully`,
      offer: {
        id: offer.id,
        status: status,
        product_name: offer.product_name
      }
    }, { status: 200 });

  } catch (error: any) {
    console.error("Error updating offer:", error);
    return NextResponse.json({ 
      message: "Failed to update offer", 
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
  if (!id) {
    return NextResponse.json({ message: "Offer ID is required" }, { status: 400 });
  }

  try {
    const db = await getDB();
    const userId = session.user.id;

    // Get offer details with product and seller info
    const offer = await db.prepare(`
      SELECT o.id, o.offer_price, o.message, o.status, o.created_at, o.updated_at,
             i.name as product_name, i.price as product_price, i.imageUrl as product_image,
             u.name as seller_name
      FROM offers o
      JOIN items i ON o.product_id = i.id
      JOIN users u ON i.sellerId = u.id
      WHERE o.id = ? AND o.buyer_id = ?
    `).get(id, userId);

    if (!offer) {
      return NextResponse.json({ message: "Offer not found" }, { status: 404 });
    }

    return NextResponse.json(offer, { status: 200 });

  } catch (error: any) {
    console.error("Error fetching offer:", error);
    return NextResponse.json({ 
      message: "Failed to fetch offer", 
      error: error.message 
    }, { status: 500 });
  }
} 