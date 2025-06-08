import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { createClient } from '@/utils/supabase/server';

// GET /api/favorites - Get user's favorites
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  const userId = session.user.id;
  const { searchParams } = new URL(request.url);
  const returnItems = searchParams.get('returnItems') === 'true';
  
  try {
    const supabase = await createClient();
    
    if (returnItems) {
      // Return full item data with favorites
      const { data, error } = await supabase
        .from('favorites')
        .select(`
          item_id,
          created_at,
          items (
            id,
            name,
            description,
            price,
            image_url,
            category,
            seller_id,
            users!items_seller_id_fkey (
              id,
              name,
              profile_image_url
            )
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching favorites with items:", error);
        return NextResponse.json({ message: 'Failed to fetch favorites' }, { status: 500 });
      }

      // Transform the data to match the expected format
      const favorites = data?.map(fav => {
        const item = Array.isArray(fav.items) ? fav.items[0] : fav.items;
        const user = Array.isArray(item?.users) ? item?.users[0] : item?.users;
        
        return {
          id: item?.id,
          name: item?.name,
          description: item?.description,
          price: item?.price,
          imageUrl: item?.image_url,
          category: item?.category,
          sellerId: item?.seller_id,
          seller: {
            name: user?.name,
            avatarUrl: user?.profile_image_url
          },
          favorited_at: fav.created_at
        };
      }) || [];

      return NextResponse.json({ favorites });
    } else {
      // Return only item IDs
      const { data, error } = await supabase
        .from('favorites')
        .select('item_id')
        .eq('user_id', userId);

      if (error) {
        console.error("Error fetching favorite IDs:", error);
        return NextResponse.json({ message: 'Failed to fetch favorites' }, { status: 500 });
      }

      const favoriteIds = data?.map(fav => parseInt(String(fav.item_id))) || [];
      console.log("GET /api/favorites - Returning favorite IDs:", { userId, favoriteIds });
      return NextResponse.json({ favoriteIds });
    }
  } catch (error) {
    console.error("Error in favorites GET:", error);
    return NextResponse.json({ message: 'Failed to fetch favorites' }, { status: 500 });
  }
}

// POST /api/favorites - Add item to favorites
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  const userId = session.user.id;
  
  try {
    const { itemId } = await request.json();
    console.log("POST /api/favorites - Adding favorite:", { userId, itemId, itemIdType: typeof itemId });
    
    if (!itemId) {
      return NextResponse.json({ message: "Item ID is required" }, { status: 400 });
    }

    const supabase = await createClient();
    
    // Check if the item exists
    const { data: item, error: itemError } = await supabase
      .from('items')
      .select('id')
      .eq('id', itemId)
      .single();

    if (itemError || !item) {
      return NextResponse.json({ message: "Item not found" }, { status: 404 });
    }

    // Add to favorites (using upsert to handle duplicates gracefully)
    const { error } = await supabase
      .from('favorites')
      .upsert({ 
        user_id: userId, 
        item_id: parseInt(String(itemId)) // Ensure it's a number
      }, { 
        onConflict: 'user_id,item_id' 
      });

    if (error) {
      console.error("Error adding to favorites:", error);
      return NextResponse.json({ message: 'Failed to add to favorites' }, { status: 500 });
    }

    return NextResponse.json({ message: "Added to favorites successfully" }, { status: 201 });
  } catch (error) {
    console.error("Error in favorites POST:", error);
    return NextResponse.json({ message: 'Failed to add to favorites' }, { status: 500 });
  }
}

// DELETE /api/favorites - Remove item from favorites
export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  const userId = session.user.id;
  
  try {
    const { itemId } = await request.json();
    console.log("DELETE /api/favorites - Removing favorite:", { userId, itemId, itemIdType: typeof itemId });
    
    if (!itemId) {
      return NextResponse.json({ message: "Item ID is required" }, { status: 400 });
    }

    const supabase = await createClient();
    
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', userId)
      .eq('item_id', parseInt(String(itemId)));

    if (error) {
      console.error("Error removing from favorites:", error);
      return NextResponse.json({ message: 'Failed to remove from favorites' }, { status: 500 });
    }

    return NextResponse.json({ message: "Removed from favorites successfully" });
  } catch (error) {
    console.error("Error in favorites DELETE:", error);
    return NextResponse.json({ message: 'Failed to remove from favorites' }, { status: 500 });
  }
} 