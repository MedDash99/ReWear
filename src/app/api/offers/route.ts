import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  try {
    const supabase = await createClient();
    const userId = session.user.id;

    // Get all offers made by this user with joined data
    const { data: offers, error } = await supabase
      .from('offers')
      .select(`
        id, offer_price, message, status, created_at, updated_at,
        items!product_id (
          id, name, price, image_url,
          users!seller_id (name)
        )
      `)
      .eq('buyer_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching user offers:", error);
      throw error;
    }

    // Transform the data to match the expected format
    const transformedOffers = offers?.map((offer: any) => ({
      id: offer.id,
      offer_price: offer.offer_price,
      message: offer.message,
      status: offer.status,
      created_at: offer.created_at,
      updated_at: offer.updated_at,
      product_id: offer.items?.id,
      product_name: offer.items?.name,
      product_price: offer.items?.price,
      product_image: offer.items?.image_url,
      seller_name: offer.items?.users?.name
    })) || [];

    return NextResponse.json(transformedOffers, { status: 200 });

  } catch (error: any) {
    console.error("Error fetching user offers:", error);
    return NextResponse.json({ 
      message: "Failed to fetch offers", 
      error: error.message 
    }, { status: 500 });
  }
} 