// src/lib/db.ts
import Database, { type Database as BetterSqlite3Database } from 'better-sqlite3';
import { hash } from 'bcryptjs';
import crypto from 'crypto';

// Define a type for our global DB variable to avoid TypeScript errors with globalThis
declare global {
  // eslint-disable-next-line no-var
  var _db: BetterSqlite3Database | undefined;
}

let dbInstance: BetterSqlite3Database;

function initializeDB(): BetterSqlite3Database { // Ensure this function returns the db instance
  console.log("Initializing database connection...");
  // verbose: console.log can be very noisy, remove if not needed for debugging DB statements
  const db = new Database('./db/database.sqlite3', { /* verbose: console.log */ }); 

  // Initialize database with all tables
  db.exec(`
    -- 1. users table
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      googleId TEXT UNIQUE,
      name TEXT, 
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT,
      profile_image_url TEXT,
      rating REAL DEFAULT 0,
      cart TEXT, 
      wishlist TEXT, 
      address TEXT,
      phone TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 2. items table
    CREATE TABLE IF NOT EXISTS items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      category TEXT,
      imageUrl TEXT,
      cloudinaryPublicId TEXT,
      sellerId TEXT NOT NULL, 
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (sellerId) REFERENCES users(id)
    );

    -- 3. listings table
    CREATE TABLE IF NOT EXISTS listings (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL, 
      title TEXT NOT NULL,
      description TEXT,
      price_cents INTEGER NOT NULL,
      category TEXT,
      brand TEXT,
      size TEXT,
      condition TEXT,
      image_urls TEXT, 
      is_sold INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    -- 4. messages table
    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY, 
      sender_id TEXT NOT NULL, 
      receiver_id TEXT NOT NULL, 
      listing_id TEXT NOT NULL,
      content TEXT NOT NULL,
      sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (sender_id) REFERENCES users(id),
      FOREIGN KEY (receiver_id) REFERENCES users(id),
      FOREIGN KEY (listing_id) REFERENCES listings(id)
    );

    -- 5. orders table
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY, 
      buyer_id TEXT NOT NULL, 
      seller_id TEXT NOT NULL, 
      listing_id TEXT NOT NULL,
      status TEXT CHECK (status IN ('pending', 'paid', 'shipped', 'delivered', 'cancelled')),
      shipping_label_url TEXT,
      total_cents INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (buyer_id) REFERENCES users(id),
      FOREIGN KEY (seller_id) REFERENCES users(id),
      FOREIGN KEY (listing_id) REFERENCES listings(id)
    );

    -- 6. reviews table
    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY, 
      reviewer_id TEXT NOT NULL, 
      reviewee_id TEXT NOT NULL, 
      order_id TEXT NOT NULL,
      rating INTEGER CHECK (rating BETWEEN 1 AND 5),
      comment TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (reviewer_id) REFERENCES users(id),
      FOREIGN KEY (reviewee_id) REFERENCES users(id),
      FOREIGN KEY (order_id) REFERENCES orders(id)
    );
  `); // End of db.exec
  return db; // Return the initialized database instance
} // <<< THIS WAS THE LIKELY MISSING CLOSING BRACE FOR initializeDB()

// Initialize dbInstance using the HMR-friendly pattern
if (process.env.NODE_ENV === 'production') {
  dbInstance = initializeDB();
} else {
  if (!globalThis._db) {
    globalThis._db = initializeDB();
  }
  dbInstance = globalThis._db;
}

// Helper function to get the database instance
export const getDB = (): BetterSqlite3Database => dbInstance;

// --- Your DB utility functions now use getDB() to ensure they get the correct instance ---

export const createUser = async (email: string, password: string, name?: string, googleSubId?: string) => {
  const currentDb = getDB(); // Use getDB()
  const hashedPassword = password ? await hash(password, 12) : null;
  const id = crypto.randomUUID();

  try {
    const stmt = currentDb.prepare(`
      INSERT INTO users (
        id, email, password_hash, name, googleId, profile_image_url, rating, cart, wishlist, address, phone
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      email,
      hashedPassword,
      name || null,
      googleSubId || null, // Save googleSubId if provided
      null, // profile_image_url
      0.0,  // rating
      null, // cart
      null, // wishlist
      null, // address
      null  // phone
    );

    // Return the relevant user details, including the new ID
    return { id, email, name: name || null, googleId: googleSubId || null };
  } catch (error: any) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      if (error.message.includes('users.email')) {
        throw new Error('User with this email already exists');
      } else if (error.message.includes('users.googleId') && googleSubId) {
        // This check assumes you might want to prevent duplicate googleIds if you start storing them
        throw new Error('User with this Google ID already exists');
      }
    }
    console.error("Error creating user:", error);
    throw error; // Re-throw other errors
  }
};

interface UserFromDB { // Define an interface for what your DB returns
  id: string;
  googleId: string | null;
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

export const findUserByEmail = (email: string): UserFromDB | undefined => {
  const currentDb = getDB(); // Use getDB()
  return currentDb.prepare('SELECT * FROM users WHERE email = ?').get(email) as UserFromDB | undefined;
};

export const findUserById = (id: string): UserFromDB | undefined => {
  const currentDb = getDB(); // Use getDB()
  return currentDb.prepare('SELECT * FROM users WHERE id = ?').get(id) as UserFromDB | undefined;
};

// Graceful shutdown
process.on('exit', () => {
  if (dbInstance) { // Check if dbInstance was initialized
    console.log("Closing database connection on exit.");
    dbInstance.close();
  }
});
process.on('SIGHUP', () => process.exit(128 + 1));
process.on('SIGINT', () => {
  if (dbInstance) { // Check if dbInstance was initialized
    console.log("Closing database connection on SIGINT.");
    dbInstance.close();
  }
  process.exit(128 + 2);
});
process.on('SIGTERM', () => {
  if (dbInstance) { // Check if dbInstance was initialized
    console.log("Closing database connection on SIGTERM.");
    dbInstance.close();
  }
  process.exit(128 + 15);
});