// components/Header.tsx
'use client'; // Mark as a Client Component

import React, { useState, useRef, useEffect } from 'react'; // Import useState, useRef, useEffect
import Link from 'next/link';
import { useSession, signIn, signOut } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import { Search, Menu, X } from 'lucide-react';
import { MessageIcon } from '../messaging';
import { useTranslation } from '@/i18n/useTranslation';
import { UserAvatar } from './UserAvatar';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSignInClick?: () => void;
  onSignUpClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ searchQuery, onSearchChange, onSignInClick, onSignUpClick }) => {
  const { t } = useTranslation();
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // State for dropdown visibility
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // State for mobile menu
  const [isSearchOpen, setIsSearchOpen] = useState(false); // State for mobile search
  const dropdownRef = useRef<HTMLDivElement>(null); // Ref to detect clicks outside

  const handleLogout = async () => {
    setIsDropdownOpen(false); // Close dropdown on logout
    setIsMobileMenuOpen(false); // Close mobile menu on logout
    await signOut({ callbackUrl: '/' });
  };

  const handleSignIn = () => {
    setIsMobileMenuOpen(false);
    if (onSignInClick) {
      onSignInClick();
    } else {
      signIn(undefined, { callbackUrl: '/' });
    }
  };

  const handleSignUp = () => {
    setIsMobileMenuOpen(false);
    if (onSignUpClick) {
      onSignUpClick();
    } else {
      signIn(undefined, { callbackUrl: '/' });
    }
  };

  const handleSellNow = () => {
    setIsMobileMenuOpen(false);
    if (status === 'authenticated') {
      router.push('/dashboard/seller/listings/new');
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
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-30">
      <div className="w-full px-6 py-4">
        {/* Desktop Layout */}
        <div className="hidden md:flex justify-between items-center">
          {/* Logo Link */}
          <Link href="/" className="text-xl font-bold text-teal-600">
            ReWear
          </Link>

          {/* Search Input */}
          <div className="flex-grow max-w-md mx-6">
            <div className="relative">
              <input
                type="text"
                placeholder={t('searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex items-center space-x-4">
            {status === 'loading' && (
              <div className="h-10 w-24 bg-gray-200 rounded-md animate-pulse" />
            )}

            {status === 'unauthenticated' && (
              <>
                <button onClick={handleSignUp} className="text-gray-600 hover:text-teal-600">
                  {t('signUp')}
                </button>
                <button onClick={handleSignIn} className="bg-teal-500 text-white px-4 py-2 rounded-md hover:bg-teal-600 transition-colors whitespace-nowrap">
                  {t('logIn')}
                </button>
              </>
            )}

            {/* === Authenticated User Section with Dropdown === */}
            {status === 'authenticated' && session?.user && (
              <>
                {/* Message Icon */}
                <MessageIcon />
                
                <div className="relative" ref={dropdownRef}>
                  {/* --- Dropdown Trigger --- */}
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center text-gray-700 hover:text-teal-600 focus:outline-none"
                    aria-haspopup="true"
                    aria-expanded={isDropdownOpen}
                  >
                    <UserAvatar 
                      size="sm"
                      className="mr-2"
                    />
                    <span className="hidden lg:inline">{t('hi')}, {session.user.name?.split(' ')[0]}</span>
                    <svg className={`w-4 h-4 ml-1 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </button>

                {/* --- Dropdown Menu --- */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-40 ring-1 ring-black ring-opacity-5">
                    <div className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-900 truncate">{session.user.name}</p>
                      <p className="text-sm text-gray-500 truncate">{session.user.email}</p>
                    </div>
                    <hr/>
                    <Link
                      href="/dashboard"
                      onClick={() => setIsDropdownOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-teal-600"
                    >
                      {t('dashboard')}
                    </Link>
                    <Link
                      href="/favorites"
                      onClick={() => setIsDropdownOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-teal-600"
                    >
                      {t('favorites')}
                    </Link>
                    <Link
                      href="/messages"
                      onClick={() => setIsDropdownOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-teal-600"
                    >
                      {t('messages')}
                    </Link>
                    <Link
                      href="/settings"
                      onClick={() => setIsDropdownOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-teal-600"
                    >
                      {t('settings')}
                    </Link>
                    <hr/>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600"
                    >
                      {t('logOut')}
                    </button>
                  </div>
                )}
              </div>
              </>
            )}

            {/* Sell Now Button */}
            <button onClick={handleSellNow} className="bg-teal-500 text-white px-4 py-2 rounded-md hover:bg-teal-600 transition-colors whitespace-nowrap">
              {t('sellNow')}
            </button>
          </nav>
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="text-xl font-bold text-teal-600">
              ReWear
            </Link>

            {/* Mobile Controls */}
            <div className="flex items-center space-x-1">
              {/* Message Icon for authenticated users */}
              {status === 'authenticated' && <MessageIcon />}
              
              {/* Search Toggle */}
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className={`p-3 rounded-lg transition-colors ${
                  isSearchOpen ? 'bg-teal-100 text-teal-600' : 'text-gray-600 hover:text-teal-600 hover:bg-gray-100'
                }`}
                aria-label={t('toggleSearch')}
              >
                <Search className="h-5 w-5" />
              </button>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={`p-3 rounded-lg transition-colors ${
                  isMobileMenuOpen ? 'bg-teal-100 text-teal-600' : 'text-gray-600 hover:text-teal-600 hover:bg-gray-100'
                }`}
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Search Bar */}
          {isSearchOpen && (
            <div className="mt-4 pb-4 border-b">
              <div className="relative">
                <input
                  type="text"
                  placeholder={t('searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-base"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
            </div>
          )}

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="mt-4 pb-4 border-b space-y-1">
              {status === 'loading' && (
                <div className="text-gray-500 text-center py-4">{t('loading')}</div>
              )}

              {status === 'unauthenticated' && (
                <div className="space-y-1">
                  <button
                    onClick={handleSignUp}
                    className="block w-full text-left px-4 py-3 text-gray-600 hover:text-teal-600 hover:bg-gray-50 rounded-lg"
                  >
                    {t('signUp')}
                  </button>
                  <button
                    onClick={handleSignIn}
                    className="bg-teal-500 text-white px-4 py-2 rounded-md hover:bg-teal-600 transition-colors whitespace-nowrap w-full"
                  >
                    {t('logIn')}
                  </button>
                </div>
              )}

              {status === 'authenticated' && session?.user && (
                <div className="space-y-1">
                  <div className="px-4 py-3 flex items-center gap-3">
                     <UserAvatar size="md" />
                    <div>
                      <p className="text-base font-medium text-gray-800">{session.user.name}</p>
                      <p className="text-sm text-gray-500">{session.user.email}</p>
                    </div>
                  </div>
                  <hr/>
                  <Link
                    href="/dashboard"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-4 py-3 text-gray-600 hover:text-teal-600 hover:bg-gray-50 rounded-lg"
                  >
                    {t('dashboard')}
                  </Link>
                  <Link
                    href="/favorites"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-4 py-3 text-gray-600 hover:text-teal-600 hover:bg-gray-50 rounded-lg"
                  >
                    {t('favorites')}
                  </Link>
                  <Link
                    href="/messages"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-4 py-3 text-gray-600 hover:text-teal-600 hover:bg-gray-50 rounded-lg"
                  >
                    {t('messages')}
                  </Link>
                  <Link
                    href="/settings"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-4 py-3 text-gray-600 hover:text-teal-600 hover:bg-gray-50 rounded-lg"
                  >
                    {t('settings')}
                  </Link>
                  <hr/>
                   <button
                    onClick={handleSellNow}
                    className="w-full bg-teal-500 text-white px-4 py-3 rounded-md hover:bg-teal-600 transition-colors"
                  >
                    {t('sellNow')}
                  </button>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    {t('logOut')}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;