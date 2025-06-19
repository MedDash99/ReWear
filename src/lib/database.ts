import { createClient } from '@/utils/supabase/client';
import type { CategoryId } from '@/lib/categories';
import type { SupabaseClient } from '@supabase/supabase-js';
import { hash } from 'bcryptjs';

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
  language: string | null;
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
  const supabase = await createClient();
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
        phone: null,
        language: 'english' // Default language for new users
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
  const supabase = await createClient();
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
  const supabase = await createClient();
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
  category?: CategoryId;
  image_url?: string;
  cloudinary_public_id?: string;
  status?: string;
  seller_id: string;
}) => {
  const supabase = await createClient();
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
  const supabase = await createClient();
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
  const supabase = await createClient();
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
  const supabase = await createClient();
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
  const supabase = await createClient();
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
  const supabase = await createClient();
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
  const supabase = await createClient();
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
  const supabase = await createClient();
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

// Helper function to get client directly if needed
export const getSupabaseClient = async () => {
  return await createClient();
};

// Favorites functions
export const addToFavorites = async (userId: string, itemId: number) => {
  const supabase = await createClient();
  const { error } = await supabase
    .from('favorites')
    .upsert({ 
      user_id: userId, 
      item_id: itemId 
    }, { 
      onConflict: 'user_id,item_id' 
    });

  if (error) {
    console.error("Error adding to favorites:", error);
    throw error;
  }
};

export const removeFromFavorites = async (userId: string, itemId: number) => {
  const supabase = await createClient();
  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('user_id', userId)
    .eq('item_id', itemId);

  if (error) {
    console.error("Error removing from favorites:", error);
    throw error;
  }
};

export const getUserFavorites = async (userId: string) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('favorites')
    .select('item_id')
    .eq('user_id', userId);

  if (error) {
    console.error("Error getting user favorites:", error);
    throw error;
  }

  return data?.map(fav => fav.item_id) || [];
};

