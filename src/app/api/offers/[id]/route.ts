import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

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

    const supabase = await createClient();

    // Get offer details and verify ownership
    const { data: offer, error: offerError } = await supabase
      .from('offers')
      .select(`
        *,
        items!product_id (
          seller_id, name
        )
      `)
      .eq('id', id)
      .single();

    if (offerError || !offer) {
      return NextResponse.json({ message: "Offer not found" }, { status: 404 });
    }

    // Check if user owns the product
    const item = Array.isArray(offer.items) ? offer.items[0] : offer.items;
    if (item?.seller_id !== userId) {
      return NextResponse.json({ message: "Not authorized to update this offer" }, { status: 403 });
    }

    // Check if offer is still pending
    if (offer.status !== 'pending') {
      return NextResponse.json({ message: "Offer has already been processed" }, { status: 400 });
    }

    // Update offer status
    const { error: updateError } = await supabase
      .from('offers')
      .update({ 
        status: status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (updateError) throw updateError;

    // If offer is accepted, mark product as sold
    if (status === 'accepted') {
      const { error: productError } = await supabase
        .from('items')
        .update({ 
          status: 'Sold',
          updated_at: new Date().toISOString()
        })
        .eq('id', offer.product_id);

      if (productError) throw productError;

      // Reject all other pending offers for this product
      const { error: rejectError } = await supabase
        .from('offers')
        .update({ 
          status: 'rejected',
          updated_at: new Date().toISOString()
        })
        .eq('product_id', offer.product_id)
        .neq('id', id)
        .eq('status', 'pending');

      if (rejectError) throw rejectError;
    }

    return NextResponse.json({ 
      message: `Offer ${status} successfully`,
      offer: {
        id: offer.id,
        status: status,
        product_name: item?.name
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
    const supabase = await createClient();
    const userId = session.user.id;

    // Get offer details with product and seller info
    const { data: offer, error } = await supabase
      .from('offers')
      .select(`
        id, offer_price, message, status, created_at, updated_at,
        items!product_id (
          name, price, image_url,
          users!seller_id (name)
        )
      `)
      .eq('id', id)
      .eq('buyer_id', userId)
      .single();

    if (error || !offer) {
      return NextResponse.json({ message: "Offer not found" }, { status: 404 });
    }

    // Transform to match expected format
    const item = Array.isArray(offer.items) ? offer.items[0] : offer.items;
    const user = Array.isArray(item?.users) ? item?.users[0] : item?.users;
    
    const transformedOffer = {
      id: offer.id,
      offer_price: offer.offer_price,
      message: offer.message,
      status: offer.status,
      created_at: offer.created_at,
      updated_at: offer.updated_at,
      product_name: item?.name,
      product_price: item?.price,
      product_image: item?.image_url,
      seller_name: user?.name
    };

    return NextResponse.json(transformedOffer, { status: 200 });

  } catch (error: any) {
    console.error("Error fetching offer:", error);
    return NextResponse.json({ 
      message: "Failed to fetch offer", 
      error: error.message 
    }, { status: 500 });
  }
} 