"use client";

import React, { useState } from 'react';
import { useCloudinaryUpload } from '@/hooks/useCloudinaryUpload';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

/**
 * Example component demonstrating server-side Cloudinary uploads with folder configuration
 * This component shows how to upload files directly through your API routes
 */
export function CloudinaryUploadExample() {
  const { uploadFile, uploading, error } = useCloudinaryUpload();
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setUploadResult(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    // Upload with folder configuration (folder is automatically applied from env var)
    const result = await uploadFile(selectedFile, {
      // Additional options can be passed here
      transformation: [{ width: 800, height: 600, crop: 'fill' }], // Example transformation
      public_id: `test-${Date.now()}`, // Custom public ID
    });

    if (result) {
      setUploadResult(result);
      console.log('Upload successful:', result);
    }
  };

  const handleServerUpload = async () => {
    // Example of using the buffer upload (typically for server-side operations)
    // This would normally be called from a server action or API route
    if (!selectedFile) return;

    // Convert file to base64 for demonstration
    const reader = new FileReader();
    reader.onload = async () => {
      const base64String = reader.result as string;
      
      // This demonstrates how you might call the upload API from the client
      // In practice, you'd typically do this server-side
      try {
        const response = await fetch('/api/cloudinary/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            filePathOrBuffer: base64String,
            options: {
              public_id: `server-upload-${Date.now()}`,
            }
          }),
        });

        if (response.ok) {
          const result = await response.json();
          setUploadResult(result);
          console.log('Server upload successful:', result);
        }
      } catch (err) {
        console.error('Server upload failed:', err);
      }
    };
    reader.readAsDataURL(selectedFile);
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">
        Cloudinary Upload Example
      </h2>
      
      <div className="space-y-2">
        <Label htmlFor="file-input">Select Image</Label>
        <Input
          id="file-input"
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="cursor-pointer"
        />
      </div>

      {selectedFile && (
        <div className="space-y-2">
          <p className="text-sm text-gray-600">
            Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
          </p>
          
          <div className="flex gap-2">
            <Button
              onClick={handleUpload}
              disabled={uploading}
              className="flex-1"
            >
              {uploading ? 'Uploading...' : 'Upload (FormData)'}
            </Button>
            
            <Button
              onClick={handleServerUpload}
              disabled={uploading}
              variant="outline"
              className="flex-1"
            >
              {uploading ? 'Uploading...' : 'Upload (Buffer)'}
            </Button>
          </div>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">Error: {error}</p>
        </div>
      )}

      {uploadResult && (
        <div className="space-y-3">
          <div className="p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-600 font-medium">Upload successful!</p>
          </div>
          
          <div className="space-y-2">
            <img
              src={uploadResult.secure_url}
              alt="Uploaded"
              className="w-full h-48 object-cover rounded-md border"
            />
            
            <div className="text-xs text-gray-500 space-y-1">
              <p><strong>Public ID:</strong> {uploadResult.public_id}</p>
              <p><strong>URL:</strong> {uploadResult.secure_url}</p>
              <p><strong>Folder:</strong> {uploadResult.folder || 'Default'}</p>
              <p><strong>Format:</strong> {uploadResult.format}</p>
              {uploadResult.width && uploadResult.height && (
                <p><strong>Dimensions:</strong> {uploadResult.width} × {uploadResult.height}</p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="text-xs text-gray-400 pt-4 border-t">
        <p>
          This example uploads to: <code>{process.env.NEXT_PUBLIC_CLOUDINARY_FOLDER || 'default folder'}</code>
        </p>
        <p>
          Files are automatically organized using the NEXT_PUBLIC_CLOUDINARY_FOLDER environment variable.
        </p>
      </div>
    </div>
  );
} 