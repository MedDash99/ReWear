'use client';

import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { useMessaging } from '../../contexts/MessagingContext';
import { useSession } from 'next-auth/react';
import { MessageCircle } from 'lucide-react';
import { ConversationList } from './ConversationList';

interface MessageIconProps {
  className?: string;
}

export const MessageIcon: React.FC<MessageIconProps> = ({ className }) => {
  const { data: session } = useSession();
  const { unreadCount } = useMessaging();
  const [isOpen, setIsOpen] = useState(false);

  if (!session?.user) {
    return null;
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className={`relative ${className}`}
          aria-label="Messages"
        >
          <MessageCircle className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 w-5 h-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent 
        className="w-96 p-0" 
        align="end"
        side="bottom"
        sideOffset={5}
      >
        <ConversationList />
      </PopoverContent>
    </Popover>
  );
}; 