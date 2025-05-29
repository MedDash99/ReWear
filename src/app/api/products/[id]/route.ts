// src/app/api/products/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { getDB } from '@/lib/db';

// --- Cloudinary Configuration (if not already globally configured) ---
if (!cloudinary.config().cloud_name) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  if (!id || isNaN(Number(id))) {
    return NextResponse.json({ message: "Valid Product ID is required" }, { status: 400 });
  }

  try {
    const db = await getDB();
    // 1. Fetch item to get Cloudinary public_id before deleting from DB
    const getItemStmt = await db.prepare('SELECT cloudinaryPublicId FROM items WHERE id = ?');
    const itemToDelete = await getItemStmt.get(Number(id)) as { cloudinaryPublicId?: string } | undefined;

    if (!itemToDelete) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 });
    }
    const cloudinaryPublicId = itemToDelete?.cloudinaryPublicId;

    // 2. Delete item from SQLite database
    const deleteStmt = await db.prepare('DELETE FROM items WHERE id = ?');
    await deleteStmt.run(Number(id));

    // 3. Delete image from Cloudinary
    if (cloudinaryPublicId) {
      await cloudinary.uploader.destroy(cloudinaryPublicId);
      console.log(`Successfully deleted image ${cloudinaryPublicId} from Cloudinary.`);
    }

    return NextResponse.json({ message: `Product ${id} deleted successfully` }, { status: 200 });
  } catch (error) {
    console.error(`Failed to delete product ${id}:`, error);
    return NextResponse.json({ message: "Failed to delete product", error: (error as Error).message }, { status: 500 });
  }
}