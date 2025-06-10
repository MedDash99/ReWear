"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "@/i18n/useTranslation";

export default function PreferencesPage() {
  const { data: session } = useSession();
  const { t, locale } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const [selectedLanguage, setSelectedLanguage] = useState<string>(locale);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Map between locale codes and display values for the API
  const localeToApiLanguage = (locale: string) => {
    return locale === 'fr' ? 'french' : 'english';
  };

  const apiLanguageToLocale = (language: string) => {
    return language === 'french' ? 'fr' : 'en';
  };

  // Load user preferences when component mounts
  useEffect(() => {
    const loadUserPreferences = async () => {
      if (!session?.user?.email) return;

      setIsLoading(true);
      try {
        const response = await fetch('/api/user/preferences');
        if (response.ok) {
          const data = await response.json();
          const savedLocale = apiLanguageToLocale(data.language || 'english');
          setSelectedLanguage(savedLocale);
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
      // Save to database with API format
      const response = await fetch('/api/user/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          language: localeToApiLanguage(selectedLanguage),
        }),
      });

      if (response.ok) {
        // If language changed, navigate to the new locale
        if (selectedLanguage !== locale) {
          const currentPath = pathname.replace(`/${locale}`, '');
          router.push(`/${selectedLanguage}${currentPath}`);
          toast.success('Language updated and applied!');
        } else {
          toast.success('Preferences have been saved.');
        }
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

  // Check if there are unsaved changes
  const hasUnsavedChanges = selectedLanguage !== locale;

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
              Choose your preferred language for the app interface. This setting will be applied across the entire app.
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Currently viewing in: <span className="font-medium">{locale === 'en' ? 'English' : 'Français'}</span>
            </p>
            {hasUnsavedChanges && (
              <p className="text-sm text-amber-600 mt-2 flex items-center gap-1">
                <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                You have unsaved language changes
              </p>
            )}
          </div>
          
          <div className="max-w-xs">
            <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="fr">Français</SelectItem>
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
            className={`px-6 py-2 ${
              hasUnsavedChanges 
                ? 'bg-amber-600 hover:bg-amber-700 text-white' 
                : 'bg-teal-600 hover:bg-teal-700 text-white'
            }`}
          >
            {isSaving ? 'Saving...' : hasUnsavedChanges ? 'Save & Apply Changes' : 'Save Preferences'}
          </Button>
          {hasUnsavedChanges && (
            <p className="text-xs text-gray-500 mt-2">
              Saving will apply the language change immediately
            </p>
          )}
        </div>
      </div>
    </div>
  );
} 