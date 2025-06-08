import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { createClient } from '@/utils/supabase/server';
import { generateConversationId, findUserById } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversation_id');

    if (!conversationId) {
      return NextResponse.json({ error: 'conversation_id is required' }, { status: 400 });
    }

    const supabase = await createClient();
    
    // First, get one message from the specified conversation to identify the participants
    const { data: sampleMessage, error: sampleError } = await supabase
      .from('messages')
      .select('sender_id, receiver_id')
      .eq('conversation_id', conversationId)
      .limit(1)
      .single();

    if (sampleError) {
      console.error('Error getting sample message:', sampleError);
      return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
    }

    // Check if the current user is either sender or receiver in this conversation
    if (sampleMessage.sender_id !== session.user.id && sampleMessage.receiver_id !== session.user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get all messages between these two participants (regardless of conversation_id)
    // This handles the case where there might be multiple conversation IDs for the same participant pair
    const { data: allMessages, error: messagesError } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${sampleMessage.sender_id},receiver_id.eq.${sampleMessage.receiver_id}),and(sender_id.eq.${sampleMessage.receiver_id},receiver_id.eq.${sampleMessage.sender_id})`)
      .order('created_at', { ascending: true });

    if (messagesError) {
      console.error('Error fetching all messages between participants:', messagesError);
      return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
    }

    console.log(`Found ${allMessages?.length || 0} total messages between participants`);

    // Get unique user IDs from messages
    const userIds = [...new Set([
      ...allMessages.map(msg => msg.sender_id),
      ...allMessages.map(msg => msg.receiver_id)
    ])];

    // Fetch user data for all participants
    const userPromises = userIds.map(id => findUserById(id));
    const users = await Promise.all(userPromises);
    const userMap = new Map();
    users.forEach((user, index) => {
      if (user) {
        userMap.set(userIds[index], {
          id: user.id,
          name: user.name || 'Unknown User',
          profile_image_url: user.profile_image_url
        });
      }
    });

    // Transform messages with actual user data
    const messagesWithUserData = (allMessages || []).map(message => ({
      ...message,
      sender: userMap.get(message.sender_id) || {
        id: message.sender_id,
        name: 'Unknown User',
        profile_image_url: null
      },
      receiver: userMap.get(message.receiver_id) || {
        id: message.receiver_id,
        name: 'Unknown User',
        profile_image_url: null
      },
      item: null
    }));

    return NextResponse.json(messagesWithUserData);
  } catch (error) {
    console.error('Error in messages GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('=== Messages POST API called ===');
    
    const session = await getServerSession(authOptions);
    console.log('Session check:', { 
      hasSession: !!session, 
      hasUser: !!session?.user, 
      userId: session?.user?.id 
    });

    if (!session?.user?.id) {
      console.log('No session, returning 401');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    console.log('Request body:', body);
    
    const { receiver_id, content, item_id } = body;

    if (!receiver_id || !content?.trim()) {
      console.log('Missing required fields:', { receiver_id, content: !!content });
      return NextResponse.json(
        { error: 'receiver_id and content are required' },
        { status: 400 }
      );
    }

    if (session.user.id === receiver_id) {
      console.log('User trying to message themselves');
      return NextResponse.json(
        { error: 'Cannot send message to yourself' },
        { status: 400 }
      );
    }

    console.log('Creating Supabase client...');
    const supabase = await createClient();
    
    // Generate conversation ID
    console.log('Generating conversation ID...');
    const conversation_id = generateConversationId(session.user.id, receiver_id, item_id);
    console.log('Generated conversation_id:', conversation_id);

    const messageData = {
      sender_id: session.user.id,
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
      console.error('Supabase error details:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      return NextResponse.json({ error: 'Failed to send message', details: error }, { status: 500 });
    }

    console.log('Message inserted successfully:', data);

    // Fetch user data for response
    const [senderUser, receiverUser] = await Promise.all([
      findUserById(data.sender_id),
      findUserById(data.receiver_id)
    ]);

    // Transform response with actual user data
    const messageWithUserData = {
      ...data,
      sender: {
        id: data.sender_id,
        name: senderUser?.name || 'Unknown User',
        profile_image_url: senderUser?.profile_image_url || null
      },
      receiver: {
        id: data.receiver_id,
        name: receiverUser?.name || 'Unknown User',
        profile_image_url: receiverUser?.profile_image_url || null
      },
      item: null
    };

    console.log('Returning transformed message');
    return NextResponse.json(messageWithUserData);
  } catch (error) {
    console.error('Unexpected error in messages POST:', error);
    return NextResponse.json({ error: 'Internal server error', details: error }, { status: 500 });
  }
} 