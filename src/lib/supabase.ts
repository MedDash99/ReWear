import { createClient } from '@supabase/supabase-js';
import { hash } from 'bcryptjs';
import { Message, Conversation, SendMessageParams, ConversationListParams, MessagesParams, MarkAsReadParams } from '../types/messaging';

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// User interface - updated for Supabase types
export interface UserFromDB {
  id: string;
  google_id: string | null;
  name: string | null;
  email: string;
  password_hash: string | null;
  profile_image_url: string | null;
  rating: number;
  cart: string | null;
  wishlist: string | null;
  address: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

// Database utility functions

export const createUser = async (
  email: string, 
  password: string, 
  name?: string, 
  googleSubId?: string
) => {
  const hashedPassword = password ? await hash(password, 12) : null;

  try {
    const { data, error } = await supabase
      .from('users')
      .insert({
        email,
        password_hash: hashedPassword,
        name: name || null,
        google_id: googleSubId || null,
        profile_image_url: null,
        rating: 0.0,
        cart: null,
        wishlist: null,
        address: null,
        phone: null
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') { // PostgreSQL unique constraint violation
        if (error.message.includes('users_email_key')) {
          throw new Error('User with this email already exists');
        } else if (error.message.includes('users_google_id_key') && googleSubId) {
          throw new Error('User with this Google ID already exists');
        }
      }
      console.error("Error creating user:", error);
      throw error;
    }

    return {
      id: data.id,
      email: data.email,
      name: data.name,
      googleId: data.google_id
    };
  } catch (error: any) {
    console.error("Error creating user:", error);
    throw error;
  }
};

export const findUserByEmail = async (email: string): Promise<UserFromDB | null> => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (error) {
    if (error.code === 'PGRST116') { // No rows returned
      return null;
    }
    console.error("Error finding user by email:", error);
    throw error;
  }

  return data;
};

export const findUserById = async (id: string): Promise<UserFromDB | null> => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') { // No rows returned
      return null;
    }
    console.error("Error finding user by ID:", error);
    throw error;
  }

  return data;
};

// Items functions
export const createItem = async (item: {
  name: string;
  description?: string;
  price: number;
  category?: string;
  image_url?: string;
  cloudinary_public_id?: string;
  status?: string;
  seller_id: string;
}) => {
  const { data, error } = await supabase
    .from('items')
    .insert(item)
    .select()
    .single();

  if (error) {
    console.error("Error creating item:", error);
    throw error;
  }

  return data;
};

export const getItemsBySeller = async (sellerId: string) => {
  const { data, error } = await supabase
    .from('items')
    .select('*')
    .eq('seller_id', sellerId);

  if (error) {
    console.error("Error getting items by seller:", error);
    throw error;
  }

  return data;
};

export const getAllItems = async () => {
  const { data, error } = await supabase
    .from('items')
    .select('*')
    .eq('status', 'Active')
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error getting all items:", error);
    throw error;
  }

  return data;
};

// Listings functions
export const createListing = async (listing: {
  user_id: string;
  title: string;
  description?: string;
  price_cents: number;
  category?: string;
  brand?: string;
  size?: string;
  condition?: string;
  image_urls?: string;
}) => {
  const { data, error } = await supabase
    .from('listings')
    .insert(listing)
    .select()
    .single();

  if (error) {
    console.error("Error creating listing:", error);
    throw error;
  }

  return data;
};

export const getListingById = async (id: string) => {
  const { data, error } = await supabase
    .from('listings')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error("Error getting listing by ID:", error);
    throw error;
  }

  return data;
};

export const getAllListings = async () => {
  const { data, error } = await supabase
    .from('listings')
    .select('*')
    .eq('is_sold', false)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error getting all listings:", error);
    throw error;
  }

  return data;
};

// Offers functions
export const createOffer = async (offer: {
  product_id: number;
  buyer_id: string;
  offer_price: number;
  message?: string;
}) => {
  const { data, error } = await supabase
    .from('offers')
    .insert(offer)
    .select()
    .single();

  if (error) {
    console.error("Error creating offer:", error);
    throw error;
  }

  return data;
};

export const getOffersByProduct = async (productId: number) => {
  const { data, error } = await supabase
    .from('offers')
    .select('*')
    .eq('product_id', productId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error getting offers by product:", error);
    throw error;
  }

  return data;
};

// Helper function for backward compatibility
export const getDB = () => {
  return supabase;
};

/**
 * Test database connectivity and table structure
 */
