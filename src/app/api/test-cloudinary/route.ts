import { NextResponse } from 'next/server';

export async function GET() {
  // Check if environment variables are set
  const envCheck = {
    CLOUDINARY_CLOUD_NAME: !!process.env.CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY: !!process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET: !!process.env.CLOUDINARY_API_SECRET,
    NEXT_PUBLIC_CLOUDINARY_FOLDER: !!process.env.NEXT_PUBLIC_CLOUDINARY_FOLDER,
    NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET: !!process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
  };

  const allSet = Object.values(envCheck).every(Boolean);

  return NextResponse.json({
    status: allSet ? 'ready' : 'missing_variables',
    environment: envCheck,
    message: allSet 
      ? 'Cloudinary is properly configured!' 
      : 'Some environment variables are missing. Check your .env file.',
    test_folder: process.env.NEXT_PUBLIC_CLOUDINARY_FOLDER || 'not_set'
  });
} 