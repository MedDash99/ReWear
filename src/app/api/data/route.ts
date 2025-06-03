import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: Request) {
  try {
    console.log('Fetching users from Supabase...');
    
    const supabase = await createClient();

    // Use Supabase to query users
    const { data: users, error } = await supabase
      .from('users')
      .select('*');

    if (error) {
      console.error("Supabase Error:", error);
      return NextResponse.json({ message: 'Failed to fetch data' }, { status: 500 });
    }

    return NextResponse.json({ users });

  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ message: 'Failed to fetch data' }, { status: 500 });
  }
}

// You would do the same in POST, PUT, DELETE handlers if they need the DB