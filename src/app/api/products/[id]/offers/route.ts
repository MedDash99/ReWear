import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createOffer, getItemById, getOffersByProduct } from '@/lib/database';
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

    // Check if product exists and get its price
    const product = await getItemById(Number(id));
    if (!product) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 });
    }

    // Prevent users from making offers on their own products
    if (product.seller_id === buyerId) {
      return NextResponse.json({ message: "Cannot make offer on your own product" }, { status: 400 });
    }

    // Check if offer is reasonable (less than product price)
    if (numericOffer >= product.price) {
      return NextResponse.json({ message: "Offer must be less than the product price" }, { status: 400 });
    }

    // Create offer using the Supabase function
    const newOffer = await createOffer({
      product_id: Number(id),
      buyer_id: buyerId,
      offer_price: numericOffer,
      message: message || undefined
    });

    return NextResponse.json({ 
      message: "Offer submitted successfully",
      offerId: newOffer.id
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
    const userId = session.user.id;

    // Check if user owns this product
    const product = await getItemById(Number(id));
    if (!product) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 });
    }

    if (product.seller_id !== userId) {
      return NextResponse.json({ message: "Not authorized to view offers for this product" }, { status: 403 });
    }

    // Get all offers for this product using Supabase
    const offers = await getOffersByProduct(Number(id));

    // Transform the offers to include buyer information
    const supabase = await createClient();
    const transformedOffers = await Promise.all(
      offers.map(async (offer: any) => {
        const { data: buyer } = await supabase
          .from('users')
          .select('name, email')
          .eq('id', offer.buyer_id)
          .single();

        return {
          id: offer.id,
          offer_price: offer.offer_price,
          message: offer.message,
          status: offer.status,
          created_at: offer.created_at,
          buyer_name: buyer?.name,
          buyer_email: buyer?.email
        };
      })
    );

    return NextResponse.json(transformedOffers, { status: 200 });

  } catch (error: any) {
    console.error("Error fetching offers:", error);
    return NextResponse.json({ 
      message: "Failed to fetch offers", 
      error: error.message 
    }, { status: 500 });
  }
} 