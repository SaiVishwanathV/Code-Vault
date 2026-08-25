import React from 'react';
import { useForm } from 'react-hook-form';
import { Lock, Users, Plus, Shield } from 'lucide-react';
import { Modal } from '../common/Modal';

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateRoom: (data: {
    name: string;
    description: string;
    maxMembers: number;
    invitedUsernames: string[];
  }) => Promise<void>;
}

interface FormValues {
  name: string;
  description: string;
  maxMembers: number;
  inviteUsernamesStr: string;
}

export const CreateRoomModal: React.FC<CreateRoomModalProps> = ({
  isOpen,
  onClose,
  onCreateRoom,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      name: '',
      description: '',
      maxMembers: 10,
      inviteUsernamesStr: '',
    },
  });

  const onSubmit = async (data: FormValues) => {
    const invitedUsernames = data.inviteUsernamesStr
      .split(',')
      .map((u) => u.trim().replace(/^@/, ''))
      .filter((u) => u.length > 0);

    await onCreateRoom({
      name: data.name,
      description: data.description,
      maxMembers: Number(data.maxMembers) || 10,
      invitedUsernames,
    });

    reset();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="md"
      title="Create Private Study Room"
      description="Launch an invite-only discussion group for mock interviews and DSA collaboration"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#4A5568] dark:text-[#A0AEC0] mb-1.5">
            Room Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            {...register('name', { required: 'Room name is required' })}
            placeholder="e.g. SDE 1 Mock Interview Group"
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
            placeholder="Focus area, target companies, or schedule..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE6D5] dark:border-[#2C323F] bg-[#FFFDF8] dark:bg-[#16181D] text-xs font-medium text-[#1A202C] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#E9B949]"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#4A5568] dark:text-[#A0AEC0] mb-1.5">
            Max Member Limit
          </label>
          <input
            type="number"
            min="2"
            max="50"
            {...register('maxMembers')}
            placeholder="10"
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE6D5] dark:border-[#2C323F] bg-[#FFFDF8] dark:bg-[#16181D] text-xs font-medium text-[#1A202C] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#E9B949]"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#4A5568] dark:text-[#A0AEC0] mb-1.5">
            Invite Members via Username (Comma-separated)
          </label>
          <input
            type="text"
            {...register('inviteUsernamesStr')}
            placeholder="priyacodes, rohan_dev, siddharth_algo"
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE6D5] dark:border-[#2C323F] bg-[#FFFDF8] dark:bg-[#16181D] text-xs font-mono text-[#1A202C] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#E9B949]"
          />
          <span className="text-[10px] text-[#718096] dark:text-[#A0AEC0] mt-1 block">
            Only invited users will be able to see and join this private room.
          </span>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#EFE6D5] dark:border-[#2C323F]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-[#718096] dark:text-[#A0AEC0] hover:bg-[#FFF9EE] dark:hover:bg-[#1E222B] transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-xl bg-[#E9B949] hover:bg-[#D4A32D] text-[#1A202C] text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Create Private Room</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
