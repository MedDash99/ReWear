import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { createClient } from '@/utils/supabase/server';
import { findUserById } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();
    
    // Get all messages where user is participant, ordered by created_at
    const { data: allMessages, error: messagesError } = await supabase
      .from('messages')
      .select('*')
      .or(`sender_id.eq.${session.user.id},receiver_id.eq.${session.user.id}`)
      .order('created_at', { ascending: false });

    if (messagesError) {
      console.error('Error fetching messages:', messagesError);
      return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 });
    }

    if (!allMessages || allMessages.length === 0) {
      return NextResponse.json([]);
    }

    // Group messages by participant pair (not by conversation_id to handle legacy data)
    const participantPairsMap = new Map();
    
    for (const message of allMessages) {
      // Create a consistent key for the participant pair
      const participants = [message.sender_id, message.receiver_id].sort();
      const participantKey = `${participants[0]}|${participants[1]}`;
      
      if (!participantPairsMap.has(participantKey)) {
        participantPairsMap.set(participantKey, {
          participants: participants,
          latestMessage: message,
          messages: [message],
          conversationIds: new Set([message.conversation_id])
        });
      } else {
        const existing = participantPairsMap.get(participantKey);
        existing.messages.push(message);
        existing.conversationIds.add(message.conversation_id);
        
        // Keep the latest message
        if (new Date(message.created_at) > new Date(existing.latestMessage.created_at)) {
          existing.latestMessage = message;
        }
      }
    }

    // Process each unique participant pair
    const conversations = [];
    
    for (const [participantKey, { participants, latestMessage, messages, conversationIds }] of participantPairsMap.entries()) {
      // Get unread count for this user across all conversation IDs for this participant pair
      const unreadCount = messages.filter(msg => 
        msg.receiver_id === session.user.id && !msg.read
      ).length;

      // Fetch user data for participants
      const userPromises = participants.map(id => findUserById(id));
      const users = await Promise.all(userPromises);
      const userMap = new Map();
      users.forEach((user, index) => {
        if (user) {
          userMap.set(participants[index], {
            id: user.id,
            name: user.name || 'Unknown User',
            profile_image_url: user.profile_image_url
          });
        }
      });

      // Create participants array with actual user data
      const participantObjects = participants.map(id => 
        userMap.get(id) || {
          id,
          name: 'Unknown User',
          profile_image_url: null
        }
      );

      // Transform the latest message with user data
      const transformedLatestMessage = {
        ...latestMessage,
        sender: userMap.get(latestMessage.sender_id) || {
          id: latestMessage.sender_id,
          name: 'Unknown User',
          profile_image_url: null
        },
        receiver: userMap.get(latestMessage.receiver_id) || {
          id: latestMessage.receiver_id,
          name: 'Unknown User',
          profile_image_url: null
        },
        item: null
      };

      // Use the latest message's conversation_id as the primary ID
      // This ensures we can still open the conversation properly
      conversations.push({
        id: latestMessage.conversation_id,
        participants: participantObjects,
        last_message: transformedLatestMessage,
        unread_count: unreadCount,
        item: undefined,
        updated_at: latestMessage.created_at
      });
      
      // Debug logging
      console.log(`Conversation for ${participantKey}: ${Array.from(conversationIds).join(', ')} (${messages.length} messages)`);
    }

    // Sort by last message timestamp (most recent first)
    const sortedConversations = conversations.sort((a, b) => 
      new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );

    console.log(`Returning ${sortedConversations.length} unique conversations for user ${session.user.id}`);
    
    return NextResponse.json(sortedConversations);
  } catch (error) {
    console.error('Error in conversations GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 