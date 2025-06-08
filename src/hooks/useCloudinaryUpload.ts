import { useState } from 'react';

interface UploadResult {
  public_id: string;
  secure_url: string;
  url: string;
  asset_id: string;
  width?: number;
  height?: number;
  format: string;
  resource_type: string;
  folder?: string;
}

interface UploadError {
  error: string;
  details?: string;
}

export function useCloudinaryUpload() {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Upload a file using the server-side API with folder configuration
   * @param file - File object to upload
   * @param options - Additional upload options
   */
  const uploadFile = async (file: File, options: any = {}): Promise<UploadResult | null> => {
    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/cloudinary/sign-uploads', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData: UploadError = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const result: UploadResult = await response.json();
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

  /**
   * Upload using file path or buffer (for server-side use)
   * @param filePathOrBuffer - File path string or Buffer
   * @param options - Additional upload options
   */
  const uploadFromBuffer = async (filePathOrBuffer: string, options: any = {}): Promise<UploadResult | null> => {
    setUploading(true);
    setError(null);

    try {
      const response = await fetch('/api/cloudinary/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filePathOrBuffer, options }),
      });

      if (!response.ok) {
        const errorData: UploadError = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const result: UploadResult = await response.json();
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

  return {
    uploadFile,
    uploadFromBuffer,
    uploading,
    error,
  };
} 