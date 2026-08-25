import React, { useState } from 'react';
import { Users, Lock, Globe, Plus, Search, Hash } from 'lucide-react';
import { ChatRoom } from '../../types';

interface RoomListProps {
  rooms: ChatRoom[];
  selectedRoomId: string;
  onSelectRoom: (roomId: string) => void;
  onOpenCreateModal: () => void;
}

export const RoomList: React.FC<RoomListProps> = ({
  rooms,
  selectedRoomId,
  onSelectRoom,
  onOpenCreateModal,
}) => {
  const [activeTab, setActiveTab] = useState<'open' | 'private'>('open');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRooms = rooms
    .filter((r) => (activeTab === 'open' ? !r.is_private : r.is_private))
    .filter(
      (r) =>
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

  return (
    <div className="flex flex-col h-full rounded-[18px] border border-[#EFE6D5] dark:border-[#2C323F] bg-white dark:bg-[#1E222B] shadow-card overflow-hidden">
      {/* Header & Tabs */}
      <div className="p-4 border-b border-[#EFE6D5] dark:border-[#2C323F] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[#B0831E] dark:text-[#E9B949]" />
            <h2 className="text-sm font-bold text-[#1A202C] dark:text-white">Community Chat</h2>
          </div>
          <button
            onClick={onOpenCreateModal}
            className="p-1.5 rounded-lg bg-[#E9B949] hover:bg-[#D4A32D] text-[#1A202C] font-bold text-xs shadow-sm transition-all flex items-center gap-1"
            title="Create Private Room"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Room</span>
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
            className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'private'
                ? 'bg-white dark:bg-[#1E222B] text-[#1A202C] dark:text-[#E9B949] shadow-subtle font-bold'
                : 'text-[#718096] dark:text-[#A0AEC0] hover:text-[#1A202C]'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Private Rooms</span>
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

      {/* Room list scroll */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
        {filteredRooms.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#718096] dark:text-[#A0AEC0]">
            {activeTab === 'open'
              ? 'No public rooms found.'
              : 'No private rooms yet. Click "New Room" to start one!'}
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

                <div className="flex items-center gap-2 mt-2 text-[10px] text-[#A0AEC0]">
                  <span>{room.member_count} members</span>
                  {room.is_private && <span className="text-[#B0831E]">&bull; Invite Only</span>}
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};
