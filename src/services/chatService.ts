import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { ChatMessage, ChatRoom, Problem, Profile } from '../types';

const LOCAL_STORAGE_ROOMS_KEY = 'codevault_chat_rooms_v1';
const LOCAL_STORAGE_MESSAGES_KEY = 'codevault_chat_messages_v1';

const DEFAULT_ROOMS: ChatRoom[] = [
  {
    id: 'general-dsa',
    name: 'General DSA Discussion',
    description: 'Discuss algorithms, problem strategies, and ask daily doubt queries.',
    is_private: false,
    max_members: 50,
    created_by: 'system',
    creator_username: 'codevault_bot',
    creator_name: 'CodeVault Bot',
    member_count: 24,
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
    last_message: 'Remember to always check array constraints before writing binary search!',
    last_activity: '10m ago',
    category: 'general',
  },
  {
    id: 'faang-interview-prep',
    name: 'FAANG & Top Tech Interviews',
    description: 'Curated discussions for Google, Meta, Amazon, Microsoft coding rounds.',
    is_private: false,
    max_members: 50,
    created_by: 'system',
    creator_username: 'codevault_bot',
    creator_name: 'CodeVault Bot',
    member_count: 18,
    created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
    last_message: 'Dynamic Programming state transitions are key for Google interviews.',
    last_activity: '1h ago',
    category: 'interview',
  },
  {
    id: 'graph-dp-algorithms',
    name: 'Dynamic Programming & Graphs',
    description: 'Deep dive into hard graph traversals, Dijkstra, trees, and multi-state DP.',
    is_private: false,
    max_members: 50,
    created_by: 'system',
    creator_username: 'codevault_bot',
    creator_name: 'CodeVault Bot',
    member_count: 12,
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
    last_message: 'Check out Dijkstra with priority queue template in the Vault.',
    last_activity: '3h ago',
    category: 'topic',
  },
];

function getStoredRooms(): ChatRoom[] {
  const data = localStorage.getItem(LOCAL_STORAGE_ROOMS_KEY);
  if (!data) {
    localStorage.setItem(LOCAL_STORAGE_ROOMS_KEY, JSON.stringify(DEFAULT_ROOMS));
    return DEFAULT_ROOMS;
  }
  try {
    return JSON.parse(data);
  } catch {
    return DEFAULT_ROOMS;
  }
}

function saveStoredRooms(rooms: ChatRoom[]) {
  localStorage.setItem(LOCAL_STORAGE_ROOMS_KEY, JSON.stringify(rooms));
}

function getStoredMessages(): Record<string, ChatMessage[]> {
  const data = localStorage.getItem(LOCAL_STORAGE_MESSAGES_KEY);
  if (!data) {
    const seed: Record<string, ChatMessage[]> = {
      'general-dsa': [
        {
          id: 'msg-seed-1',
          room_id: 'general-dsa',
          user_id: 'system-1',
          username: 'alex_codes',
          full_name: 'Alex Chen',
          avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop',
          content: 'Hey everyone! Working on LeetCode 42 (Trapping Rain Water) today. Two-pointer method is super clean.',
          created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
          is_pinned: true,
          reactions: { '🔥': ['user-1', 'user-2'], '👏': ['user-3'] },
        },
        {
          id: 'msg-seed-2',
          room_id: 'general-dsa',
          user_id: 'system-2',
          username: 'sarah_k',
          full_name: 'Sarah Kim',
          avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop',
          content: 'Monotonic stack approach also solves it in O(N) time and helps understand histogram problems!',
          created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
          is_pinned: false,
          reactions: { '💡': ['user-1'] },
        },
      ],
      'faang-interview-prep': [
        {
          id: 'msg-seed-3',
          room_id: 'faang-interview-prep',
          user_id: 'system-3',
          username: 'rahul_dev',
          full_name: 'Rahul Verma',
          avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
          content: 'Pinned: Amazon SDE-2 recurring questions include LRU Cache and Course Schedule (Topological Sort).',
          created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
          is_pinned: true,
          reactions: { '🚀': ['user-1', 'user-2', 'user-3'] },
        },
      ],
      'graph-dp-algorithms': [],
    };
    localStorage.setItem(LOCAL_STORAGE_MESSAGES_KEY, JSON.stringify(seed));
    return seed;
  }
  try {
    return JSON.parse(data);
  } catch {
    return {};
  }
}

