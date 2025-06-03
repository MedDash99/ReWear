import { createClient } from '@supabase/supabase-js';
import { hash } from 'bcryptjs';

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