export const testDatabaseConnection = async () => {
  try {
    console.log('Testing database connection...');
    
    // Test basic table access
    const { data: tableTest, error: tableError } = await supabase
      .from('messages')
      .select('count')
      .limit(1);
    
    if (tableError) {
      console.error('Table access error:', tableError);
      return { success: false, error: tableError };
    }
    
    console.log('Messages table accessible');
    
    // Test auth user access
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('Auth user error:', userError);
      return { success: false, error: userError };
    }
    
    console.log('Current authenticated user:', user);
    
    return { 
      success: true, 
      user,
      tableAccessible: true 
    };
    
  } catch (err) {
    console.error('Database test failed:', err);
    return { success: false, error: err };
  }
};

// ============================================================================
// MESSAGING FUNCTIONS
// ============================================================================

/**
 * Generate a deterministic conversation ID based on user IDs and optional item ID
 */
export const generateConversationId = (userId1: string, userId2: string, itemId?: string): string => {
  // Sort user IDs to ensure deterministic conversation ID
  const sortedUsers = [userId1, userId2].sort();
  
  // For basic user-to-user conversations, we don't include itemId to ensure one conversation per user pair
  // Only include itemId if it's explicitly provided and you want item-specific conversations
  const seed = `${sortedUsers[0]}|${sortedUsers[1]}`;
  
  // Create a simple hash from the seed
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  // Create a deterministic UUID v4-like string - exactly 36 characters
  // Take the absolute value and convert to hex
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  
  // Create more hex data for a full UUID
  const hash2 = Math.abs(hash * 31 + seed.length).toString(16).padStart(8, '0');
  const hash3 = Math.abs(hash * 17 + (seed.charCodeAt(0) || 0)).toString(16).padStart(8, '0');
  
  // Format as proper UUID: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx (36 chars total)
  const uuid = `${hex.slice(0, 8)}-${hash2.slice(0, 4)}-4${hash2.slice(1, 4)}-a${hash3.slice(0, 3)}-${hex.slice(0, 4)}${hash3.slice(0, 8)}`;
  
  // Ensure it's exactly 36 characters
  return uuid.slice(0, 36);
};

/**
 * Send a new message
 */
export const sendMessage = async (params: SendMessageParams & { sender_id: string }): Promise<Message> => {
  const { sender_id, receiver_id, content, item_id } = params;
  
  // Validate input parameters
  if (!sender_id || !receiver_id || !content?.trim()) {
    throw new Error('Missing required parameters: sender_id, receiver_id, and content are required');
  }
  
  if (sender_id === receiver_id) {
    throw new Error('Sender and receiver cannot be the same user');
  }
  
  console.log('Sending message with params:', {
    sender_id,
    receiver_id,
    content: content.trim(),
    item_id
  });
  
  // Generate conversation ID
  const conversation_id = generateConversationId(sender_id, receiver_id, item_id);
  console.log('Generated conversation_id:', conversation_id);
  
  const messageData = {
    sender_id,
    receiver_id,
    content: content.trim(),
    conversation_id,
    item_id: item_id ? parseInt(item_id) : null,
    read: false
  };
  
  console.log('Inserting message data:', messageData);
  
  const { data, error } = await supabase
    .from('messages')
    .insert(messageData)
    .select('*')
    .single();

  if (error) {
    console.error("Error sending message:", error);
    console.error("Full error details:", {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint
    });
    console.error("Message data that failed:", messageData);
    throw error;
  }

  console.log('Message sent successfully:', data);

  // Return message with placeholder user data
  const messageWithPlaceholders = {
    ...data,
    sender: {
      id: data.sender_id,
      name: 'You', // Placeholder for sender
      profile_image_url: null
    },
    receiver: {
      id: data.receiver_id,
      name: 'User', // Placeholder for receiver
      profile_image_url: null
    },
    item: null // Will be populated later if needed
  };

  return messageWithPlaceholders;
};

/**
 * Fetch messages for a conversation
 */
