import React, { useState } from 'react';
import { Users, Lock, Globe, Plus, Search, Hash, Mail, ArrowRight, X, Sparkles } from 'lucide-react';
import { ChatRoom } from '../../types';

interface RoomListProps {
  rooms: ChatRoom[];
  pendingInvitations: ChatRoom[];
  selectedRoomId: string;
  onSelectRoom: (roomId: string) => void;
  onOpenCreateModal: () => void;
  onAcceptInvite: (roomId: string) => Promise<void>;
  onDeclineInvite: (roomId: string) => Promise<void>;
}

export const RoomList: React.FC<RoomListProps> = ({
  rooms,
  pendingInvitations,
  selectedRoomId,
  onSelectRoom,
  onOpenCreateModal,
  onAcceptInvite,
  onDeclineInvite,
}) => {
  const [activeTab, setActiveTab] = useState<'open' | 'private'>('open');
  const [searchQuery, setSearchQuery] = useState('');
  const [processingInviteId, setProcessingInviteId] = useState<string | null>(null);

  const filteredRooms = rooms
    .filter((r) => (activeTab === 'open' ? !r.is_private : r.is_private))
    .filter(
      (r) =>
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const handleAccept = async (e: React.MouseEvent, roomId: string) => {
    e.stopPropagation();
    setProcessingInviteId(roomId);
    try {
      await onAcceptInvite(roomId);
    } finally {
      setProcessingInviteId(null);
    }
  };

  const handleDecline = async (e: React.MouseEvent, roomId: string) => {
    e.stopPropagation();
    setProcessingInviteId(roomId);
    try {
      await onDeclineInvite(roomId);
    } finally {
      setProcessingInviteId(null);
    }
  };

  return (
    <div className="flex flex-col h-full rounded-[18px] border border-[#EFE6D5] dark:border-[#2C323F] bg-white dark:bg-[#1E222B] shadow-card overflow-hidden">
      {/* Header & Actions */}
      <div className="p-4 border-b border-[#EFE6D5] dark:border-[#2C323F] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[#B0831E] dark:text-[#E9B949]" />
            <h2 className="text-sm font-bold text-[#1A202C] dark:text-white">Community Chat</h2>
          </div>
          <button
            onClick={onOpenCreateModal}
            className="px-2.5 py-1.5 rounded-lg bg-[#E9B949] hover:bg-[#D4A32D] text-[#1A202C] font-bold text-xs shadow-sm transition-all flex items-center gap-1"
            title="Create Public or Private Room"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Room</span>
          </button>
        </div>

        {/* Tab switchers: Open Rooms vs Private Rooms */}
        <div className="flex p-0.5 rounded-xl border border-[#EFE6D5] dark:border-[#2C323F] bg-[#FFF9EE] dark:bg-[#16181D] text-xs font-semibold">
          <button
            onClick={() => setActiveTab('open')}
            className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'open'
                ? 'bg-white dark:bg-[#1E222B] text-[#1A202C] dark:text-[#E9B949] shadow-subtle font-bold'
                : 'text-[#718096] dark:text-[#A0AEC0] hover:text-[#1A202C]'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Open Rooms</span>
          </button>
          <button
            onClick={() => setActiveTab('private')}
            className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 relative ${
              activeTab === 'private'
                ? 'bg-white dark:bg-[#1E222B] text-[#1A202C] dark:text-[#E9B949] shadow-subtle font-bold'
                : 'text-[#718096] dark:text-[#A0AEC0] hover:text-[#1A202C]'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Private Rooms</span>
            {pendingInvitations.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-1.5 right-3 animate-pulse" />
            )}
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-[#A0AEC0]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search discussion rooms..."
            className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-[#EFE6D5] dark:border-[#2C323F] bg-[#FFFDF8] dark:bg-[#16181D] text-xs text-[#2D3748] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#E9B949]"
          />
        </div>
      </div>

      {/* Pending Invitations Banner (Appears if user has direct room invites) */}
      {pendingInvitations.length > 0 && (
        <div className="p-3 border-b border-[#F8E0B0] dark:border-[#5C4212] bg-[#FFF9EE] dark:bg-[#2C210C] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#8C5D0B] dark:text-[#E9B949] flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" /> Room Invitations ({pendingInvitations.length})
            </span>
          </div>

          <div className="space-y-1.5">
            {pendingInvitations.map((inv) => (
              <div
                key={inv.id}
                className="p-2.5 rounded-xl bg-white dark:bg-[#1E222B] border border-[#F8E0B0] dark:border-[#5C4212] shadow-subtle flex items-center justify-between gap-2"
              >
                <div className="truncate">
                  <div className="font-bold text-xs text-[#1A202C] dark:text-white truncate">
                    {inv.name}
                  </div>
                  <div className="text-[10px] text-[#718096] dark:text-[#A0AEC0] font-mono truncate">
                    Invited by @{inv.creator_username || 'peer'}
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={(e) => handleDecline(e, inv.id)}
                    disabled={processingInviteId === inv.id}
                    className="p-1 rounded-lg hover:bg-[#FFF9EE] dark:hover:bg-[#252B37] text-[#718096] hover:text-rose-500 transition-all"
                    title="Decline"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => handleAccept(e, inv.id)}
                    disabled={processingInviteId === inv.id}
                    className="px-2.5 py-1 rounded-lg bg-[#E9B949] hover:bg-[#D4A32D] text-[#1A202C] font-bold text-[11px] shadow-sm flex items-center gap-1 transition-all"
                  >
                    <span>{processingInviteId === inv.id ? 'Entering...' : 'Enter Room'}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Room list scroll */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
        {filteredRooms.length === 0 ? (
          <div className="py-12 text-center text-xs text-[#718096] dark:text-[#A0AEC0] space-y-3 px-4">
            <p>
              {activeTab === 'open'
                ? 'No public discussion channels created yet.'
                : 'No private rooms joined yet.'}
            </p>
            <button
              onClick={onOpenCreateModal}
              className="px-3.5 py-1.5 rounded-xl bg-[#E9B949] text-[#1A202C] font-bold text-xs shadow-sm"
            >
              {activeTab === 'open' ? 'Launch First Open Room' : 'Create Private Room'}
            </button>
          </div>
        ) : (
          filteredRooms.map((room) => {
            const isSelected = room.id === selectedRoomId;

            return (
              <button
                key={room.id}
                onClick={() => onSelectRoom(room.id)}
                className={`w-full text-left p-3 rounded-xl border transition-all ${
                  isSelected
                    ? 'border-[#E9B949] bg-[#FFF9EE] dark:bg-[#252B37] shadow-sm'
                    : 'border-transparent hover:bg-[#FFF9EE]/60 dark:hover:bg-[#1E222B]/60'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-[#1A202C] dark:text-white">
                    {room.is_private ? (
                      <Lock className="w-3.5 h-3.5 text-[#B0831E] dark:text-[#E9B949]" />
                    ) : (
                      <Hash className="w-3.5 h-3.5 text-[#718096]" />
                    )}
                    <span className="truncate">{room.name}</span>
                  </div>
                  <span className="text-[10px] text-[#A0AEC0]">{room.last_activity || 'Recent'}</span>
                </div>

                <p className="text-[11px] text-[#718096] dark:text-[#A0AEC0] line-clamp-1 leading-relaxed">
                  {room.description}
                </p>

                <div className="flex items-center justify-between mt-2 text-[10px]">
                  <span className="text-[#A0AEC0]">{room.member_count} members</span>
                  {room.is_private && (
                    <span className="text-[#8C5D0B] dark:text-[#E9B949] font-semibold flex items-center gap-1">
                      <Lock className="w-2.5 h-2.5" /> Private
                    </span>
                  )}
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};
