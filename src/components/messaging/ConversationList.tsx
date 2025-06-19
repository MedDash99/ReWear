'use client';

import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { UserAvatar } from '../ui/UserAvatar';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { Card, CardContent } from '../ui/card';
import { useMessaging } from '../../contexts/MessagingContext';
import { useSession } from 'next-auth/react';
import { formatDistanceToNow } from 'date-fns';
import { MessageCircle, Clock } from 'lucide-react';
import { Conversation } from '../../types/messaging';
import { ChatModal } from './ChatModal';

interface ConversationListProps {
  className?: string;
}

export const ConversationList: React.FC<ConversationListProps> = ({ className }) => {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  
  const { conversations, isLoading } = useMessaging();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [selectedOtherUserId, setSelectedOtherUserId] = useState<string | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  const getOtherParticipant = (conversation: Conversation) => {
    return conversation.participants.find(p => p.id !== userId);
  };

  const formatLastMessageTime = (timestamp: string) => {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  };

  const handleConversationClick = (conversation: Conversation) => {
    const otherParticipant = getOtherParticipant(conversation);
    if (otherParticipant) {
      setSelectedConversation(conversation.id);
      setSelectedOtherUserId(otherParticipant.id);
      setSelectedItemId(conversation.item?.id || null);
    }
  };

  const closeChat = () => {
    setSelectedConversation(null);
    setSelectedOtherUserId(null);
    setSelectedItemId(null);
  };

  if (!userId) {
    return (
      <div className={`p-4 text-center text-gray-500 ${className}`}>
        Please log in to view your messages.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={`p-4 ${className}`}>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-center space-x-3 p-3">
                <div className="rounded-full bg-gray-300 h-12 w-12"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="flex items-center gap-2 p-4 border-b">
        <MessageCircle className="w-5 h-5 text-blue-500" />
        <h2 className="font-semibold text-lg">Messages</h2>
        {conversations.length > 0 && (
          <Badge variant="secondary" className="ml-auto">
            {conversations.length}
          </Badge>
        )}
      </div>

      <ScrollArea className="h-[500px]">
        {conversations.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="font-medium">No conversations yet</p>
            <p className="text-sm">Start a conversation by messaging someone about an item!</p>
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {conversations.map((conversation) => {
              const otherParticipant = getOtherParticipant(conversation);
              
              if (!otherParticipant) return null;

              return (
                <Card
                  key={conversation.id}
                  className={`cursor-pointer transition-colors hover:bg-gray-50 ${
                    conversation.unread_count > 0 ? 'bg-blue-50 border-blue-200' : ''
                  }`}
                  onClick={() => handleConversationClick(conversation)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center gap-3">
                      {/* Avatar */}
                      <div className="relative">
                        <UserAvatar 
                          user={{
                            name: otherParticipant.name,
                            profile_image_url: otherParticipant.profile_image_url
                          }}
                          size="lg"
                        />
                        {conversation.unread_count > 0 && (
                          <Badge 
                            variant="destructive" 
                            className="absolute -top-1 -right-1 w-5 h-5 rounded-full p-0 flex items-center justify-center text-xs"
                          >
                            {conversation.unread_count > 99 ? '99+' : conversation.unread_count}
                          </Badge>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className={`font-medium truncate ${
                            conversation.unread_count > 0 ? 'text-black' : 'text-gray-900'
                          }`}>
                            {otherParticipant.name || 'Unknown User'}
                          </h3>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Clock className="w-3 h-3" />
                            <span>
                              {conversation.last_message && 
                                formatLastMessageTime(conversation.last_message.created_at)}
                            </span>
                          </div>
                        </div>

                        {/* Item info if available */}
                        {conversation.item && (
                          <p className="text-xs text-blue-600 font-medium truncate">
                            Re: {conversation.item.title}
                          </p>
                        )}

                        {/* Last message */}
                        {conversation.last_message && (
                          <p className={`text-sm truncate ${
                            conversation.unread_count > 0 ? 'text-gray-700 font-medium' : 'text-gray-500'
                          }`}>
                            {conversation.last_message.sender_id === userId ? 'You: ' : ''}
                            {conversation.last_message.content}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Item thumbnail if available */}
                    {conversation.item && conversation.item.image_urls && (
                      <div className="mt-2 flex items-center gap-2 p-2 bg-gray-50 rounded">
                        <img
                          src={JSON.parse(conversation.item.image_urls)[0]}
                          alt={conversation.item.title}
                          className="w-8 h-8 object-cover rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">{conversation.item.title}</p>
                          <p className="text-xs text-green-600 font-semibold">
                            ${(conversation.item.price_cents / 100).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </ScrollArea>

      {/* Chat Modal */}
      <ChatModal
        isOpen={!!selectedConversation}
        onClose={closeChat}
        conversationId={selectedConversation || undefined}
        otherUserId={selectedOtherUserId || undefined}
        itemId={selectedItemId || undefined}
      />
    </div>
  );
}; 