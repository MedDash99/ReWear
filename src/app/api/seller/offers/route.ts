import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  try {
    const supabase = await createClient();
    const sellerId = session.user.id;

    // Get all offers on products owned by this seller
    const { data: offers, error } = await supabase
      .from('offers')
      .select(`
        id, offer_price, message, status, created_at, updated_at,
        items!product_id (
          id, name, price, image_url
        ),
        users!buyer_id (
          name, email
        )
      `)
      .eq('items.seller_id', sellerId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching seller offers:", error);
      throw error;
    }

    // Transform and group offers by product
    const offersByProduct = (offers || []).reduce((acc: any, offer: any) => {
      const productId = offer.items?.id;
      if (!acc[productId]) {
        acc[productId] = {
          product_id: productId,
          product_name: offer.items?.name,
          product_price: offer.items?.price,
          product_image: offer.items?.image_url,
          offers: []
        };
      }
      acc[productId].offers.push({
        id: offer.id,
        offer_price: offer.offer_price,
        message: offer.message,
        status: offer.status,
        created_at: offer.created_at,
        updated_at: offer.updated_at,
        buyer_name: offer.users?.name,
        buyer_email: offer.users?.email
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