function saveStoredMessages(messages: Record<string, ChatMessage[]>) {
  localStorage.setItem(LOCAL_STORAGE_MESSAGES_KEY, JSON.stringify(messages));
}

export const chatService = {
  /**
   * Fetch all accessible rooms
   */
  async getRooms(currentUser?: Profile | null): Promise<ChatRoom[]> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('chat_rooms')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          const remoteRooms = data as ChatRoom[];
          if (!currentUser) return remoteRooms.filter((r) => !r.is_private);

          return remoteRooms.filter((r) => {
            if (!r.is_private) return true;
            if (r.created_by === currentUser.id) return true;
            if (r.joined_user_ids?.includes(currentUser.id)) return true;
            if (r.invited_usernames?.includes(currentUser.username)) return true;
            return false;
          });
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
   * Create a new room
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
        await supabase.from('chat_rooms').insert({
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
   * Get messages for a given room from Supabase
   */
  async getMessages(roomId: string): Promise<ChatMessage[]> {
    if (isSupabaseConfigured() && supabase) {
      try {
        let pinnedMsgId: string | null = null;
        try {
          const { data: roomData } = await supabase
            .from('chat_rooms')
            .select('pinned_message_id')
            .eq('id', roomId)
            .maybeSingle();
          if (roomData?.pinned_message_id) {
            pinnedMsgId = roomData.pinned_message_id;
          }
        } catch {
          // ignore
        }

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
          const mapped: ChatMessage[] = dbMessages.map((msg: any) => ({
            id: msg.id,
            room_id: msg.room_id,
            user_id: msg.user_id,
            username: msg.profiles?.username || 'coder',
            full_name: msg.profiles?.full_name || 'Coder',
            avatar_url: msg.profiles?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${msg.user_id}`,
            content: msg.content,
            created_at: msg.created_at,
            is_pinned: Boolean(msg.is_pinned === true || (pinnedMsgId && msg.id === pinnedMsgId)),
            reply_to: msg.reply_to,
            shared_problem: msg.shared_problem,
            reactions: msg.reactions || {},
          }));

          const cached = getStoredMessages();
          cached[roomId] = mapped;
          saveStoredMessages(cached);

          return mapped;
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
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      room_id: roomId,
      user_id: currentUser.id,
      username: currentUser.username,
      full_name: currentUser.full_name,
      avatar_url: currentUser.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser.id}`,
      content: content.trim(),
      created_at: new Date().toISOString(),
      is_pinned: false,
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
          is_pinned: false,
          reply_to: replyTo,
          shared_problem: sharedProblem,
          reactions: {},
        });
      } catch (err) {
        console.error('Error sending message to Supabase:', err);
      }
    }

    const messages = getStoredMessages();
    messages[roomId] = [...(messages[roomId] || []), newMsg];
    saveStoredMessages(messages);

    return newMsg;
  },

  /**
   * Toggle pinned message in Supabase
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
        // 1. Try RPC first
        const { data: rpcResult, error: rpcErr } = await supabase.rpc('toggle_pin_chat_message', {
          p_room_id: roomId,
          p_message_id: messageId,
        });

        if (!rpcErr && rpcResult !== null) {
          isPinned = rpcResult;
        } else {
          // 2. Direct chat_messages update fallback
          await supabase
            .from('chat_messages')
            .update({ is_pinned: isPinned })
            .eq('id', messageId);

          // 3. Update chat_rooms table pinned_message_id for redundancy
          await supabase
            .from('chat_rooms')
            .update({ pinned_message_id: isPinned ? messageId : null })
            .eq('id', roomId);
        }
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
   * Leave a private room
   */
  async leaveRoom(roomId: string, userId: string): Promise<void> {
    const rooms = getStoredRooms();
    const room = rooms.find((r) => r.id === roomId);
    if (!room) return;

    room.joined_user_ids = room.joined_user_ids?.filter((id) => id !== userId) || [];
    room.member_count = Math.max(1, (room.member_count || 1) - 1);
    saveStoredRooms(rooms);

    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase
          .from('chat_rooms')
          .update({
            joined_user_ids: room.joined_user_ids,
            member_count: room.member_count,
          })
          .eq('id', roomId);
      } catch (err) {
        console.error('Error leaving room on Supabase:', err);
      }
    }
  },

  /**
   * Get available users for room invitations
   */
  async getAvailableUsers(currentUserId?: string): Promise<Profile[]> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name, username, avatar_url, role, status')
          .limit(100);

        if (!error && data) {
          const profiles = data as Profile[];
          return currentUserId ? profiles.filter((p) => p.id !== currentUserId) : profiles;
        }
      } catch (err) {
        console.error('Error fetching profiles in chatService:', err);
      }
    }
    return [];
  },

  /**
   * Get pending room invitations for user
   */
  async getPendingInvitations(usernameOrProfile: string | Profile): Promise<ChatRoom[]> {
    const rawUsername = typeof usernameOrProfile === 'string' ? usernameOrProfile : usernameOrProfile.username;
    const cleanUsername = rawUsername.replace(/^@/, '').toLowerCase();
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('chat_rooms')
          .select('*')
          .eq('is_private', true);

        if (!error && data) {
          return (data as ChatRoom[]).filter((r) =>
            r.invited_usernames?.some((u) => u.toLowerCase() === cleanUsername)
          );
        }
      } catch (err) {
        console.error('Error fetching pending invitations:', err);
      }
    }

    const rooms = getStoredRooms();
    return rooms.filter(
      (r) =>
        r.is_private &&
        r.invited_usernames?.some((u) => u.toLowerCase() === cleanUsername)
    );
  },

  /**
   * Accept private room invitation
   */
  async acceptRoomInvite(roomId: string, user: Profile): Promise<ChatRoom> {
    const cleanUsername = user.username.replace(/^@/, '').toLowerCase();
    const rooms = getStoredRooms();
    let room = rooms.find((r) => r.id === roomId);

    if (room) {
      room.joined_user_ids = [...(room.joined_user_ids || []), user.id];
      room.invited_usernames = room.invited_usernames?.filter(
        (u) => u.toLowerCase() !== cleanUsername
      );
      room.member_count = (room.member_count || 1) + 1;
      saveStoredRooms(rooms);
    }

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data: currentRoom } = await supabase
          .from('chat_rooms')
          .select('*')
          .eq('id', roomId)
          .single();

        if (currentRoom) {
          const updatedJoined = Array.from(
            new Set([...(currentRoom.joined_user_ids || []), user.id])
          );
          const updatedInvited = (currentRoom.invited_usernames || []).filter(
            (u: string) => u.toLowerCase() !== cleanUsername
          );

          const { data: updatedData } = await supabase
            .from('chat_rooms')
            .update({
              joined_user_ids: updatedJoined,
              invited_usernames: updatedInvited,
              member_count: updatedJoined.length,
            })
            .eq('id', roomId)
            .select()
            .single();

          if (updatedData) {
            return updatedData as ChatRoom;
          }
        }
      } catch (err) {
        console.error('Error accepting room invite:', err);
      }
    }

    return room || {
      id: roomId,
      name: 'Private Room',
      description: '',
      is_private: true,
      max_members: 25,
      created_by: user.id,
      creator_username: user.username,
      creator_name: user.full_name,
      member_count: 1,
      created_at: new Date().toISOString(),
      category: 'general',
    };
  },

  /**
   * Decline private room invitation
   */
  async declineRoomInvite(roomId: string, usernameOrProfile: string | Profile): Promise<void> {
    const rawUsername = typeof usernameOrProfile === 'string' ? usernameOrProfile : usernameOrProfile.username;
    const cleanUsername = rawUsername.replace(/^@/, '').toLowerCase();
    const rooms = getStoredRooms();
    const room = rooms.find((r) => r.id === roomId);

    if (room) {
      room.invited_usernames = room.invited_usernames?.filter(
        (u) => u.toLowerCase() !== cleanUsername
      );
      saveStoredRooms(rooms);
    }

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data: currentRoom } = await supabase
          .from('chat_rooms')
          .select('invited_usernames')
          .eq('id', roomId)
          .single();

        if (currentRoom) {
          const updatedInvited = (currentRoom.invited_usernames || []).filter(
            (u: string) => u.toLowerCase() !== cleanUsername
          );

          await supabase
            .from('chat_rooms')
            .update({ invited_usernames: updatedInvited })
            .eq('id', roomId);
        }
      } catch (err) {
        console.error('Error declining room invite:', err);
      }
    }
  },
};
