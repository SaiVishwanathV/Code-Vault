import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Lock, Globe, Users, Plus, UserPlus, X, Check, Search } from 'lucide-react';
import { Modal } from '../common/Modal';
import { chatService } from '../../services/chatService';

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserId?: string;
  onCreateRoom: (data: {
    name: string;
    description: string;
    isPrivate: boolean;
    category: string;
    maxMembers: number;
    invitedUsernames: string[];
  }) => Promise<void>;
}

interface FormValues {
  name: string;
  description: string;
  category: string;
  maxMembers: number;
}

export const CreateRoomModal: React.FC<CreateRoomModalProps> = ({
  isOpen,
  onClose,
  currentUserId,
  onCreateRoom,
}) => {
  const [roomType, setRoomType] = useState<'open' | 'private'>('open');
  const [selectedUsernames, setSelectedUsernames] = useState<string[]>([]);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [availableUsers, setAvailableUsers] = useState<{ id: string; username: string; full_name: string; avatar_url?: string }[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      name: '',
      description: '',
      category: 'general',
      maxMembers: 25,
    },
  });

  useEffect(() => {
    if (isOpen) {
      chatService.getAvailableUsers(currentUserId).then(setAvailableUsers);
      setSelectedUsernames([]);
      setUserSearchQuery('');
    }
  }, [isOpen, currentUserId]);

  const handleToggleUser = (username: string) => {
    if (selectedUsernames.includes(username)) {
      setSelectedUsernames(selectedUsernames.filter((u) => u !== username));
    } else {
      setSelectedUsernames([...selectedUsernames, username]);
    }
  };

  const handleAddCustomUsername = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = userSearchQuery.trim().replace(/^@/, '');
      if (val && !selectedUsernames.includes(val)) {
        setSelectedUsernames([...selectedUsernames, val]);
        setUserSearchQuery('');
      }
    }
  };

  const filteredUsers = availableUsers.filter(
    (u) =>
      u.username.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      u.full_name.toLowerCase().includes(userSearchQuery.toLowerCase())
  );

  const onSubmit = async (data: FormValues) => {
    const isPrivate = roomType === 'private';

    await onCreateRoom({
      name: data.name,
      description: data.description,
      isPrivate,
      category: data.category || 'general',
      maxMembers: Number(data.maxMembers) || (isPrivate ? 15 : 50),
      invitedUsernames: isPrivate ? selectedUsernames : [],
    });

    reset();
    setSelectedUsernames([]);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="md"
      title="Create Discussion Channel"
      description="Launch an open public channel or invite selected peers to a private study room"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
        {/* Room Type Toggle */}
        <div className="grid grid-cols-2 gap-2 p-1 rounded-xl border border-[#EFE6D5] dark:border-[#2C323F] bg-[#FFF9EE] dark:bg-[#16181D]">
          <button
            type="button"
            onClick={() => setRoomType('open')}
            className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              roomType === 'open'
                ? 'bg-white dark:bg-[#1E222B] text-[#1A202C] dark:text-[#E9B949] shadow-subtle'
                : 'text-[#718096] dark:text-[#A0AEC0] hover:text-[#1A202C]'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-[#4F7A5A]" />
            <span>Open Public Room</span>
          </button>

          <button
            type="button"
            onClick={() => setRoomType('private')}
            className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              roomType === 'private'
                ? 'bg-white dark:bg-[#1E222B] text-[#1A202C] dark:text-[#E9B949] shadow-subtle'
                : 'text-[#718096] dark:text-[#A0AEC0] hover:text-[#1A202C]'
            }`}
          >
            <Lock className="w-3.5 h-3.5 text-[#B0831E] dark:text-[#E9B949]" />
            <span>Private Room (Direct Invite)</span>
          </button>
        </div>

        {/* Info Banner */}
        {roomType === 'open' ? (
          <div className="p-3 rounded-xl bg-[#E6F4EA] dark:bg-[#12231A] border border-[#A8D5B5] dark:border-[#1E4D30] text-[11px] text-[#2D5A38] dark:text-[#8CE4A8] flex items-center gap-2">
            <Globe className="w-4 h-4 shrink-0" />
            <span>This room will be public in the <strong>Open Rooms</strong> tab. Anyone in CodeVault can view, join, and discuss!</span>
          </div>
        ) : (
          <div className="p-3 rounded-xl bg-[#FFF9EE] dark:bg-[#2C210C] border border-[#F8E0B0] dark:border-[#5C4212] text-[11px] text-[#8C5D0B] dark:text-[#E9B949] flex items-center gap-2">
            <UserPlus className="w-4 h-4 shrink-0" />
            <span>Select the usernames below. They will immediately receive an in-app invite on their Community page with an <strong>&quot;Enter Room&quot;</strong> button!</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#4A5568] dark:text-[#A0AEC0] mb-1.5">
            Room Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            {...register('name', { required: 'Room name is required' })}
            placeholder={roomType === 'open' ? "e.g. Dynamic Programming Masterclass" : "e.g. FAANG Mock Interview Squad"}
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE6D5] dark:border-[#2C323F] bg-[#FFFDF8] dark:bg-[#16181D] text-xs font-medium text-[#1A202C] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#E9B949]"
          />
          {errors.name && <p className="text-xs text-rose-500 mt-1">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#4A5568] dark:text-[#A0AEC0] mb-1.5">
            Description
          </label>
          <textarea
            rows={2}
            {...register('description')}
            placeholder="Focus area, algorithms to discuss, or schedule..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE6D5] dark:border-[#2C323F] bg-[#FFFDF8] dark:bg-[#16181D] text-xs font-medium text-[#1A202C] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#E9B949]"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#4A5568] dark:text-[#A0AEC0] mb-1.5">
              Category
            </label>
            <select
              {...register('category')}
              className="w-full px-3 py-2 rounded-xl border border-[#EFE6D5] dark:border-[#2C323F] bg-[#FFFDF8] dark:bg-[#16181D] text-xs font-medium text-[#1A202C] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#E9B949]"
            >
              <option value="general">General DSA</option>
              <option value="algorithms">Algorithms & Patterns</option>
              <option value="interview">Interview & Placement Prep</option>
              <option value="daily">Daily Challenges</option>
              <option value="study_group">Study Group</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#4A5568] dark:text-[#A0AEC0] mb-1.5">
              Max Members
            </label>
            <input
              type="number"
              min="2"
              max="100"
              {...register('maxMembers')}
              placeholder={roomType === 'open' ? '50' : '15'}
              className="w-full px-3.5 py-2 rounded-xl border border-[#EFE6D5] dark:border-[#2C323F] bg-[#FFFDF8] dark:bg-[#16181D] text-xs font-medium text-[#1A202C] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#E9B949]"
            />
          </div>
        </div>

        {/* Private Room Direct Username Selector */}
        {roomType === 'private' && (
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#4A5568] dark:text-[#A0AEC0]">
              Select Users to Invite ({selectedUsernames.length} selected)
            </label>

            {/* Selected Chips */}
            {selectedUsernames.length > 0 && (
              <div className="flex flex-wrap gap-1.5 p-2 rounded-xl border border-[#EFE6D5] dark:border-[#2C323F] bg-[#FFFDF8] dark:bg-[#16181D]">
                {selectedUsernames.map((u) => (
                  <span
                    key={u}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#FEF6E9] dark:bg-[#2C210C] border border-[#F8E0B0] dark:border-[#5C4212] text-xs font-mono font-bold text-[#8C5D0B] dark:text-[#E9B949]"
                  >
                    @{u}
                    <button
                      type="button"
                      onClick={() => handleToggleUser(u)}
                      className="hover:text-rose-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Search / Type custom username */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-[#A0AEC0]" />
              <input
                type="text"
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                onKeyDown={handleAddCustomUsername}
                placeholder="Search registered coder or type username & press Enter..."
                className="w-full pl-8 pr-3 py-2 rounded-xl border border-[#EFE6D5] dark:border-[#2C323F] bg-[#FFFDF8] dark:bg-[#16181D] text-xs text-[#1A202C] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#E9B949]"
              />
            </div>

            {/* Quick list of available users */}
            {filteredUsers.length > 0 && (
              <div className="max-h-32 overflow-y-auto rounded-xl border border-[#EFE6D5] dark:border-[#2C323F] bg-[#FFFDF8] dark:bg-[#16181D] divide-y divide-[#EFE6D5]/60 dark:divide-[#2C323F]/60 custom-scrollbar">
                {filteredUsers.map((u) => {
                  const isSelected = selectedUsernames.includes(u.username);
                  return (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => handleToggleUser(u.username)}
                      className={`w-full px-3 py-2 text-left flex items-center justify-between text-xs transition-all ${
                        isSelected
                          ? 'bg-[#FFF9EE] dark:bg-[#2C210C] font-bold text-[#8C5D0B] dark:text-[#E9B949]'
                          : 'hover:bg-[#FFF9EE]/50 dark:hover:bg-[#1E222B] text-[#1A202C] dark:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <img
                          src={u.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${u.username}`}
                          alt={u.username}
                          className="w-6 h-6 rounded-md object-cover border border-[#EFE6D5]"
                        />
                        <div>
                          <span className="font-semibold">{u.full_name}</span>
                          <span className="text-[10px] text-[#718096] dark:text-[#A0AEC0] ml-1.5 font-mono">
                            @{u.username}
                          </span>
                        </div>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#EFE6D5] dark:border-[#2C323F]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-[#EFE6D5] dark:border-[#2C323F] text-xs font-semibold text-[#4A5568] dark:text-[#A0AEC0] hover:bg-[#FFF9EE] dark:hover:bg-[#252B37]"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2 rounded-xl bg-[#E9B949] hover:bg-[#D4A32D] text-[#1A202C] font-bold text-xs shadow-sm flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            {isSubmitting ? 'Creating...' : roomType === 'open' ? 'Launch Open Room' : 'Send Invites & Create'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
