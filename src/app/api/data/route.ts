import { NextResponse } from 'next/server';
import { getDB } from '@/lib/db'; // Adjust import path based on your structure

export async function GET(request: Request) {
  try {
    // Ensure DB is initialized before using it
    const db = await getDB();
    console.log('Database ready for API route.');

    // Now you can use the db instance to query
    const users = await db.prepare('SELECT * FROM users').all();

    return NextResponse.json({ users });

  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ message: 'Failed to fetch data' }, { status: 500 });
  }
}

// You would do the same in POST, PUT, DELETE handlers if they need the DB