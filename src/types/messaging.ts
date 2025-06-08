// Messaging system types and interfaces

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  conversation_id: string; // UUID in database
  item_id?: number; // bigint in database, could be null
  read: boolean;
  
  // Populated fields from joins
  sender?: {
    id: string;
    name: string | null;
    profile_image_url: string | null;
  };
  receiver?: {
    id: string;
    name: string | null;
    profile_image_url: string | null;
  };
  item?: {
    id: string;
    title: string;
    image_urls: string | null;
    price_cents: number;
  };
}

export interface Conversation {
  id: string; // conversation_id (UUID)
  participants: {
    id: string;
    name: string | null;
    profile_image_url: string | null;
  }[];
  last_message: Message | null;
  unread_count: number;
  item?: {
    id: string;
    title: string;
    image_urls: string | null;
    price_cents: number;
  };
  updated_at: string;
}

export interface SendMessageParams {
  receiver_id: string;
  content: string;
  item_id?: string; // Will be converted to number/bigint in the function
}

export interface ConversationListParams {
  user_id: string;
  limit?: number;
  offset?: number;
}

export interface MessagesParams {
  conversation_id: string;
  limit?: number;
  offset?: number;
}

export interface MarkAsReadParams {
  conversation_id: string;
  receiver_id: string;
}

// Real-time subscription payload types
export interface MessageInsertPayload {
  eventType: 'INSERT';
  new: Message;
  old: null;
}

export interface MessageUpdatePayload {
  eventType: 'UPDATE';
  new: Message;
  old: Message;
}

export type MessageRealtimePayload = MessageInsertPayload | MessageUpdatePayload; 