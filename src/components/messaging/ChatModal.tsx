'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { UserAvatar } from '../ui/UserAvatar';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { useMessaging } from '../../contexts/MessagingContext';
import { useSession } from 'next-auth/react';
import { X, Send, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Message } from '../../types/messaging';

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversationId?: string;
  otherUserId?: string;
  otherUserName?: string;
  itemId?: string;
  embedded?: boolean;
}

interface UserInfo {
  id: string;
  name?: string;
  profile_image_url?: string;
}

export const ChatModal: React.FC<ChatModalProps> = ({
  isOpen,
  onClose,
  conversationId,
  otherUserId,
  otherUserName,
  itemId,
  embedded
}) => {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  
  const {
    currentMessages,
    currentConversation,
    isLoading,
    isSending,
    openConversation,
    openConversationWithUser,
    closeConversation,
    sendNewMessage,
    startConversationWithUser,
    getConversationId
  } = useMessaging();

  const [messageInput, setMessageInput] = useState('');
  const [otherUserInfo, setOtherUserInfo] = useState<UserInfo | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Determine the actual conversation ID
  const actualConversationId = conversationId || 
    (otherUserId && userId ? getConversationId(userId, otherUserId, itemId) : null);

  // Get other participant info from messages
  const otherParticipantFromMessages = currentMessages.length > 0 
    ? currentMessages[0].sender?.id === userId 
      ? currentMessages[0].receiver 
      : currentMessages[0].sender
    : null;

  // Use either the user info from messages, separately fetched user info, or passed user name
  const otherParticipant = otherParticipantFromMessages || otherUserInfo || (otherUserName ? { id: otherUserId || '', name: otherUserName } : null);

  // Get item info from messages if available
  const itemInfo = currentMessages.find(msg => msg.item)?.item;

  // Fetch user info when we have otherUserId but no messages and no provided user name
  useEffect(() => {
    const fetchUserInfo = async () => {
      if (!otherUserId || otherParticipantFromMessages || otherUserName) return;
      
      setIsLoadingUser(true);
      try {
        const response = await fetch(`/api/users/${otherUserId}`);
        if (response.ok) {
          const userData = await response.json();
          setOtherUserInfo(userData);
        } else {
          console.error('Failed to fetch user info:', response.status, response.statusText);
        }
      } catch (error) {
        console.error('Error fetching user info:', error);
      } finally {
        setIsLoadingUser(false);
      }
    };

    fetchUserInfo();
  }, [otherUserId, otherParticipantFromMessages, otherUserName]);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentMessages]);

  // Open conversation when modal opens
  useEffect(() => {
    if (isOpen && userId) {
      if (conversationId) {
        // Open by specific conversation ID
        if (conversationId !== currentConversation) {
          openConversation(conversationId);
        }
      } else if (otherUserId) {
        // Open by user ID (will use/create the proper conversation)
        openConversationWithUser(otherUserId, itemId);
      }
    }
  }, [isOpen, conversationId, otherUserId, itemId, userId, currentConversation, openConversation, openConversationWithUser]);

  // Close conversation when modal closes
  useEffect(() => {
    if (!isOpen) {
      closeConversation();
      setOtherUserInfo(null); // Clear user info when closing
    }
  }, [isOpen, closeConversation]);

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !otherUserId || !userId) return;

    try {
      await sendNewMessage({
        receiver_id: otherUserId,
        content: messageInput.trim(),
        item_id: itemId
      });
      setMessageInput('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatMessageTime = (timestamp: string) => {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  };

  const MessageBubble: React.FC<{ message: Message }> = ({ message }) => {
    const isOwnMessage = message.sender_id === userId;
    
    return (
      <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4`}>
        <div className={`flex max-w-[70%] ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'} items-end gap-2`}>
          <UserAvatar 
            user={{
              name: message.sender?.name,
              profile_image_url: message.sender?.profile_image_url
            }}
            size="sm"
          />
          
          <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'}`}>
            <div
              className={`px-4 py-2 rounded-lg ${
                isOwnMessage
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <p className="text-sm">{message.content}</p>
            </div>
            
            <div className="flex items-center gap-1 mt-1">
              <Clock className="w-3 h-3 text-gray-400" />
              <span className="text-xs text-gray-500">
                {formatMessageTime(message.created_at)}
              </span>
              {isOwnMessage && (
                <span className={`text-xs ${message.read ? 'text-blue-500' : 'text-gray-400'}`}>
                  {message.read ? 'Read' : 'Sent'}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return embedded ? (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <UserAvatar 
              user={{
                name: otherParticipant?.name,
                profile_image_url: otherParticipant?.profile_image_url
              }}
              size="md"
            />
            
            <div>
              <h2 className="text-lg font-semibold">
                {isLoadingUser ? 'Loading...' : (otherParticipant?.name || otherUserName || 'User')}
              </h2>
              {itemInfo && (
                <p className="text-sm text-gray-500">
                  About: {itemInfo.title}
                </p>
              )}
            </div>
          </div>
          
          <Button variant="ghost" size="sm" onClick={onClose} className="lg:hidden">
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        {itemInfo && (
          <div className="flex items-center gap-2 mt-2 p-2 bg-gray-50 rounded-lg">
            {itemInfo.image_urls && (
              <img
                src={JSON.parse(itemInfo.image_urls)[0]}
                alt={itemInfo.title}
                className="w-12 h-12 object-cover rounded"
              />
            )}
            <div>
              <p className="font-medium text-sm">{itemInfo.title}</p>
              <p className="text-green-600 font-semibold text-sm">
                ${(itemInfo.price_cents / 100).toFixed(2)}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4 bg-gray-50">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : currentMessages.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No messages yet.</p>
            <p className="text-sm">Start the conversation!</p>
          </div>
        ) : (
          <div>
            {currentMessages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t bg-white">
        <div className="flex items-center gap-2">
          <Input
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            disabled={isSending}
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!messageInput.trim() || isSending}
            size="sm"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  ) : (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md h-[600px] flex flex-col p-0">
        {/* Header */}
        <DialogHeader className="p-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <UserAvatar 
                user={{
                  name: otherParticipant?.name,
                  profile_image_url: otherParticipant?.profile_image_url
                }}
                size="md"
              />
              
              <div>
                <DialogTitle className="text-base">
                  {isLoadingUser ? 'Loading...' : (otherParticipant?.name || otherUserName || 'User')}
                </DialogTitle>
                {itemInfo && (
                  <p className="text-sm text-gray-500">
                    About: {itemInfo.title}
                  </p>
                )}
              </div>
            </div>
          </div>
          
          {itemInfo && (
            <div className="flex items-center gap-2 mt-2 p-2 bg-gray-50 rounded-lg">
              {itemInfo.image_urls && (
                <img
                  src={JSON.parse(itemInfo.image_urls)[0]}
                  alt={itemInfo.title}
                  className="w-12 h-12 object-cover rounded"
                />
              )}
              <div>
                <p className="font-medium text-sm">{itemInfo.title}</p>
                <p className="text-green-600 font-semibold text-sm">
                  ${(itemInfo.price_cents / 100).toFixed(2)}
                </p>
              </div>
            </div>
          )}
        </DialogHeader>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : currentMessages.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No messages yet.</p>
              <p className="text-sm">Start the conversation!</p>
            </div>
          ) : (
            <div>
              {currentMessages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>

        {/* Input */}
        <div className="p-4 border-t">
          <div className="flex items-center gap-2">
            <Input
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              disabled={isSending}
              className="flex-1"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!messageInput.trim() || isSending}
              size="sm"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 