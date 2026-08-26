import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Pin,
  Smile,
  Code,
  Reply,
  MoreVertical,
  ExternalLink,
  Users,
  Lock,
  Hash,
  X,
  Sparkles,
} from 'lucide-react';
import { ChatMessage, ChatRoom, Problem, Profile } from '../../types';
import { formatDate } from '../../lib/utils';
import { DifficultyBadge, PlatformBadge } from '../common/Badge';

interface ChatWindowProps {
  room: ChatRoom;
  messages: ChatMessage[];
  currentUser: Profile;
  onSendMessage: (
    content: string,
    replyTo?: ChatMessage['reply_to'],
    sharedProblem?: ChatMessage['shared_problem']
  ) => Promise<void>;
  onTogglePin: (messageId: string) => Promise<void>;
  onToggleReaction: (messageId: string, emoji: string) => Promise<void>;
  onOpenShareProblem: () => void;
  onLeaveRoom?: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  room,
  messages,
  currentUser,
  onSendMessage,
  onTogglePin,
  onToggleReaction,
  onOpenShareProblem,
  onLeaveRoom,
}) => {
  const [inputText, setInputText] = useState('');
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const pinnedMessages = messages.filter((m) => m.is_pinned);
  const canManagePins = currentUser.role === 'admin' || room.created_by === currentUser.id;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    const replyData = replyingTo
      ? {
          id: replyingTo.id,
          username: replyingTo.username,
          content: replyingTo.content.slice(0, 80),
        }
      : undefined;

    const text = inputText;
    setInputText('');
    setReplyingTo(null);

    await onSendMessage(text, replyData);
  };

  const handleEmojiClick = async (messageId: string, emoji: string) => {
    await onToggleReaction(messageId, emoji);
    setShowEmojiPicker(null);
  };

  const commonEmojis = ['🔥', '👏', '💡', '🚀', '❤️', '👍'];

  return (
    <div className="flex flex-col h-full rounded-[18px] border border-[#EFE6D5] dark:border-[#2C323F] bg-[#FFF9EE]/30 dark:bg-[#16181D] shadow-card overflow-hidden">
      {/* Top Room Header */}
      <div className="p-4 border-b border-[#EFE6D5] dark:border-[#2C323F] bg-white dark:bg-[#1E222B] flex items-center justify-between shrink-0">
        <div>
          <div className="flex items-center gap-2">
            {room.is_private ? (
              <Lock className="w-4 h-4 text-[#B0831E] dark:text-[#E9B949]" />
            ) : (
              <Hash className="w-4 h-4 text-[#718096]" />
            )}
            <h3 className="text-sm font-extrabold text-[#1A202C] dark:text-white">
              {room.name}
            </h3>
            {room.is_private && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FEF6E9] text-[#8C5D0B] border border-[#F8E0B0]">
                Private Room
              </span>
            )}
          </div>
          <p className="text-xs text-[#718096] dark:text-[#A0AEC0] mt-0.5">{room.description}</p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {room.is_private && room.room_code && (
            <button
              onClick={() => {
                navigator.clipboard.writeText(room.room_code!);
                setIsTyping(true);
                setTimeout(() => setIsTyping(false), 2000);
              }}
              className="flex items-center gap-1.5 text-xs font-mono font-bold bg-[#FEF6E9] dark:bg-[#2C210C] text-[#8C5D0B] dark:text-[#E9B949] px-2.5 py-1 rounded-lg border border-[#F8E0B0] dark:border-[#5C4212] hover:brightness-95 transition-all shadow-subtle"
              title="Click to copy Room Code and share with friends"
            >
              <span>🔑 Code: {room.room_code}</span>
              <span className="text-[10px] text-[#A0AEC0]">{isTyping ? 'Copied!' : 'Copy'}</span>
            </button>
          )}

          <span className="hidden sm:flex items-center gap-1 text-xs text-[#718096] dark:text-[#A0AEC0] font-medium bg-[#FFF9EE] dark:bg-[#16181D] px-2.5 py-1 rounded-lg border border-[#EFE6D5] dark:border-[#2C323F]">
            <Users className="w-3.5 h-3.5 text-[#4F7A5A]" /> {room.member_count} members
          </span>

          {room.is_private && onLeaveRoom && (
            <button
              onClick={onLeaveRoom}
              className="text-xs font-semibold text-[#C54A53] hover:underline"
            >
              Leave Room
            </button>
          )}
        </div>
      </div>

      {/* Multiple Pinned Messages Announcement Bar */}
      {pinnedMessages.length > 0 && (
        <div className="bg-[#FEF3C7] dark:bg-[#2C210C] border-b border-[#FDE68A] dark:border-[#5C4212] divide-y divide-[#FDE68A]/60 dark:divide-[#5C4212]/60 max-h-32 overflow-y-auto custom-scrollbar shrink-0">
          {pinnedMessages.map((pm) => (
            <div
              key={pm.id}
              className="px-4 py-2 flex items-center justify-between text-xs text-[#92400E] dark:text-[#FDE68A]"
            >
              <div className="flex items-center gap-2 truncate">
                <Pin className="w-3.5 h-3.5 shrink-0 fill-[#92400E] dark:fill-[#FDE68A]" />
                <span className="font-bold shrink-0">@{pm.username}:</span>
                <span className="truncate">{pm.content}</span>
              </div>
              {canManagePins && (
                <button
                  onClick={() => onTogglePin(pm.id)}
                  className="text-[11px] font-bold hover:underline shrink-0 ml-2"
                >
                  Unpin
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {messages.map((msg) => {
          const isMe = msg.user_id === currentUser.id;

          return (
            <div
              key={msg.id}
              className={`flex flex-col group ${isMe ? 'items-end' : 'items-start'}`}
            >
              {/* Message Bubble Container */}
              <div className={`flex items-start gap-2 max-w-[85%] sm:max-w-[75%] ${isMe ? 'flex-row-reverse' : ''}`}>
                <img
                  src={msg.avatar_url}
                  alt={msg.username}
                  className="w-7 h-7 rounded-lg object-cover border border-[#EFE6D5] shrink-0 mt-0.5"
                />

                <div className="space-y-1">
                  {/* Sender Name & Timestamp */}
                  <div className={`flex items-center gap-1.5 text-[10px] text-[#718096] ${isMe ? 'justify-end' : ''}`}>
                    <span className="font-bold text-[#1A202C] dark:text-white">
                      {isMe ? 'You' : msg.full_name}
                    </span>
                    <span>&bull;</span>
                    <span>{formatDate(msg.created_at, 'p')}</span>
                    {msg.is_pinned && (
                      <Pin className="w-3 h-3 text-[#B0831E] fill-[#E9B949]" />
                    )}
                  </div>

                  {/* Reply Reference Bubble */}
                  {msg.reply_to && (
                    <div className="p-2 rounded-xl bg-black/5 dark:bg-white/5 border-l-2 border-[#E9B949] text-[11px] text-[#718096]">
                      <span className="font-bold">@{msg.reply_to.username}</span>: {msg.reply_to.content}
                    </div>
                  )}

                  {/* Shared Problem Card */}
                  {msg.shared_problem && (
                    <div className="p-3 rounded-xl border border-[#E9B949]/50 bg-[#FFFDF8] dark:bg-[#1E222B] shadow-sm space-y-1.5 my-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-xs font-bold text-[#B0831E] dark:text-[#E9B949]">
                          {msg.shared_problem.problem_id}
                        </span>
                        <div className="flex items-center gap-1">
                          <PlatformBadge platform={msg.shared_problem.platform} />
                          <DifficultyBadge difficulty={msg.shared_problem.difficulty} />
                        </div>
                      </div>
                      <h4 className="font-bold text-xs text-[#1A202C] dark:text-white">
                        {msg.shared_problem.problem_name}
                      </h4>
                      {msg.shared_problem.link && (
                        <a
                          href={msg.shared_problem.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-[#B0831E] dark:text-[#E9B949] font-semibold hover:underline pt-1"
                        >
                          <ExternalLink className="w-3 h-3" /> View Problem
                        </a>
                      )}
                    </div>
                  )}

                  {/* Message Content */}
                  <div
                    className={`p-3 rounded-2xl text-xs leading-relaxed break-words ${
                      isMe
                        ? 'bg-[#E9B949] text-[#1A202C] font-medium rounded-tr-none shadow-sm'
                        : 'bg-white dark:bg-[#1E222B] border border-[#EFE6D5] dark:border-[#2C323F] text-[#1A202C] dark:text-[#E2E8F0] rounded-tl-none shadow-subtle'
                    }`}
                  >
                    {msg.content}
                  </div>

                  {/* Emoji Reactions Display */}
                  {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-0.5">
                      {Object.entries(msg.reactions).map(([emoji, userIds]) => {
                        const hasReacted = userIds.includes(currentUser.id);
                        return (
                          <button
                            key={emoji}
                            onClick={() => onToggleReaction(msg.id, emoji)}
                            className={`px-1.5 py-0.5 rounded-full text-[10px] flex items-center gap-1 border transition-all ${
                              hasReacted
                                ? 'bg-[#FEF6E9] border-[#F8E0B0] text-[#8C5D0B]'
                                : 'bg-white dark:bg-[#1E222B] border-[#EFE6D5] dark:border-[#2C323F] text-[#718096]'
                            }`}
                          >
                            <span>{emoji}</span>
                            <span className="font-bold">{userIds.length}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Message Quick Action Menu */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-[10px] text-[#718096] mt-1 px-9">
                <button
                  onClick={() => setReplyingTo(msg)}
                  className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 transition-colors flex items-center gap-0.5"
                >
                  <Reply className="w-3 h-3" />
                  <span>Reply</span>
                </button>

                {canManagePins && (
                  <button
                    onClick={() => onTogglePin(msg.id)}
                    className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 transition-colors flex items-center gap-0.5"
                    title={msg.is_pinned ? 'Unpin message' : 'Pin message'}
                  >
                    <Pin className="w-3 h-3" />
                    <span>{msg.is_pinned ? 'Unpin' : 'Pin'}</span>
                  </button>
                )}

                {/* Emoji quick reaction */}
                <div className="flex items-center gap-0.5 ml-1">
                  {['🔥', '👏', '💡', '🚀'].map((em) => (
                    <button
                      key={em}
                      onClick={() => onToggleReaction(msg.id, em)}
                      className="p-1 rounded hover:scale-125 transition-transform"
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Reply Banner */}
      {replyingTo && (
        <div className="px-4 py-2 bg-[#FFF9EE] dark:bg-[#1E222B] border-t border-[#EFE6D5] dark:border-[#2C323F] flex items-center justify-between text-xs text-[#718096] shrink-0">
          <div className="flex items-center gap-2 truncate">
            <Reply className="w-3.5 h-3.5 text-[#E9B949]" />
            <span>
              Replying to <strong className="text-[#1A202C] dark:text-white">@{replyingTo.username}</strong>:{' '}
              <span className="italic font-mono">{replyingTo.content.slice(0, 50)}...</span>
            </span>
          </div>
          <button onClick={() => setReplyingTo(null)} className="p-1 text-[#A0AEC0] hover:text-[#1A202C]">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Message Input Toolbar & Box */}
      <form onSubmit={handleSend} className="p-3 border-t border-[#EFE6D5] dark:border-[#2C323F] bg-white dark:bg-[#1E222B] space-y-2 shrink-0">
        <div className="flex items-center gap-2">
          {/* Share problem button */}
          <button
            type="button"
            onClick={onOpenShareProblem}
            className="px-2.5 py-1.5 rounded-lg border border-[#EFE6D5] dark:border-[#2C323F] bg-[#FFF9EE] dark:bg-[#16181D] hover:border-[#D4A32D] text-xs font-semibold text-[#2D3748] dark:text-[#E2E8F0] flex items-center gap-1.5 transition-colors"
          >
            <Code className="w-3.5 h-3.5 text-[#B0831E]" />
            <span>Share Problem</span>
          </button>

          {/* Quick emojis */}
          <div className="hidden sm:flex items-center gap-1 text-sm">
            {commonEmojis.map((em) => (
              <button
                key={em}
                type="button"
                onClick={() => setInputText((prev) => prev + em)}
                className="hover:scale-125 transition-transform px-1"
              >
                {em}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type your message, approach intuition, or code walkthrough..."
            className="flex-1 px-4 py-2.5 rounded-xl border border-[#EFE6D5] dark:border-[#2C323F] bg-[#FFFDF8] dark:bg-[#16181D] text-xs text-[#1A202C] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#E9B949]"
          />

          <button
            type="submit"
            disabled={!inputText.trim()}
            className="p-2.5 rounded-xl bg-[#E9B949] hover:bg-[#D4A32D] disabled:opacity-40 text-[#1A202C] font-bold shadow-sm transition-all flex items-center justify-center"
            title="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
