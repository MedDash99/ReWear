"use client";

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import FavoritesPage from '@/components/ui/favoritesPage';

export default function Favorites() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  const handleLoginRequired = () => {
    signIn(undefined, { callbackUrl: '/favorites' });
  };

  return (
    <FavoritesPage onLoginRequired={handleLoginRequired} />
  );
} 