export const getUserFavoritesWithItems = async (userId: string) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('favorites')
    .select(`
      item_id,
      created_at,
      items (
        id,
        name,
        description,
        price,
        image_url,
        category,
        seller_id,
        users!items_seller_id_fkey (
          id,
          name,
          profile_image_url
        )
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error getting favorites with items:", error);
    throw error;
  }

  return data || [];
};

// Additional item functions for API routes
export const getItemById = async (id: number) => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('items')
    .select(`
      *,
      users!seller_id (
        name,
        profile_image_url
      )
    `)
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') { // No rows returned
      return null;
    }
    console.error("Error getting item by ID:", error);
    throw error;
  }

  return data;
};

export const updateItem = async (id: number, updates: {
  name?: string;
  description?: string;
  price?: number;
  category?: CategoryId;
  status?: string;
}) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('items')
    .update(updates)
    .eq('id', id)
    .select(`
      *,
      users!seller_id (
        name,
        profile_image_url
      )
    `)
    .single();

  if (error) {
    console.error("Error updating item:", error);
    throw error;
  }

  return data;
};

export const deleteItem = async (id: number) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('items')
    .delete()
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error("Error deleting item:", error);
    throw error;
  }

  return data;
};

// User preferences functions
export const updateUserLanguage = async (userId: string, language: string) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('users')
    .update({ language })
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error("Error updating user language:", error);
    throw error;
  }

  return data;
};

export const updateUserGoogleId = async (userId: string, googleId: string) => {
  const supabase = await createClient();
  const { error } = await supabase
    .from('users')
    .update({ google_id: googleId })
    .eq('id', userId);

  if (error) {
    console.error("Error updating user Google ID:", error);
    throw error;
  }
};

// User profile image functions
export const uploadUserProfileImage = async (supabase: SupabaseClient, userId: string, file: File | Buffer): Promise<string> => {
  const fileExt = file instanceof File ? file.name.split('.').pop() : 'webp';
  const fileName = `avatar.${fileExt}`; // Use a consistent name for easier management
  const filePath = `${userId}/${fileName}`; // Changed to match RLS policy requirements

  const { data, error } = await supabase.storage
    .from('user-icons')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true // This will overwrite existing files
    });

  if (error) {
    console.error('Error uploading profile image:', error);
    throw error;
  }

  // Get the public URL
  const { data: { publicUrl } } = supabase.storage
    .from('user-icons')
    .getPublicUrl(filePath);

  return publicUrl;
};

export const updateUserProfileImage = async (supabase: SupabaseClient, userId: string, imageUrl: string) => {
  const { data, error } = await supabase
    .from('users')
    .update({ profile_image_url: imageUrl })
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating user profile image:', error);
    throw error;
  }

  return data;
};

export const deleteUserProfileImage = async (supabase: SupabaseClient, userId: string) => {
  // First, list all files in the user's folder
  const { data: files, error: listError } = await supabase.storage
    .from('user-icons')
    .list(userId);

  if (listError) {
    console.error('Error listing files:', listError);
    throw listError;
  }

  // If files exist, delete them
  if (files && files.length > 0) {
    const filesToDelete = files.map((file: any) => `${userId}/${file.name}`);
    
    const { error: deleteError } = await supabase.storage
      .from('user-icons')
      .remove(filesToDelete);

    if (deleteError) {
      console.error('Error deleting profile image from storage:', deleteError);
      throw deleteError;
    }
  }

  // Update user record to remove profile image URL
  const { data, error } = await supabase
    .from('users')
    .update({ profile_image_url: null })
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating user profile image:', error);
    throw error;
  }

  return data;
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
 * Send a message to another user
 */
export const sendMessage = async (params: { sender_id: string; receiver_id: string; content: string; item_id?: string }) => {
  const supabase = await createClient();
  const { sender_id, receiver_id, content, item_id } = params;
  
  // Validate input parameters
  if (!sender_id || !receiver_id || !content?.trim()) {
    throw new Error('Missing required parameters: sender_id, receiver_id, and content are required');
  }
  
  if (sender_id === receiver_id) {
    throw new Error('Sender and receiver cannot be the same user');
  }
  
  // Generate conversation ID
  const conversation_id = generateConversationId(sender_id, receiver_id, item_id);
  
  const messageData = {
    sender_id,
    receiver_id,
    content: content.trim(),
    conversation_id,
    item_id: item_id ? parseInt(item_id) : null,
    read: false
  };
  
  const { data, error } = await supabase
    .from('messages')
    .insert(messageData)
    .select('*')
    .single();

  if (error) {
    console.error("Error sending message:", error);
    throw error;
  }

  // Return message with basic user placeholders
  return {
    ...data,
    sender: {
      id: data.sender_id,
      name: 'You',
      profile_image_url: null
    },
    receiver: {
      id: data.receiver_id,
      name: 'User',
      profile_image_url: null
    },
    item: null
  };
};

/**
 * Get messages for a conversation
 */
export const getMessages = async (params: { conversation_id: string; limit?: number; offset?: number }) => {
  const supabase = await createClient();
  const { conversation_id, limit = 50, offset = 0 } = params;
  
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversation_id)
    .order('created_at', { ascending: true })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error("Error fetching messages:", error);
    if (error.code === 'PGRST116') {
      return []; // No rows returned - normal for new conversations
    }
    throw error;
  }

  // Return messages with basic user placeholders
  return (data || []).map(message => ({
    ...message,
    sender: {
      id: message.sender_id,
      name: 'User',
      profile_image_url: null
    },
    receiver: {
      id: message.receiver_id,
      name: 'User',
      profile_image_url: null
    },
    item: null
  }));
};

/**
 * Get conversations for a user
 */
export const getConversations = async (params: { user_id: string; limit?: number; offset?: number }) => {
  const supabase = await createClient();
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
  const conversations: any[] = [];
  
  for (const conversationId of uniqueConversationIds.slice(offset, offset + limit)) {
    // Get the latest message for this conversation
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

    // Create placeholder participants
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

    conversations.push({
      id: conversationId,
      participants,
      last_message: {
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
        item: null
      },
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
export const markMessagesAsRead = async (params: { conversation_id: string; receiver_id: string }) => {
  const supabase = await createClient();
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
  const supabase = await createClient();
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
  // For now, we'll return a placeholder since this requires the direct Supabase client
  // You might need to implement this differently based on your Supabase setup
  console.log('subscribeToMessages placeholder - implement based on your needs');
  return {
    unsubscribe: () => console.log('Unsubscribed from messages')
  };
}; 