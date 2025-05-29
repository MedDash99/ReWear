// app/api/update-user-roles/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; // Adjust path
import { getDB } from '@/lib/db'; // Adjust path

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { is_buyer, is_seller, needsRoleConfirmation } = await request.json();

    // Basic validation for the input
    if (typeof is_buyer !== 'boolean' || 
        typeof is_seller !== 'boolean' || 
        typeof needsRoleConfirmation !== 'boolean') { // needsRoleConfirmation should usually be set to false here
      return NextResponse.json({ message: 'Invalid input payload' }, { status: 400 });
    }

    const db = await getDB();
    await db.run(
      'UPDATE users SET is_buyer = ?, is_seller = ?, needs_role_confirmation = ? WHERE id = ?',
      is_buyer,
      is_seller,
      needsRoleConfirmation, // This is typically set to `false` by the client when submitting roles
      session.user.id
    );
    
    console.log(`User roles updated for ${session.user.id}: buyer=${is_buyer}, seller=${is_seller}, needsConfirm=${needsRoleConfirmation}`);
    
    // It's important that the client calls `useSession().update()` after this API call
    // to refresh its local session state with these new values.
    return NextResponse.json({ message: 'Roles updated successfully' });

  } catch (error) {
    console.error('API Error updating roles:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ message: 'Failed to update roles', error: errorMessage }, { status: 500 });
  }
}