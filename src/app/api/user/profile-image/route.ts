// src/app/api/user/profile-image/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';

// Helper function to create authenticated Supabase client
function createAuthenticatedClient(accessToken: string) {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Check mime type – we only accept images
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.' },
        { status: 400 }
      );
    }

    // Convert incoming File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const inputBuffer = Buffer.from(arrayBuffer);

    // -------- Compress with sharp --------
    // 1. Resize to fit within 300×300px
    // 2. Convert to WebP (efficient) with quality that should produce <100 KB
    //    We start at q=80 and reduce until we get under 100 KB or reach q=40
    const SIZE_LIMIT = 100 * 1024; // 100 KB
    let quality = 80;
    let compressedBuffer: Buffer = await sharp(inputBuffer)
      .resize(300, 300, { fit: 'inside' })
      .webp({ quality })
      .toBuffer();

    while (compressedBuffer.length > SIZE_LIMIT && quality > 40) {
      quality -= 10;
      compressedBuffer = await sharp(inputBuffer)
        .resize(300, 300, { fit: 'inside' })
        .webp({ quality })
        .toBuffer();
    }

    if (compressedBuffer.length > SIZE_LIMIT) {
      return NextResponse.json(
        { error: 'Unable to compress image under 100KB. Please choose a smaller image.' },
        { status: 400 }
      );
    }

    // The SupabaseAdapter ensures ALL authenticated users have a supabaseAccessToken
    if (!session.supabaseAccessToken) {
      return NextResponse.json(
        { error: 'No Supabase access token available. Please ensure SUPABASE_SERVICE_ROLE_KEY is configured.' },
        { status: 401 }
      );
    }

    // Create authenticated Supabase client using user's access token
    const supabase = createAuthenticatedClient(session.supabaseAccessToken);
    
    // Generate a unique filename with timestamp for cache-busting
    const timestamp = Date.now();
    const filePath = `${session.user.id}/avatar-${timestamp}.webp`;

    console.log('Using authenticated client with path:', filePath, 'for user:', session.user.id);

    // Clean up old avatar files before uploading new one
    try {
      const { data: oldFiles, error: listError } = await supabase.storage
        .from('user-icons')
        .list(session.user.id);

      if (!listError && oldFiles && oldFiles.length > 0) {
        const filesToDelete = oldFiles
          .filter(file => file.name.startsWith('avatar-'))
          .map(file => `${session.user.id}/${file.name}`);
        
        if (filesToDelete.length > 0) {
          const { error: deleteError } = await supabase.storage
            .from('user-icons')
            .remove(filesToDelete);
          
          if (deleteError) {
            console.warn('Failed to clean up old avatar files:', deleteError);
          } else {
            console.log('Cleaned up old avatar files:', filesToDelete);
          }
        }
      }
    } catch (cleanupError) {
      console.warn('Error during cleanup of old avatar files:', cleanupError);
    }

    const { error: uploadError } = await supabase.storage
      .from('user-icons')
      .upload(filePath, compressedBuffer, {
        cacheControl: '0', // No cache to prevent caching issues
        upsert: true,
        contentType: 'image/webp'
      });

    if (uploadError) {
      console.error('Upload to storage failed:', uploadError);
      return NextResponse.json(
        { error: 'Upload failed', details: uploadError.message },
        { status: 500 }
      );
    }

    console.log('Upload successful, getting public URL for path:', filePath);

    const { data: { publicUrl } } = supabase.storage
      .from('user-icons')
      .getPublicUrl(filePath);

    const imageUrl = publicUrl;
    console.log('Generated public URL:', imageUrl);

    // Update user record using authenticated client
    console.log('Updating user profile with image URL:', imageUrl);
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({ profile_image_url: imageUrl })
      .eq('id', session.user.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating user profile image:', updateError);
      return NextResponse.json(
        { error: 'Failed to update profile', details: updateError.message },
        { status: 500 }
      );
    }

    console.log('Database update result:', updatedUser.profile_image_url);

    return NextResponse.json({
      success: true,
      imageUrl,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        profile_image_url: updatedUser.profile_image_url
      }
    });

  } catch (error) {
    console.error('Error uploading profile image:', error);
    return NextResponse.json(
      { error: 'Upload failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // The SupabaseAdapter ensures ALL authenticated users have a supabaseAccessToken
    if (!session.supabaseAccessToken) {
      return NextResponse.json(
        { error: 'No Supabase access token available. Please ensure SUPABASE_SERVICE_ROLE_KEY is configured.' },
        { status: 401 }
      );
    }

    // Create authenticated Supabase client using user's access token
    const supabase = createAuthenticatedClient(session.supabaseAccessToken);
    
    // First, list all files in the user's folder
    const { data: files, error: listError } = await supabase.storage
      .from('user-icons')
      .list(session.user.id);

    if (listError) {
      console.error('Error listing files:', listError);
      return NextResponse.json(
        { error: 'Failed to list files', details: listError.message },
        { status: 500 }
      );
    }

    // If files exist, delete them
    if (files && files.length > 0) {
      const filesToDelete = files.map(file => `${session.user.id}/${file.name}`);
      
      const { error: deleteError } = await supabase.storage
        .from('user-icons')
        .remove(filesToDelete);

      if (deleteError) {
        console.error('Error deleting profile image from storage:', deleteError);
        return NextResponse.json(
          { error: 'Failed to delete files', details: deleteError.message },
          { status: 500 }
        );
      }
    }

    // Update user record to remove profile image URL using authenticated client
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({ profile_image_url: null })
      .eq('id', session.user.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating user profile image:', updateError);
      return NextResponse.json(
        { error: 'Failed to update profile', details: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        profile_image_url: updatedUser.profile_image_url
      }
    });

  } catch (error) {
    console.error('Error deleting profile image:', error);
    return NextResponse.json(
      { error: 'Delete failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 