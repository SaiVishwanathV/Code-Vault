import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { ChatMessage, ChatRoom, Profile } from '../types';

const ROOMS_STORAGE_KEY = 'codevault_chat_rooms_v5';
const MESSAGES_STORAGE_KEY = 'codevault_chat_messages_v5';

function getStoredRooms(): ChatRoom[] {
  const raw = localStorage.getItem(ROOMS_STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveStoredRooms(rooms: ChatRoom[]) {
  localStorage.setItem(ROOMS_STORAGE_KEY, JSON.stringify(rooms));
}

function getStoredMessages(): Record<string, ChatMessage[]> {
  const raw = localStorage.getItem(MESSAGES_STORAGE_KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function saveStoredMessages(messagesMap: Record<string, ChatMessage[]>) {
  localStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(messagesMap));
}

export const chatService = {
  /**
   * Fetch all registered users for autocomplete in invitations
   */
  async getAvailableUsers(excludeUserId?: string): Promise<{ id: string; username: string; full_name: string; avatar_url?: string }[]> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, username, full_name, avatar_url')
          .eq('status', 'active');

        if (!error && data) {
          return data.filter((u) => u.id !== excludeUserId);
        }
      } catch (err) {
        console.error('Error fetching available users:', err);
      }
    }
    return [];
  },

  /**
   * Fetch pending room invitations specifically addressed to the current user
   */
  async getPendingInvitations(currentUser?: Profile | null): Promise<ChatRoom[]> {
    if (!currentUser || !currentUser.username) return [];

    const myUsername = currentUser.username.toLowerCase().trim().replace(/^@/, '');

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data: dbRooms, error } = await supabase
          .from('chat_rooms')
          .select('*')
          .eq('is_private', true);

        if (!error && dbRooms) {
          return dbRooms.filter((r) => {
            const rawInvites = Array.isArray(r.invited_usernames) ? r.invited_usernames : [];
            const cleanInvites = rawInvites.map((u: string) => String(u).toLowerCase().trim().replace(/^@/, ''));
            const isInvited = cleanInvites.includes(myUsername);

            const joined = Array.isArray(r.joined_user_ids) ? r.joined_user_ids : [];
            const alreadyJoined = joined.includes(currentUser.id);
            const isCreator = r.created_by === currentUser.id;

            return isInvited && !alreadyJoined && !isCreator;
          }) as ChatRoom[];
        }
      } catch (err) {
        console.error('Error fetching pending invitations from Supabase:', err);
      }
    }

    const rooms = getStoredRooms();
    return rooms.filter((r) => {
      const rawInvites = Array.isArray(r.invited_usernames) ? r.invited_usernames : [];
      const cleanInvites = rawInvites.map((u: string) => String(u).toLowerCase().trim().replace(/^@/, ''));
      const isInvited = r.is_private && cleanInvites.includes(myUsername);
      const alreadyJoined = r.joined_user_ids?.includes(currentUser.id);
      const isCreator = r.created_by === currentUser.id;
      return isInvited && !alreadyJoined && !isCreator;
    });
  },

  /**
   * Accept an in-app room invitation and enter the room
   */
  async acceptRoomInvite(roomId: string, currentUser: Profile): Promise<ChatRoom> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('chat_rooms')
          .select('*')
          .eq('id', roomId)
          .single();

        if (error || !data) throw new Error('Room not found in database');

        const currentJoined = Array.isArray(data.joined_user_ids) ? data.joined_user_ids : [];
        if (!currentJoined.includes(currentUser.id)) {
          const updatedJoined = [...currentJoined, currentUser.id];
          const newMemberCount = (data.member_count || 1) + 1;

          await supabase
            .from('chat_rooms')
            .update({
              joined_user_ids: updatedJoined,
              member_count: newMemberCount,
            })
            .eq('id', roomId);

          data.joined_user_ids = updatedJoined;
          data.member_count = newMemberCount;
        }

        return data as ChatRoom;
      } catch (err: any) {
        console.error('Supabase accept error:', err);
        throw new Error(err.message || 'Failed to accept room invitation');
      }
    }

    const rooms = getStoredRooms();
    const room = rooms.find((r) => r.id === roomId);
    if (!room) throw new Error('Room not found');

    if (!room.joined_user_ids?.includes(currentUser.id)) {
      room.joined_user_ids = [...(room.joined_user_ids || []), currentUser.id];
      room.member_count = (room.member_count || 1) + 1;
      saveStoredRooms(rooms);
    }

    return room;
  },

  /**
   * Decline an in-app room invitation
   */
  async declineRoomInvite(roomId: string, currentUser: Profile): Promise<void> {
    const myUsername = currentUser.username.toLowerCase().trim().replace(/^@/, '');

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data } = await supabase.from('chat_rooms').select('invited_usernames').eq('id', roomId).single();
        if (data && Array.isArray(data.invited_usernames)) {
          const filtered = data.invited_usernames.filter(
            (u: string) => String(u).toLowerCase().trim().replace(/^@/, '') !== myUsername
          );
          await supabase.from('chat_rooms').update({ invited_usernames: filtered }).eq('id', roomId);
        }
      } catch (err) {
        console.error('Failed to decline invitation on Supabase:', err);
      }
    }

    const rooms = getStoredRooms();
    const target = rooms.find((r) => r.id === roomId);
    if (target && Array.isArray(target.invited_usernames)) {
      target.invited_usernames = target.invited_usernames.filter(
        (u) => String(u).toLowerCase().trim().replace(/^@/, '') !== myUsername
      );
      saveStoredRooms(rooms);
    }
  },

  /**
   * Fetch all open & user accessible private rooms from database
   */
  async getRooms(currentUser?: Profile | null): Promise<ChatRoom[]> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data: dbRooms, error } = await supabase
          .from('chat_rooms')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && dbRooms) {
          return dbRooms.filter((r) => {
            if (!r.is_private) return true; // Open to all
            if (!currentUser) return false;
            if (r.created_by === currentUser.id) return true;
            const joined = Array.isArray(r.joined_user_ids) ? r.joined_user_ids : [];
            if (joined.includes(currentUser.id)) return true;
            return false;
          }) as ChatRoom[];
        }
      } catch (err) {
        console.error('Error fetching chat rooms from Supabase:', err);
      }
    }

    const rooms = getStoredRooms();
    if (!currentUser) return rooms.filter((r) => !r.is_private);

    return rooms.filter((r) => {
      if (!r.is_private) return true;
      if (r.created_by === currentUser.id) return true;
      if (r.joined_user_ids?.includes(currentUser.id)) return true;
      return false;
    });
  },

  /**
   * Create a new room (Open public room or Private room with direct invited users)
   */
  async createRoom(
    name: string,
    description: string,
    currentUser: Profile,
    isPrivate: boolean = false,
    maxMembers: number = 25,
    category: string = 'general',
    invitedUsernames: string[] = []
  ): Promise<ChatRoom> {
    const cleanInvited = invitedUsernames.map((u) => u.trim().replace(/^@/, ''));

    const newRoom: ChatRoom = {
      id: `room-${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      is_private: isPrivate,
      max_members: maxMembers,
      created_by: currentUser.id,
      creator_username: currentUser.username,
      creator_name: currentUser.full_name,
      member_count: 1,
      created_at: new Date().toISOString(),
      invited_usernames: cleanInvited,
      joined_user_ids: [currentUser.id],
      last_message: isPrivate
        ? `Private room created. Invitations sent to: ${cleanInvited.map((u) => '@' + u).join(', ')}`
        : 'Open channel created. Welcome to the discussion!',
      last_activity: 'Just now',
      category: (category as any) || 'general',
    };

    if (isSupabaseConfigured() && supabase) {
      try {
        const { error: insertError } = await supabase.from('chat_rooms').insert({
          id: newRoom.id,
          name: newRoom.name,
          description: newRoom.description,
          is_private: isPrivate,
          max_members: maxMembers,
          created_by: currentUser.id,
          creator_username: currentUser.username,
          creator_name: currentUser.full_name,
          member_count: 1,
          category: newRoom.category,
          invited_usernames: newRoom.invited_usernames,
          joined_user_ids: [currentUser.id],
        });

        if (insertError) {
          console.error('Error inserting room to Supabase:', insertError);
        }
      } catch (err) {
        console.error('Failed to create room in Supabase:', err);
      }
    }

    const rooms = getStoredRooms();
    const updated = [newRoom, ...rooms];
    saveStoredRooms(updated);
    return newRoom;
  },

  /**
   * Get messages for a given room
   */
  async getMessages(roomId: string): Promise<ChatMessage[]> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data: dbMessages, error } = await supabase
          .from('chat_messages')
          .select(`
            id,
            room_id,
            user_id,
            content,
            is_pinned,
            reply_to,
            shared_problem,
            reactions,
            created_at,
            profiles (
              username,
              full_name,
              avatar_url
            )
          `)
          .eq('room_id', roomId)
          .order('created_at', { ascending: true });

        if (!error && dbMessages) {
          return dbMessages.map((msg: any) => ({
            id: msg.id,
            room_id: msg.room_id,
            user_id: msg.user_id,
            username: msg.profiles?.username || 'coder',
            full_name: msg.profiles?.full_name || 'Coder',
            avatar_url: msg.profiles?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${msg.user_id}`,
            content: msg.content,
            created_at: msg.created_at,
            is_pinned: msg.is_pinned || false,
            reply_to: msg.reply_to,
            shared_problem: msg.shared_problem,
            reactions: msg.reactions || {},
          }));
        }
      } catch (err) {
        console.error('Error fetching messages from Supabase:', err);
      }
    }

    const messages = getStoredMessages();
    return messages[roomId] || [];
  },

  /**
   * Subscribe to real-time chat messages for a specific room
   */
  subscribeToRoom(roomId: string, onNewMessage: (msg: ChatMessage) => void): () => void {
    if (isSupabaseConfigured() && supabase) {
      const client = supabase;
      try {
        const channelName = `chat_channel_${roomId.replace(/[^a-zA-Z0-9_]/g, '_')}`;
        const channel = client
          .channel(channelName)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'chat_messages',
              filter: `room_id=eq.${roomId}`,
            },
            async (payload: any) => {
              const newRow = payload.new;
              if (!newRow) return;

              // Fetch sender profile details
              let senderProfile: any = null;
              try {
                const { data } = await client
                  .from('profiles')
                  .select('username, full_name, avatar_url')
                  .eq('id', newRow.user_id)
                  .single();
                senderProfile = data;
              } catch {
                // ignore
              }

              const formatted: ChatMessage = {
                id: newRow.id,
                room_id: newRow.room_id,
                user_id: newRow.user_id,
                username: senderProfile?.username || 'coder',
                full_name: senderProfile?.full_name || 'Coder',
                avatar_url: senderProfile?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${newRow.user_id}`,
                content: newRow.content,
                created_at: newRow.created_at,
                is_pinned: newRow.is_pinned || false,
                reply_to: newRow.reply_to,
                shared_problem: newRow.shared_problem,
                reactions: newRow.reactions || {},
              };

              onNewMessage(formatted);
            }
          )
          .subscribe();

        return () => {
          client.removeChannel(channel);
        };
      } catch (err) {
        console.error('Error setting up Supabase realtime channel:', err);
      }
    }
    return () => {};
  },

  /**
   * Send a chat message
   */
  async sendMessage(
    roomId: string,
    currentUser: Profile,
    content: string,
    replyTo?: ChatMessage['reply_to'],
    sharedProblem?: ChatMessage['shared_problem']
  ): Promise<ChatMessage> {
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      room_id: roomId,
      user_id: currentUser.id,
      username: currentUser.username,
      full_name: currentUser.full_name,
      avatar_url: currentUser.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser.username}`,
      content: content.trim(),
      created_at: new Date().toISOString(),
      reply_to: replyTo,
      shared_problem: sharedProblem,
      reactions: {},
    };

    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('chat_messages').insert({
          id: newMsg.id,
          room_id: roomId,
          user_id: currentUser.id,
          content: newMsg.content,
          reply_to: newMsg.reply_to,
          shared_problem: newMsg.shared_problem,
          reactions: {},
        });
      } catch (err) {
        console.error('Error posting message to Supabase:', err);
      }
    }

    const messages = getStoredMessages();
    const roomMsgs = messages[roomId] || [];
    messages[roomId] = [...roomMsgs, newMsg];
    saveStoredMessages(messages);

    return newMsg;
  },

  /**
   * Toggle pinned message
   */
  async togglePinMessage(roomId: string, messageId: string): Promise<boolean> {
    const messages = getStoredMessages();
    const roomMsgs = messages[roomId] || [];
    let isPinned = false;

    messages[roomId] = roomMsgs.map((m) => {
      if (m.id === messageId) {
        isPinned = !m.is_pinned;
        return { ...m, is_pinned: isPinned };
      }
      return m;
    });

    saveStoredMessages(messages);

    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('chat_messages').update({ is_pinned: isPinned }).eq('id', messageId);
      } catch (err) {
        console.error('Error updating pin on Supabase:', err);
      }
    }

    return isPinned;
  },

  /**
   * Toggle reaction emoji on message
   */
  async toggleReaction(
    roomId: string,
    messageId: string,
    emoji: string,
    userId: string
  ): Promise<Record<string, string[]>> {
    const messages = getStoredMessages();
    const roomMsgs = messages[roomId] || [];
    let updatedReactions: Record<string, string[]> = {};

    messages[roomId] = roomMsgs.map((m) => {
      if (m.id === messageId) {
        const reactions = { ...(m.reactions || {}) };
        const currentUsers = reactions[emoji] || [];

        if (currentUsers.includes(userId)) {
          reactions[emoji] = currentUsers.filter((id) => id !== userId);
          if (reactions[emoji].length === 0) delete reactions[emoji];
        } else {
          reactions[emoji] = [...currentUsers, userId];
        }
        updatedReactions = reactions;
        return { ...m, reactions };
      }
      return m;
    });

    saveStoredMessages(messages);

    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('chat_messages').update({ reactions: updatedReactions }).eq('id', messageId);
      } catch (err) {
        console.error('Error updating reaction on Supabase:', err);
      }
    }

    return updatedReactions;
  },

  /**
   * Leave a study room
   */
  async leaveRoom(roomId: string, userId: string): Promise<void> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data } = await supabase.from('chat_rooms').select('joined_user_ids, member_count').eq('id', roomId).single();
        if (data && Array.isArray(data.joined_user_ids)) {
          const updatedJoined = data.joined_user_ids.filter((id: string) => id !== userId);
          const newCount = Math.max(1, (data.member_count || 2) - 1);
          await supabase.from('chat_rooms').update({ joined_user_ids: updatedJoined, member_count: newCount }).eq('id', roomId);
        }
      } catch (err) {
        console.error('Error leaving room on Supabase:', err);
      }
    }

    const rooms = getStoredRooms();
    const updated = rooms.filter((r) => r.id !== roomId || r.created_by !== userId);
    saveStoredRooms(updated);
  },
};
