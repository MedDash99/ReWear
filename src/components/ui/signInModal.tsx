// components/SignInModal.tsx
"use client";

import React from 'react';
import { signIn } from 'next-auth/react';
import { FcGoogle } from 'react-icons/fc'; // Assuming react-icons is installed
import { Button } from "@/components/ui/button"; // Assuming Shadcn Button
import { useTranslation } from '@/i18n/useTranslation';

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SignInModal: React.FC<SignInModalProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  if (!isOpen) {
    return null; // Don't render the modal if not open
  }

  const handleGoogleSignIn = () => {
    signIn('google');
  };

  return (
    // Modal Overlay
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      {/* Modal Card */}
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-sm w-full mx-4 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-2xl"
        >
          &times;
        </button>

        {/* Modal Content */}
        <div className="flex flex-col items-center text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            {t('welcomeTo')} <span className="text-teal-600">{t('rewear')}</span>
          </h2>

          <p className="text-gray-700 mb-6">
            {t('signInToDiscover')}
          </p>

          {/* Sign-in Button */}
          <Button
            onClick={handleGoogleSignIn}
            size="lg"
            className="flex items-center justify-center px-6 py-3 text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-lg transition duration-150 ease-in-out"
          >
            <FcGoogle className="mr-3 h-5 w-5" aria-hidden="true" /> {/* Adjust icon size */}
            {t('signInWithGoogle')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SignInModal;