export const getMessages = async (params: MessagesParams): Promise<Message[]> => {
  const { conversation_id, limit = 50, offset = 0 } = params;
  
  try {
    // First, try a simple query without joins
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversation_id)
      .order('created_at', { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Error fetching messages:", error);
      console.error("Error details:", {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      
      // Handle specific error cases
      if (error.code === 'PGRST116') {
        // No rows returned - this is normal for new conversations
        return [];
      }
      
      if (error.code === '42P01') {
        // Table doesn't exist
        console.error("Messages table doesn't exist. Please check your database schema.");
        return [];
      }
      
      if (error.message?.includes('foreign') || error.message?.includes('violates') || error.message?.includes('column')) {
        // Foreign key or column issues
        console.error("Database schema issue detected. Please check your table relationships.");
        return [];
      }
      
      // For any other errors, return empty array for graceful degradation
      console.error("Unexpected database error, returning empty messages array");
      return [];
    }

    // For now, return messages without user/item details
    // We can add those later via separate queries if needed
    const messagesWithPlaceholders = (data || []).map(message => ({
      ...message,
      sender: {
        id: message.sender_id,
        name: 'User', // Placeholder
        profile_image_url: null
      },
      receiver: {
        id: message.receiver_id,
        name: 'User', // Placeholder
        profile_image_url: null
      },
      item: null // Will be populated later if needed
    }));

    return messagesWithPlaceholders;
  } catch (err) {
    console.error("Unexpected error fetching messages:", err);
    // For any unexpected error, return empty array for new conversations
    return [];
  }
};

/**
 * Get all conversations for a user
 */
export const getConversations = async (params: ConversationListParams): Promise<Conversation[]> => {
  const { user_id, limit = 20, offset = 0 } = params;
  
  // Get all unique conversation IDs where user is participant
  const { data: conversationIds, error: conversationError } = await supabase
    .from('messages')
    .select('conversation_id')
    .or(`sender_id.eq.${user_id},receiver_id.eq.${user_id}`)
    .order('created_at', { ascending: false });

  if (conversationError) {
    console.error("Error fetching conversation IDs:", conversationError);
    throw conversationError;
  }

  if (!conversationIds || conversationIds.length === 0) {
    return [];
  }

  // Get unique conversation IDs
  const uniqueConversationIds = [...new Set(conversationIds.map(c => c.conversation_id))];
  
  // For each conversation, get the latest message
  const conversations: Conversation[] = [];
  
  for (const conversationId of uniqueConversationIds.slice(offset, offset + limit)) {
    // Get the latest message for this conversation (without joins)
    const { data: latestMessage, error: messageError } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (messageError) {
      console.error(`Error fetching latest message for conversation ${conversationId}:`, messageError);
      continue;
    }

    // Get unread count for this user
    const { count: unreadCount, error: unreadError } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('conversation_id', conversationId)
      .eq('receiver_id', user_id)
      .eq('read', false);

    if (unreadError) {
      console.error(`Error fetching unread count for conversation ${conversationId}:`, unreadError);
    }

    // Create placeholder participants (sender and receiver)
    const participants = [
      {
        id: latestMessage.sender_id,
        name: 'User',
        profile_image_url: null
      },
      {
        id: latestMessage.receiver_id,
        name: 'User',
        profile_image_url: null
      }
    ].filter((p, index, arr) => arr.findIndex(item => item.id === p.id) === index); // Remove duplicates

    // Create the transformed latest message
    const transformedLatestMessage = {
      ...latestMessage,
      sender: {
        id: latestMessage.sender_id,
        name: latestMessage.sender_id === user_id ? 'You' : 'User',
        profile_image_url: null
      },
      receiver: {
        id: latestMessage.receiver_id,
        name: latestMessage.receiver_id === user_id ? 'You' : 'User',
        profile_image_url: null
      },
      item: null // Will be populated later if needed
    };

    conversations.push({
      id: conversationId,
      participants,
      last_message: transformedLatestMessage,
      unread_count: unreadCount || 0,
      item: undefined,
      updated_at: latestMessage.created_at
    });
  }

  // Sort by last message timestamp
  return conversations.sort((a, b) => 
    new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  );
};

/**
 * Mark messages as read
 */
export const markMessagesAsRead = async (params: MarkAsReadParams): Promise<void> => {
  const { conversation_id, receiver_id } = params;
  
  const { error } = await supabase
    .from('messages')
    .update({ read: true })
    .eq('conversation_id', conversation_id)
    .eq('receiver_id', receiver_id)
    .eq('read', false);

  if (error) {
    console.error("Error marking messages as read:", error);
    throw error;
  }
};

/**
 * Get unread message count for a user
 */
export const getUnreadMessageCount = async (userId: string): Promise<number> => {
  const { count, error } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .eq('receiver_id', userId)
    .eq('read', false);

  if (error) {
    console.error("Error fetching unread count:", error);
    throw error;
  }

  return count || 0;
};

/**
 * Subscribe to real-time message updates for a user
 */
export const subscribeToMessages = (
  userId: string,
  onMessage: (payload: any) => void
) => {
  return supabase
    .channel('messages')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'messages',
        filter: `or(sender_id.eq.${userId},receiver_id.eq.${userId})`
      },
      onMessage
    )
    .subscribe();
};

/**
 * Subscribe to real-time message updates for a specific conversation
 */
export const subscribeToConversation = (
  conversationId: string,
  onMessage: (payload: any) => void
) => {
  return supabase
    .channel(`conversation-${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id.eq.${conversationId}`
      },
      onMessage
    )
    .subscribe();
}; 