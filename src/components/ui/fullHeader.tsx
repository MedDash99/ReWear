// components/Header.tsx
'use client'; // Mark as a Client Component

import React, { useState, useRef, useEffect } from 'react'; // Import useState, useRef, useEffect
import Link from 'next/link';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSignInClick?: () => void;
  onSignUpClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ searchQuery, onSearchChange, onSignInClick, onSignUpClick }) => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // State for dropdown visibility
  const dropdownRef = useRef<HTMLDivElement>(null); // Ref to detect clicks outside

  const handleLogout = async () => {
    setIsDropdownOpen(false); // Close dropdown on logout
    await signOut({ callbackUrl: '/' });
  };

  const handleSignIn = () => {
    if (onSignInClick) {
      onSignInClick();
    } else {
      signIn(undefined, { callbackUrl: '/' });
    }
  };

  const handleSignUp = () => {
    if (onSignUpClick) {
      onSignUpClick();
    } else {
      signIn(undefined, { callbackUrl: '/' }); // Standard sign-in can handle new users
    }
  };

  const handleSellNow = () => {
    if (status === 'authenticated') {
      router.push('/select-role?intent=sell');
    } else {
      handleSignIn();
    }
  };

  // Close dropdown if clicking outside of it
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);


  return (
    <header className="bg-white shadow-sm sticky top-0 z-30"> {/* Increased z-index */}
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo Link (already correct) */}
        <Link href="/" className="text-xl font-bold text-teal-600">
          ReWear
        </Link>

        {/* Search Input */}
        <div className="flex-grow max-w-md">
          <input
            type="text"
            placeholder="Search items and descriptions..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        {/* Navigation */}
        <nav className="flex items-center space-x-4">
          {status === 'loading' && (
            <div className="text-gray-500">Loading...</div>
          )}

          {status === 'unauthenticated' && (
            <>
              <button onClick={handleSignUp} className="text-gray-600 hover:text-teal-600">
                Sign up
              </button>
              <button onClick={handleSignIn} className="text-gray-600 hover:text-teal-600">
                Log in
              </button>
            </>
          )}

          {/* === Authenticated User Section with Dropdown === */}
          {status === 'authenticated' && session && (
            <div className="relative" ref={dropdownRef}> {/* Added relative positioning and ref */}
              {/* --- Dropdown Trigger --- */}
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)} // Toggle dropdown on click
                className="flex items-center text-gray-700 hover:text-teal-600 focus:outline-none"
                aria-haspopup="true"
                aria-expanded={isDropdownOpen}
              >
                Hi, {session.user?.name?.split(' ')[0] || 'User'}!
                {/* Simple arrow indicator */}
                <svg className={`w-4 h-4 ml-1 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </button>

              {/* --- Dropdown Menu --- */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-40 ring-1 ring-black ring-opacity-5"> {/* Dropdown styles */}
                  {/* Profile Link */}
                  <Link
                    href="/dashboard" // Assuming '/profile' is your profile page route
                    onClick={() => setIsDropdownOpen(false)} // Close dropdown on click
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-teal-600"
                  >
                    Profile
                  </Link>

                   {/* Buyer Dashboard Link */}
                   <Link
                     href="/dashboard/buyer/dashboard"
                     onClick={() => setIsDropdownOpen(false)}
                     className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-teal-600"
                   >
                     Buyer Dashboard
                   </Link>

                   {/* Seller Dashboard Link */}
                   <Link
                     href="/dashboard/seller/dashboard"
                     onClick={() => setIsDropdownOpen(false)}
                     className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-teal-600"
                   >
                     Seller Dashboard
                   </Link>

                    {/* Settings Link */}
                   <Link
                     href="/settings" // Assuming '/settings' is your settings page route
                     onClick={() => setIsDropdownOpen(false)}
                     className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-teal-600"
                   >
                     Settings
                   </Link>

                  {/* Logout Button */}
                  <button
                    onClick={handleLogout} // Use the existing handleLogout
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-red-600" // Added red hover for logout
                  >
                    Log out
                  </button>
                </div>
              )}
            </div>
          )}
          {/* === End of Authenticated User Section === */}

          {/* Sell Now Button (remains outside the dropdown) */}
          <button onClick={handleSellNow} className="bg-teal-500 text-white px-4 py-2 rounded-md hover:bg-teal-600 transition-colors">
            Sell now
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header;