"use client";

import { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { useProfileImageUpload } from '@/hooks/useProfileImageUpload';
import { Camera, Upload, Trash2, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface UserData {
  id: string;
  name: string | null;
  email: string;
  profile_image_url: string | null;
}

export default function ProfileSettingsPage() {
  const { data: session, update: updateSession } = useSession();
  const { uploadProfileImage, deleteProfileImage, uploading, error } = useProfileImageUpload();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch user data
  useEffect(() => {
    async function fetchUserData() {
      if (session?.user?.id) {
        try {
          const response = await fetch('/api/user');
          if (response.ok) {
            const data = await response.json();
            setUserData(data);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
    }

    fetchUserData();
  }, [session?.user?.id]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('Please select a JPEG, PNG, or WebP image file.');
      return;
    }

    // Validate file size (5MB limit before compression)
    if (file.size > 5 * 1024 * 1024) {
      alert('Please select an image smaller than 5MB.');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewImage(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload the file
    handleUpload(file);
  };

  const handleUpload = async (file: File) => {
    setSuccess(null);
    
    const result = await uploadProfileImage(file);
    if (result?.success && result.user) {
      setUserData(result.user);
      setPreviewImage(null);
      setSuccess('Profile image updated successfully!');
      
      // Update the session to reflect the new profile image
      await updateSession({
        ...session,
        user: {
          ...session?.user,
          profile_image_url: result.user.profile_image_url
        }
      });
    }
  };

  const handleDeleteImage = async () => {
    if (!confirm('Are you sure you want to remove your profile image?')) {
      return;
    }

    setSuccess(null);
    
    const result = await deleteProfileImage();
    if (result?.success && result.user) {
      setUserData(result.user);
      setPreviewImage(null);
      setSuccess('Profile image removed successfully!');
      
      // Update the session
      await updateSession({
        ...session,
        user: {
          ...session?.user,
          profile_image_url: null
        }
      });
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  if (!session) {
    return (
      <div className="bg-white rounded-2xl shadow-md p-6">
        <div className="text-center text-gray-500">
          <p>Please sign in to manage your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-md p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Profile details</h1>
        <p className="text-gray-600 mt-2">Manage your personal information and profile settings.</p>
      </div>

      {/* Profile Image Section */}
      <div className="space-y-6">
        <div className="space-y-4">
          <Label className="text-base font-medium text-gray-700">Profile Photo</Label>
          
          {/* Current/Preview Image */}
          <div className="flex items-center gap-6">
            <div className="relative">
              <UserAvatar 
                size="xl"
                className="border-4 border-gray-200"
              />
              
              {/* Upload Overlay for current image */}
              <button
                onClick={triggerFileInput}
                disabled={uploading}
                className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity disabled:cursor-not-allowed"
              >
                {uploading ? (
                  <Loader2 className="w-6 h-6 text-white animate-spin" />
                ) : (
                  <Camera className="w-6 h-6 text-white" />
                )}
              </button>
            </div>

            <div className="flex-1 space-y-2">
              <div className="text-sm text-gray-600">
                <p>Maximum file size: 100KB</p>
                <p>Supported formats: JPEG, PNG, WebP</p>
                <p>Recommended size: 300x300px</p>
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={triggerFileInput}
                  disabled={uploading}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Upload Photo
                    </>
                  )}
                </Button>
                
                {userData?.profile_image_url && (
                  <Button
                    onClick={handleDeleteImage}
                    disabled={uploading}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                    Remove
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Preview Image */}
          {previewImage && (
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Preview (Uploading...)</Label>
              <div className="relative w-20 h-20">
                <img
                  src={previewImage}
                  alt="Preview"
                  className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                />
                {uploading && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Hidden File Input */}
          <Input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {/* Success Message */}
        {success && (
          <Alert className="border-green-200 bg-green-50">
            <AlertDescription className="text-green-800">
              {success}
            </AlertDescription>
          </Alert>
        )}

        {/* Error Message */}
        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* User Info */}
        <div className="space-y-4 pt-6 border-t">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-700">Name</Label>
              <div className="mt-1 p-2 bg-gray-50 rounded border text-gray-800">
                {userData?.name || session.user?.name || 'Not provided'}
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">Email</Label>
              <div className="mt-1 p-2 bg-gray-50 rounded border text-gray-800">
                {userData?.email || session.user?.email}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 