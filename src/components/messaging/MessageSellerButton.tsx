'use client';

import React, { useState } from 'react';
import { Button } from '../ui/button';
import { useSession } from 'next-auth/react';
import { MessageCircle } from 'lucide-react';
import { ChatModal } from './ChatModal';
import { toast } from 'sonner';

interface MessageSellerButtonProps {
  sellerId: string;
  sellerName?: string;
  itemId: string;
  itemTitle?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

export const MessageSellerButton: React.FC<MessageSellerButtonProps> = ({
  sellerId,
  sellerName,
  itemId,
  itemTitle,
  variant = 'outline',
  size = 'default',
  className
}) => {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const [isChatOpen, setIsChatOpen] = useState(false);

  const handleClick = () => {
    if (!userId) {
      toast.error('Please log in to send messages');
      return;
    }

    if (userId === sellerId) {
      toast.error('You cannot message yourself');
      return;
    }

    setIsChatOpen(true);
  };

  if (!userId) {
    return (
      <Button 
        variant={variant} 
        size={size} 
        className={className}
        onClick={() => toast.error('Please log in to send messages')}
      >
        <MessageCircle className="w-4 h-4 mr-2" />
        Message Seller
      </Button>
    );
  }

  // Don't show button if user is the seller
  if (userId === sellerId) {
    return null;
  }

  return (
    <>
      <Button 
        variant={variant} 
        size={size} 
        className={className}
        onClick={handleClick}
      >
        <MessageCircle className="w-4 h-4 mr-2" />
        Message {sellerName ? sellerName : 'Seller'}
      </Button>

      <ChatModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        otherUserId={sellerId}
        otherUserName={sellerName}
        itemId={itemId}
      />
    </>
  );
}; 