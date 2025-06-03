// src/app/api/products/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { getDB } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// --- Cloudinary Configuration (if not already globally configured) ---
if (!cloudinary.config().cloud_name) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    });
}

interface ItemRow {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  cloudinaryPublicId?: string;
  sellerId: string | number;
  sellerName: string;
  sellerAvatarUrl: string;
  status: string;
}

// Helper function to check ownership
async function checkOwnership(itemId: number, sellerId: string | number) {
  const db = await getDB();
  const item = await db.prepare('SELECT sellerId FROM items WHERE id = ?').get(itemId) as { sellerId: string | number } | undefined;
  return item && item.sellerId === sellerId;
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    console.warn("DELETE /products/[id]: No session found");
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  const sellerId = session.user.id;
  const { id } = await params;
  if (!id || isNaN(Number(id))) {
    console.warn("DELETE /products/[id]: Invalid ID", id);
    return NextResponse.json({ message: "Valid Product ID is required" }, { status: 400 });
  }

  try {
    const isOwner = await checkOwnership(Number(id), sellerId);
    console.log(`Ownership check for item ${id} by seller ${sellerId}:`, isOwner);

    if (!isOwner) {
      console.warn(`User ${sellerId} tried to delete unauthorized product ${id}`);
      return NextResponse.json({ message: "Not authorized to delete this product" }, { status: 403 });
    }

    const db = await getDB();

    const getItemStmt = await db.prepare('SELECT cloudinaryPublicId FROM items WHERE id = ?');
    const itemToDelete = await getItemStmt.get(Number(id)) as { cloudinaryPublicId?: string } | undefined;

    if (!itemToDelete) {
      console.warn(`Product ${id} not found in database`);
      return NextResponse.json({ message: "Product not found" }, { status: 404 });
    }

    const cloudinaryPublicId = itemToDelete.cloudinaryPublicId;
    console.log(`Preparing to delete product ${id}. Cloudinary public_id:`, cloudinaryPublicId);

    const deleteStmt = await db.prepare('DELETE FROM items WHERE id = ?');
    await deleteStmt.run(Number(id));
    console.log(`Deleted product ${id} from SQLite.`);

    if (cloudinaryPublicId) {
      try {
        const result = await cloudinary.uploader.destroy(cloudinaryPublicId);
        console.log(`Cloudinary deletion result for "${cloudinaryPublicId}":`, result);
      } catch (cloudErr) {
        console.error(`Cloudinary deletion failed for "${cloudinaryPublicId}":`, cloudErr);
      }
    } else {
      console.warn(`No cloudinaryPublicId found for product ${id}`);
    }

    return NextResponse.json({ message: `Product ${id} deleted successfully` }, { status: 200 });

  } catch (error) {
    console.error(`Failed to delete product ${id}:`, error);
    return NextResponse.json({
      message: "Failed to delete product",
      error: (error as Error).stack,
    }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  const sellerId = session.user.id;
  const { id } = await params;
  if (!id || isNaN(Number(id))) {
    return NextResponse.json({ message: "Valid Product ID is required" }, { status: 400 });
  }

  try {
    // Check ownership
    const isOwner = await checkOwnership(Number(id), sellerId);
    if (!isOwner) {
      return NextResponse.json({ message: "Not authorized to edit this product" }, { status: 403 });
    }

    const body = await request.json();
    const {
      name,
      description,
      price,
      category,
      status, // Optional: for marking as sold
    } = body;

    // Validate required fields
    if (!name || !description || !price || !category) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const numericPrice = Number(price);
    if (isNaN(numericPrice) || numericPrice <= 0) {
      return NextResponse.json({ message: "Invalid price" }, { status: 400 });
    }

    const db = await getDB();
    
    // Update the item
    const updateStmt = await db.prepare(`
      UPDATE items 
      SET name = ?, description = ?, price = ?, category = ?, status = ?
      WHERE id = ?
    `);
    
    await updateStmt.run(
      name,
      description,
      numericPrice,
      category,
      status || 'Active', // Default to 'Active' if not provided
      Number(id)
    );

    // Fetch updated item
    const updatedItem = await db.prepare(
      'SELECT i.id, i.name, i.description, i.price, i.imageUrl, i.category, i.cloudinaryPublicId, ' +
      'u.name as sellerName, u.profile_image_url as sellerAvatarUrl ' +
      'FROM items i JOIN users u ON i.sellerId = u.id ' +
      'WHERE i.id = ?'
    ).get(Number(id)) as ItemRow | undefined;

    if (!updatedItem) {
      return NextResponse.json({ message: "Failed to retrieve updated product" }, { status: 500 });
    }

    const responseItem = {
      id: updatedItem.id,
      name: updatedItem.name,
      description: updatedItem.description,
      price: Number(updatedItem.price),
      imageUrl: updatedItem.imageUrl,
      category: updatedItem.category,
      cloudinaryPublicId: updatedItem.cloudinaryPublicId,
      seller: {
        name: updatedItem.sellerName,
        avatarUrl: updatedItem.sellerAvatarUrl,
      },
    };

    return NextResponse.json(responseItem, { status: 200 });
  } catch (error: any) {
    console.error(`Failed to update product ${id}:`, error);
    return NextResponse.json({ message: "Failed to update product", error: error.message }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id || isNaN(Number(id))) {
      return NextResponse.json({ message: "Valid Product ID is required" }, { status: 400 });
    }

    const db = await getDB();
    const item = await db.prepare(
      'SELECT i.id, i.name, i.description, i.price, i.imageUrl, i.category, i.cloudinaryPublicId, i.status, i.sellerId, ' +
      'u.name as sellerName, u.profile_image_url as sellerAvatarUrl ' +
      'FROM items i JOIN users u ON i.sellerId = u.id ' +
      'WHERE i.id = ?'
    ).get(Number(id)) as ItemRow | undefined;

    if (!item) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 });
    }

    const responseItem = {
      id: item.id,
      name: item.name,
      description: item.description,
      price: Number(item.price),
      imageUrl: item.imageUrl,
      stock: 1, // You might want to add a stock field to your items table
      shippingInfo: "Free shipping on orders over $50", // You might want to add this to your items table
      returnPolicy: "30-day return policy", // You might want to add this to your items table
      category: item.category,
      status: item.status || 'Active',
      sellerId: item.sellerId,
      seller: {
        name: item.sellerName,
        avatarUrl: item.sellerAvatarUrl,
      }
    };

    return NextResponse.json(responseItem);
  } catch (error) {
    console.error('Error fetching product:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}