import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Upload a file to Cloudinary with folder configuration
 * @param filePathOrBuffer - File path string or Buffer containing the file data
 * @param options - Additional upload options
 * @returns Upload result from Cloudinary
 */
export async function uploadToCloudinary(filePathOrBuffer: string | Buffer, options: any = {}) {
  // If it's a Buffer, convert it to a data URI that Cloudinary can handle
  let uploadParam: string;
  if (Buffer.isBuffer(filePathOrBuffer)) {
    // Convert Buffer to base64 data URI
    const base64 = filePathOrBuffer.toString('base64');
    uploadParam = `data:image/jpeg;base64,${base64}`;
  } else {
    uploadParam = filePathOrBuffer;
  }

  return await cloudinary.uploader.upload(uploadParam, {
    folder: process.env.NEXT_PUBLIC_CLOUDINARY_FOLDER,
    ...options,
  });
}

/**
 * Delete a file from Cloudinary
 * @param publicId - The public ID of the file to delete
 * @returns Deletion result from Cloudinary
 */
export async function deleteFromCloudinary(publicId: string) {
  return await cloudinary.uploader.destroy(publicId);
}

/**
 * Generate a signed upload URL for secure client-side uploads
 * @param options - Upload options including folder
 * @returns Signed upload parameters
 */
export function generateSignedUploadParams(options: any = {}) {
  const timestamp = Math.round(new Date().getTime() / 1000);
  const uploadParams = {
    timestamp,
    folder: process.env.NEXT_PUBLIC_CLOUDINARY_FOLDER,
    ...options,
  };

  const signature = cloudinary.utils.api_sign_request(uploadParams, process.env.CLOUDINARY_API_SECRET!);
  
  return {
    ...uploadParams,
    signature,
    api_key: process.env.CLOUDINARY_API_KEY,
  };
}

export { cloudinary }; 