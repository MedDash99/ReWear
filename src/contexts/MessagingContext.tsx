'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { 
  Message, 
  Conversation, 
  SendMessageParams,
  MessageRealtimePayload 
} from '../types/messaging';
import {
  getConversations,
  getMessages,
  sendMessage,
  markMessagesAsRead,
  getUnreadMessageCount,
  subscribeToMessages,
  generateConversationId
} from '../lib/supabase';
import { toast } from 'sonner';

interface MessagingContextType {
  // State
  conversations: Conversation[];
  currentConversation: string | null;
  currentMessages: Message[];
  unreadCount: number;
  isLoading: boolean;
  isSending: boolean;

  // Actions
  loadConversations: () => Promise<void>;
  openConversation: (conversationId: string) => Promise<void>;
  openConversationWithUser: (otherUserId: string, itemId?: string) => Promise<void>;
  closeConversation: () => void;
  sendNewMessage: (params: SendMessageParams) => Promise<void>;
  markAsRead: (conversationId: string) => Promise<void>;
  startConversationWithUser: (receiverId: string, itemId?: string) => string;
  
  // Utilities
  getConversationId: (userId1: string, userId2: string, itemId?: string) => string;
}

const MessagingContext = createContext<MessagingContextType | undefined>(undefined);

export const useMessaging = () => {
  const context = useContext(MessagingContext);
  if (!context) {
    throw new Error('useMessaging must be used within a MessagingProvider');
  }
  return context;
};

interface MessagingProviderProps {
  children: React.ReactNode;
}

