import { CloudinaryUploadExample } from '@/components/examples/CloudinaryUploadExample';

export default function TestUploadPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-900">
          Test Cloudinary Upload
        </h1>
        
        <CloudinaryUploadExample />
        
        <div className="mt-8 max-w-md mx-auto">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Testing Instructions:</h3>
            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
              <li>Select an image file</li>
              <li>Try both upload methods</li>
              <li>Check that uploads go to your test folder</li>
              <li>Verify the folder structure in Cloudinary dashboard</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
} 