import { useState } from 'react';
import { useSession } from 'next-auth/react';
import imageCompression from 'browser-image-compression';

interface UploadResult {
  success: boolean;
  imageUrl?: string;
  user?: {
    id: string;
    name: string | null;
    email: string;
    profile_image_url: string | null;
  };
}

export function useProfileImageUpload() {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { data: session, update } = useSession();

  const compressImage = async (file: File): Promise<File> => {
    const options = {
      maxSizeMB: 0.1, // 100KB
      maxWidthOrHeight: 300,
      useWebWorker: true,
      fileType: 'image/webp',
    };

    try {
      const compressedFile = await imageCompression(file, options);
      
      // If the compressed file is still too large, try more aggressive compression
      if (compressedFile.size > 102400) { // 100KB
        const moreAggressiveOptions = {
          maxSizeMB: 0.08, // 80KB
          maxWidthOrHeight: 250,
          useWebWorker: true,
          fileType: 'image/webp',
          quality: 0.8,
        };
        return await imageCompression(file, moreAggressiveOptions);
      }
      
      return compressedFile;
    } catch (error) {
      console.error('Error compressing image:', error);
      throw new Error('Failed to compress image');
    }
  };

  const uploadProfileImage = async (file: File): Promise<UploadResult | null> => {
    setUploading(true);
    setError(null);

    try {
      // Compress the image before upload
      const compressedFile = await compressImage(file);

      const formData = new FormData();
      formData.append('file', compressedFile);

      const response = await fetch('/api/user/profile-image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const result: UploadResult = await response.json();
      
      // Trigger a session update to refetch the new user data with the new image
      await update();
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Upload error:', err);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const deleteProfileImage = async (): Promise<UploadResult | null> => {
    setUploading(true);
    setError(null);

    try {
      const response = await fetch('/api/user/profile-image', {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Delete failed');
      }

      const result: UploadResult = await response.json();
      
      // Trigger a session update to refetch the new user data
      await update();
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Delete error:', err);
      return null;
    } finally {
      setUploading(false);
    }
  };

  return {
    uploadProfileImage,
    deleteProfileImage,
    uploading,
    error,
  };
} 