export const MessagingProvider: React.FC<MessagingProviderProps> = ({ children }) => {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  // State
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<string | null>(null);
  const [currentMessages, setCurrentMessages] = useState<Message[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Load conversations for the current user
  const loadConversations = useCallback(async () => {
    if (!userId) return;
    
    setIsLoading(true);
    try {
      console.log('Loading conversations for user:', userId);
      const response = await fetch('/api/conversations');
      if (!response.ok) {
        throw new Error(`Failed to fetch conversations: ${response.status}`);
      }
      const data = await response.json();
      console.log('Loaded conversations:', data.length, 'conversations');
      setConversations(data);
      
      // Calculate unread count from conversations
      const totalUnread = data.reduce((sum: number, conv: any) => sum + (conv.unread_count || 0), 0);
      setUnreadCount(totalUnread);
      console.log('Total unread messages:', totalUnread);
    } catch (error) {
      console.error('Error loading conversations:', error);
      toast.error('Failed to load conversations');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Open a specific conversation
  const openConversation = useCallback(async (conversationId: string) => {
    if (!userId) return;
    
    setCurrentConversation(conversationId);
    setIsLoading(true);
    
    try {
      const response = await fetch(`/api/messages?conversation_id=${conversationId}`);
      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('Access denied to this conversation');
        }
        if (response.status === 404) {
          // This might be a new conversation that doesn't exist yet
          console.log('No messages found for conversation - this might be a new conversation');
          setCurrentMessages([]);
          return;
        }
        throw new Error(`Failed to fetch messages: ${response.status}`);
      }
      const messages = await response.json();
      setCurrentMessages(messages);
      
      console.log(`Loaded ${messages.length} messages for conversation ${conversationId}`);
      
      // Mark messages as read (we'll implement this later if needed)
      // await markMessagesAsRead({ conversation_id: conversationId, receiver_id: userId });
      
      // Refresh conversations to update unread counts
      await loadConversations();
    } catch (error) {
      console.error('Error opening conversation:', error);
      // For new conversations that don't exist yet, just set empty messages
      setCurrentMessages([]);
    } finally {
      setIsLoading(false);
    }
  }, [userId, loadConversations]);

  // Open conversation with a specific user (creates if doesn't exist)
  const openConversationWithUser = useCallback(async (otherUserId: string, itemId?: string) => {
    if (!userId) return;
    
    const conversationId = generateConversationId(userId, otherUserId, itemId);
    console.log(`Opening conversation with user ${otherUserId}, generated conversation ID: ${conversationId}`);
    await openConversation(conversationId);
  }, [userId, openConversation]);

  // Close current conversation
  const closeConversation = useCallback(() => {
    setCurrentConversation(null);
    setCurrentMessages([]);
  }, []);

  // Send a new message
  const sendNewMessage = useCallback(async (params: SendMessageParams) => {
    if (!userId) return;
    
    setIsSending(true);
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to send message: ${response.status}`);
      }

      const message = await response.json();
      
      // Generate the conversation ID to compare
      const expectedConversationId = generateConversationId(userId, params.receiver_id, params.item_id);
      
      // If this is the current conversation OR if we don't have a current conversation but this is the expected one, add the message immediately
      if (currentConversation === message.conversation_id || 
          (!currentConversation && expectedConversationId === message.conversation_id)) {
        setCurrentMessages(prev => [...prev, message]);
        
        // Set the current conversation if it wasn't set
        if (!currentConversation) {
          setCurrentConversation(message.conversation_id);
        }
      }
      
      // Refresh conversations to update last message
      await loadConversations();
      
      toast.success('Message sent');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to send message');
    } finally {
      setIsSending(false);
    }
  }, [userId, currentConversation, loadConversations]);

  // Mark conversation as read
  const markAsRead = useCallback(async (conversationId: string) => {
    if (!userId) return;
    
    try {
      await markMessagesAsRead({ conversation_id: conversationId, receiver_id: userId });
      await loadConversations();
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  }, [userId, loadConversations]);

  // Start a new conversation with a user
  const startConversationWithUser = useCallback((receiverId: string, itemId?: string): string => {
    if (!userId) throw new Error('User must be logged in');
    
    const conversationId = generateConversationId(userId, receiverId, itemId);
    return conversationId;
  }, [userId]);

  // Utility to get conversation ID
  const getConversationId = useCallback((userId1: string, userId2: string, itemId?: string): string => {
    return generateConversationId(userId1, userId2, itemId);
  }, []);

  // Real-time subscription
  useEffect(() => {
    if (!userId) return;

    const subscription = subscribeToMessages(userId, (payload: MessageRealtimePayload) => {
      const { eventType, new: newMessage, old: oldMessage } = payload;

      if (eventType === 'INSERT' && newMessage) {
        // New message received
        if (currentConversation === newMessage.conversation_id) {
          // Add to current conversation if it's open
          setCurrentMessages(prev => {
            // Avoid duplicates
            if (prev.some(msg => msg.id === newMessage.id)) {
              return prev;
            }
            return [...prev, newMessage];
          });
        }

        // Show notification if not in current conversation
        if (newMessage.receiver_id === userId && currentConversation !== newMessage.conversation_id) {
          toast.info(`New message from ${newMessage.sender?.name || 'someone'}`);
        }

        // Refresh conversations and unread count
        loadConversations();
      } else if (eventType === 'UPDATE' && newMessage && oldMessage) {
        // Message updated (likely marked as read)
        if (currentConversation === newMessage.conversation_id) {
          setCurrentMessages(prev => 
            prev.map(msg => msg.id === newMessage.id ? newMessage : msg)
          );
        }
        
        // Refresh conversations to update unread counts
        loadConversations();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [userId, currentConversation, loadConversations]);

  // Load conversations on mount
  useEffect(() => {
    if (userId) {
      loadConversations();
    }
  }, [userId, loadConversations]);

  const value: MessagingContextType = {
    // State
    conversations,
    currentConversation,
    currentMessages,
    unreadCount,
    isLoading,
    isSending,

    // Actions
    loadConversations,
    openConversation,
    openConversationWithUser,
    closeConversation,
    sendNewMessage,
    markAsRead,
    startConversationWithUser,
    
    // Utilities
    getConversationId
  };

  return (
    <MessagingContext.Provider value={value}>
      {children}
    </MessagingContext.Provider>
  );
}; 