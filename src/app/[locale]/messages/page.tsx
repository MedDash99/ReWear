'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useMessaging } from '@/contexts/MessagingContext';
import { ConversationList } from '@/components/messaging/ConversationList';
import { ChatModal } from '@/components/messaging/ChatModal';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MessageCircle } from 'lucide-react';
import MinimalHeader from '@/components/ui/minimalHeader';

export default function MessagesPage() {
  const { data: session } = useSession();
  const { conversations, isLoading } = useMessaging();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [selectedOtherUserId, setSelectedOtherUserId] = useState<string | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  if (!session?.user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MinimalHeader 
          showBackButton={true} 
          backHref="/" 
          backText="Home" 
          title="Messages"
        />
        <div className="flex items-center justify-center" style={{ height: 'calc(100vh - 64px)' }}>
          <div className="text-center p-8 transition-all duration-300 ease-in-out">
            <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">Sign In Required</h1>
            <p className="text-gray-600">Please sign in to view your messages.</p>
          </div>
        </div>
      </div>
    );
  }

  const handleConversationSelect = (conversationId: string, otherUserId: string, itemId?: string) => {
    setSelectedConversationId(conversationId);
    setSelectedOtherUserId(otherUserId);
    setSelectedItemId(itemId || null);
  };

  const handleBackToList = () => {
    setSelectedConversationId(null);
    setSelectedOtherUserId(null);
    setSelectedItemId(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <MinimalHeader 
        showBackButton={true} 
        backHref="/" 
        backText="Home" 
      />
      <div className="max-w-7xl mx-auto" style={{ height: 'calc(100vh - 64px)' }}>
        {/* Messages Header */}
        <div className="bg-white border-b border-gray-200 px-4 py-3 sm:px-6 transition-all duration-300 ease-in-out">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {selectedConversationId && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleBackToList}
                  className="lg:hidden"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              )}
              <div>
                <p className="text-gray-600">
                  {conversations.length === 0 
                    ? "No conversations yet" 
                    : `${conversations.length} conversation${conversations.length !== 1 ? 's' : ''}`
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex" style={{ height: 'calc(100vh - 124px)' }}>
          {/* Conversations List - Hidden on mobile when conversation is selected */}
          <div className={`w-full lg:w-1/3 xl:w-1/4 bg-white border-r border-gray-200 transition-all duration-300 ease-in-out ${
            selectedConversationId ? 'hidden lg:block' : 'block'
          }`}>
            <div className="h-full overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
                </div>
              ) : conversations.length === 0 ? (
                <div className="p-6 text-center">
                  <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No messages yet</h3>
                  <p className="text-gray-500 text-sm">
                    Start browsing products to connect with sellers!
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {conversations.map((conversation) => {
                    const otherParticipant = conversation.participants.find(
                      p => p.id !== session.user?.id
                    );
                    
                    if (!otherParticipant) return null;

                    return (
                      <div
                        key={conversation.id}
                        className={`p-4 cursor-pointer hover:bg-gray-50 transition-all duration-200 ${
                          selectedConversationId === conversation.id ? 'bg-teal-50 border-r-2 border-teal-600' : ''
                        }`}
                        onClick={() => handleConversationSelect(
                          conversation.id, 
                          otherParticipant.id, 
                          conversation.item?.id
                        )}
                      >
                        <div className="flex items-start gap-3">
                          {/* Avatar */}
                          <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                            <span className="text-teal-600 font-medium text-sm">
                              {otherParticipant.name?.charAt(0)?.toUpperCase() || '?'}
                            </span>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h3 className={`font-medium truncate ${
                                conversation.unread_count > 0 ? 'text-black' : 'text-gray-900'
                              }`}>
                                {otherParticipant.name || 'Unknown User'}
                              </h3>
                              {conversation.unread_count > 0 && (
                                <span className="bg-teal-600 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                                  {conversation.unread_count}
                                </span>
                              )}
                            </div>

                            {/* Item info if available */}
                            {conversation.item && (
                              <p className="text-xs text-blue-600 font-medium truncate mb-1">
                                Re: {conversation.item.title}
                              </p>
                            )}

                            {/* Last message */}
                            {conversation.last_message && (
                              <p className={`text-sm truncate ${
                                conversation.unread_count > 0 ? 'text-gray-700 font-medium' : 'text-gray-500'
                              }`}>
                                {conversation.last_message.sender_id === session.user?.id ? 'You: ' : ''}
                                {conversation.last_message.content}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Chat Area - Full width on mobile when conversation selected */}
          <div className={`flex-1 transition-all duration-300 ease-in-out ${
            selectedConversationId ? 'block' : 'hidden lg:flex lg:items-center lg:justify-center'
          } bg-white`}>
            {selectedConversationId && selectedOtherUserId ? (
              <div className="h-full">
                <ChatModal
                  isOpen={true}
                  onClose={handleBackToList}
                  conversationId={selectedConversationId}
                  otherUserId={selectedOtherUserId}
                  itemId={selectedItemId || undefined}
                  embedded={true}
                />
              </div>
            ) : (
              <div className="text-center p-8">
                <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">Select a conversation</h3>
                <p className="text-gray-600">
                  Choose a conversation from the list to start messaging.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 