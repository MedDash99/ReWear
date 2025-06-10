"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function PreferencesPage() {
  const { data: session } = useSession();
  const [selectedLanguage, setSelectedLanguage] = useState<string>("english");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load user preferences when component mounts
  useEffect(() => {
    const loadUserPreferences = async () => {
      if (!session?.user?.email) return;

      setIsLoading(true);
      try {
        const response = await fetch('/api/user/preferences');
        if (response.ok) {
          const data = await response.json();
          setSelectedLanguage(data.language || "english");
        }
      } catch (error) {
        console.error('Failed to load preferences:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserPreferences();
  }, [session]);

  const handleSavePreferences = async () => {
    if (!session?.user?.email) {
      toast.error('Please log in to save preferences');
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch('/api/user/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          language: selectedLanguage,
        }),
      });

      if (response.ok) {
        toast.success('Preferences have been saved.');
      } else {
        throw new Error('Failed to save preferences');
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast.error('Failed to save preferences. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-md p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Preferences</h1>
          <p className="text-gray-600 mt-2">Customize your app experience.</p>
        </div>
        
        <div className="py-8 text-center text-gray-500">
          <p>Loading preferences...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-md p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Preferences</h1>
        <p className="text-gray-600 mt-2">Customize your app experience.</p>
      </div>
      
      <div className="space-y-8">
        {/* Language Section */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Language</h3>
            <p className="text-sm text-gray-600 mt-1">
              Choose your preferred language for the app interface.
            </p>
          </div>
          
          <div className="max-w-xs">
            <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="english">English</SelectItem>
                <SelectItem value="french">French</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Dark Mode Section - Placeholder as mentioned in requirements */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Theme</h3>
            <p className="text-sm text-gray-600 mt-1">
              Choose between light and dark themes.
            </p>
          </div>
          
          <div className="flex items-center justify-between max-w-xs">
            <span className="text-sm text-gray-700">Dark Mode</span>
            <button
              disabled
              className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-not-allowed rounded-full border-2 border-transparent bg-gray-200 transition-colors duration-200 ease-in-out opacity-50"
            >
              <span className="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out translate-x-0" />
            </button>
          </div>
          <p className="text-xs text-gray-500">Coming soon</p>
        </div>

        {/* Save Button */}
        <div className="pt-4">
          <Button 
            onClick={handleSavePreferences}
            disabled={isSaving}
            className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2"
          >
            {isSaving ? 'Saving...' : 'Save Preferences'}
          </Button>
        </div>
      </div>
    </div>
  );
} 