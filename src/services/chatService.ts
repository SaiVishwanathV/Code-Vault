import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { ChatMessage, ChatRoom, Profile } from '../types';

const ROOMS_STORAGE_KEY = 'codevault_chat_rooms_v2';
const MESSAGES_STORAGE_KEY = 'codevault_chat_messages_v2';

function getStoredRooms(): ChatRoom[] {
  const raw = localStorage.getItem(ROOMS_STORAGE_KEY);
  if (!raw) {
    return [];
  }
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
  if (!raw) {
    return {};
  }
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
   * Fetch all open & user private rooms from database
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
            if (!r.is_private) return true;
            if (!currentUser) return false;
            if (r.created_by === currentUser.id) return true;
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
      if (r.invited_usernames?.includes(currentUser.username)) return true;
      return false;
    });
  },

  /**
   * Create a new room (open or private)
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
    const newRoom: ChatRoom = {
      id: `room-${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      is_private: isPrivate,
      max_members: maxMembers,
      created_by: currentUser.id,
      member_count: 1,
      created_at: new Date().toISOString(),
      invited_usernames: invitedUsernames,
      last_message: 'Room created. Start discussing algorithms and optimal approaches!',
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
          member_count: 1,
          category: newRoom.category,
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

  async createPrivateRoom(
    name: string,
    description: string,
    currentUser: Profile,
    maxMembers: number = 10,
    invitedUsernames: string[] = []
  ): Promise<ChatRoom> {
    return this.createRoom(name, description, currentUser, true, maxMembers, 'study_group', invitedUsernames);
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
    const rooms = getStoredRooms();
    const updated = rooms.filter((r) => r.id !== roomId || r.created_by !== userId);
    saveStoredRooms(updated);
  },
};
