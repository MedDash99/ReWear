import { NextRequest, NextResponse } from 'next/server';
import { uploadToCloudinary } from '@/lib/cloudinary';

export async function POST(request: NextRequest) {
  try {
    const { filePathOrBuffer, options = {} } = await request.json();
    
    if (!filePathOrBuffer) {
      return NextResponse.json({ error: 'No file path or buffer provided' }, { status: 400 });
    }

    // Upload to Cloudinary with folder and any additional options
    const result = await uploadToCloudinary(filePathOrBuffer, options);

    return NextResponse.json({
      public_id: result.public_id,
      secure_url: result.secure_url,
      url: result.url,
      asset_id: result.asset_id,
      width: result.width,
      height: result.height,
      format: result.format,
      resource_type: result.resource_type,
      folder: result.folder,
    });

  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 