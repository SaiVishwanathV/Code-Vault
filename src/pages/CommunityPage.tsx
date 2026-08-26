import React, { useState, useEffect } from 'react';
import { MessageSquare, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ChatMessage, ChatRoom, Problem } from '../types';
import { chatService } from '../services/chatService';
import { RoomList } from '../components/community/RoomList';
import { ChatWindow } from '../components/community/ChatWindow';
import { CreateRoomModal } from '../components/community/CreateRoomModal';
import { ShareProblemModal } from '../components/community/ShareProblemModal';
import { triggerConfetti } from '../lib/utils';

interface CommunityPageProps {
  problems: Problem[];
}

export const CommunityPage: React.FC<CommunityPageProps> = ({ problems }) => {
  const { profile } = useAuth();
  const { success, error: showError } = useToast();

  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [pendingInvitations, setPendingInvitations] = useState<ChatRoom[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Load rooms and pending invitations
  const fetchRoomsAndInvites = async () => {
    setLoading(true);
    try {
      const [fetchedRooms, fetchedInvites] = await Promise.all([
        chatService.getRooms(profile),
        profile ? chatService.getPendingInvitations(profile.username) : Promise.resolve([]),
      ]);

      setRooms(fetchedRooms);
      setPendingInvitations(fetchedInvites);

      if (fetchedRooms.length > 0) {
        if (!selectedRoomId || !fetchedRooms.some((r: ChatRoom) => r.id === selectedRoomId)) {
          setSelectedRoomId(fetchedRooms[0].id);
        }
      } else {
        setSelectedRoomId('');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoomsAndInvites();

    // Background sync for new rooms and invitations every 4 seconds
    const inviteInterval = setInterval(() => {
      if (profile) {
        Promise.all([
          chatService.getRooms(profile),
          chatService.getPendingInvitations(profile.username),
        ]).then(([r, inv]) => {
          setRooms(r);
          setPendingInvitations(inv);
        });
      }
    }, 4000);

    return () => clearInterval(inviteInterval);
  }, [profile]);

  // Load and sync real-time messages for selected room
  useEffect(() => {
    if (!selectedRoomId) {
      setMessages([]);
      return;
    }

    // 1. Fetch initial messages
    chatService.getMessages(selectedRoomId).then(setMessages);

    // 2. Real-time WebSocket listener
    const unsubscribe = chatService.subscribeToRoom(selectedRoomId, (incomingMsg) => {
      setMessages((prev) => {
        const index = prev.findIndex((m) => m.id === incomingMsg.id);
        if (index !== -1) {
          const updated = [...prev];
          updated[index] = incomingMsg;
          return updated;
        }
        return [...prev, incomingMsg];
      });
    });

    // 3. Fast 3-second background sync to guarantee delivery and pin sync across all devices/tabs
    const msgInterval = setInterval(async () => {
      const latest = await chatService.getMessages(selectedRoomId);
      if (latest && latest.length > 0) {
        setMessages(latest);
      }
    }, 3000);

    return () => {
      unsubscribe();
      clearInterval(msgInterval);
    };
  }, [selectedRoomId]);

  const selectedRoom = rooms.find((r) => r.id === selectedRoomId);

  const handleSendMessage = async (
    content: string,
    replyTo?: ChatMessage['reply_to'],
    sharedProblem?: ChatMessage['shared_problem']
  ) => {
    if (!profile || !selectedRoom) return;

    try {
      const newMsg = await chatService.sendMessage(
        selectedRoom.id,
        profile,
        content,
        replyTo,
        sharedProblem
      );
      setMessages((prev) => [...prev, newMsg]);
    } catch (err: any) {
      showError('Message Failed', err.message);
    }
  };

  const handleTogglePin = async (messageId: string) => {
    if (!selectedRoom) return;
    const isPinned = await chatService.togglePinMessage(selectedRoom.id, messageId);
    setMessages((prev) =>
      prev.map((m) => (m.id === messageId ? { ...m, is_pinned: isPinned } : m))
    );
    success(isPinned ? 'Message Pinned' : 'Message Unpinned');
  };

  const handleToggleReaction = async (messageId: string, emoji: string) => {
    if (!selectedRoom || !profile) return;
    const updatedReactions = await chatService.toggleReaction(
      selectedRoom.id,
      messageId,
      emoji,
      profile.id
    );
    setMessages((prev) =>
      prev.map((m) => (m.id === messageId ? { ...m, reactions: updatedReactions } : m))
    );
  };

  const handleCreateRoom = async (data: {
    name: string;
    description: string;
    isPrivate: boolean;
    category: string;
    maxMembers: number;
    invitedUsernames: string[];
  }) => {
    if (!profile) return;

    try {
      const newRoom = await chatService.createRoom(
        data.name,
        data.description,
        profile,
        data.isPrivate,
        data.maxMembers,
        data.category,
        data.invitedUsernames
      );
      setRooms((prev) => [newRoom, ...prev]);
      setSelectedRoomId(newRoom.id);
      setIsCreateModalOpen(false);

      if (newRoom.is_private) {
        success(
          'Private Study Room Created!',
          `Invitations sent to ${data.invitedUsernames.map((u) => '@' + u).join(', ')} directly in their Community section.`
        );
      } else {
        success('Open Room Launched!', `"${newRoom.name}" is now public for the community!`);
      }
    } catch (err: any) {
      showError('Failed to Create Room', err.message);
    }
  };

  const handleAcceptInvite = async (roomId: string) => {
    if (!profile) return;

    try {
      const joinedRoom = await chatService.acceptRoomInvite(roomId, profile);
      setRooms((prev) => {
        const exists = prev.some((r) => r.id === joinedRoom.id);
        return exists ? prev : [joinedRoom, ...prev];
      });
      setPendingInvitations((prev) => prev.filter((r) => r.id !== roomId));
      setSelectedRoomId(joinedRoom.id);
      triggerConfetti();
      success('Welcome to the Study Room!', `Joined "${joinedRoom.name}"`);
    } catch (err: any) {
      showError('Accept Failed', err.message);
    }
  };

  const handleDeclineInvite = async (roomId: string) => {
    if (!profile) return;

    try {
      await chatService.declineRoomInvite(roomId, profile);
      setPendingInvitations((prev) => prev.filter((r) => r.id !== roomId));
      success('Invitation Removed');
    } catch (err: any) {
      showError('Decline Failed', err.message);
    }
  };

  const handleShareProblem = async (problem: Problem, customMessage?: string) => {
    if (!selectedRoom || !profile) return;

    try {
      const content = customMessage
        ? `${customMessage}\n\nShared Problem: **${problem.problem_name}** (${problem.difficulty})`
        : `Check out this problem: **${problem.problem_name}** (${problem.difficulty} on ${problem.platform})`;

      const newMsg = await chatService.sendMessage(
        selectedRoom.id,
        profile,
        content,
        undefined,
        {
          problem_id: problem.problem_id,
          problem_name: problem.problem_name,
          platform: problem.platform,
          difficulty: problem.difficulty,
          link: problem.problem_link,
        }
      );
      setMessages((prev) => [...prev, newMsg]);
      setIsShareModalOpen(false);
      success('Problem Shared', `Shared to #${selectedRoom.name}`);
    } catch (err: any) {
      showError('Failed to Share', err.message);
    }
  };

  const handleLeaveRoom = async () => {
    if (!selectedRoom || !profile) return;
    try {
      await chatService.leaveRoom(selectedRoom.id, profile.id);
      setRooms((prev) => prev.filter((r) => r.id !== selectedRoom.id));
      setSelectedRoomId('');
      success('Room Left', `Left ${selectedRoom.name}`);
    } catch (err: any) {
      showError('Error', err.message);
    }
  };

  return (
    <div className="space-y-4 h-[calc(100vh-8rem)] min-h-[600px] flex flex-col">
      {/* Community Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#1A202C] dark:text-white tracking-tight">
            Community Study Rooms
          </h1>
          <p className="text-xs text-[#718096] dark:text-[#A0AEC0]">
            Collaborate in open public channels or join private study groups with invited peers.
          </p>
        </div>
      </div>

      {/* Main Split Interface */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 flex-1 min-h-0">
        {/* Left: Room Selector with Direct In-App Invitations */}
        <div className="md:col-span-4 lg:col-span-4 h-full">
          <RoomList
            rooms={rooms}
            pendingInvitations={pendingInvitations}
            selectedRoomId={selectedRoomId}
            onSelectRoom={setSelectedRoomId}
            onOpenCreateModal={() => setIsCreateModalOpen(true)}
            onAcceptInvite={handleAcceptInvite}
            onDeclineInvite={handleDeclineInvite}
          />
        </div>

        {/* Right: Active Chat Window */}
        <div className="md:col-span-8 lg:col-span-8 h-full">
          {selectedRoom && profile ? (
            <ChatWindow
              room={selectedRoom}
              messages={messages}
              currentUser={profile}
              onSendMessage={handleSendMessage}
              onTogglePin={handleTogglePin}
              onToggleReaction={handleToggleReaction}
              onOpenShareProblem={() => setIsShareModalOpen(true)}
              onLeaveRoom={selectedRoom.is_private ? handleLeaveRoom : undefined}
            />
          ) : (
            <div className="h-full rounded-[18px] border border-[#EFE6D5] dark:border-[#2C323F] bg-white dark:bg-[#1E222B] shadow-card flex flex-col items-center justify-center p-8 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-[#FFF9EE] dark:bg-[#2C210C] text-[#8C5D0B] dark:text-[#E9B949] flex items-center justify-center border border-[#F8E0B0] dark:border-[#5C4212] shadow-sm">
                <MessageSquare className="w-7 h-7" />
              </div>
              <div className="space-y-1 max-w-sm">
                <h3 className="font-bold text-sm text-[#1A202C] dark:text-white">
                  {rooms.length === 0 ? 'No Discussion Channels Yet' : 'Select a Study Channel'}
                </h3>
                <p className="text-xs text-[#718096] dark:text-[#A0AEC0] leading-relaxed">
                  {rooms.length === 0
                    ? 'Start an open channel for the community or invite peers to a private study group.'
                    : 'Choose a room from the left sidebar to start chatting.'}
                </p>
              </div>
              <div className="pt-2">
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#E9B949] hover:bg-[#D4A32D] text-[#1A202C] font-bold text-xs shadow-sm transition-all"
                >
                  <Plus className="w-4 h-4" /> Create First Room
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Room Modal (Open vs Private with Direct User Selector) */}
      <CreateRoomModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        currentUserId={profile?.id}
        onCreateRoom={handleCreateRoom}
      />

      {/* Share Problem Modal */}
      <ShareProblemModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        problems={problems}
        onShareProblem={handleShareProblem}
      />
    </div>
  );
};
