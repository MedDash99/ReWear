"use client";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  user?: {
    name?: string | null;
    image?: string | null;
    profile_image_url?: string | null;
  } | null;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeClasses = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-20 w-20 text-lg'
};

export function UserAvatar({ user, className, size = 'md' }: UserAvatarProps) {
  // Fallback logic: Custom profile image -> Google image -> Default
  let avatarSrc = user?.profile_image_url || user?.image || '/default-user.png';
  
  // Add cache-busting parameter to profile image URLs to prevent caching issues
  if (user?.profile_image_url && !user.profile_image_url.includes('default-user.png')) {
    const separator = user.profile_image_url.includes('?') ? '&' : '?';
    avatarSrc = `${user.profile_image_url}${separator}v=${Date.now()}`;
  }
  
  // Get user initials for fallback
  const getInitials = (name?: string | null) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Avatar className={cn(sizeClasses[size], className)}>
      <AvatarImage 
        src={avatarSrc} 
        alt={user?.name || 'User avatar'}
        referrerPolicy="no-referrer"
      />
      <AvatarFallback className="bg-teal-100 text-teal-700 font-medium">
        {getInitials(user?.name)}
      </AvatarFallback>
    </Avatar>
  );
} 