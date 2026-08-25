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

  const pinnedMessage = messages.find((m) => m.is_pinned);

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
      <div className="p-4 border-b border-[#EFE6D5] dark:border-[#2C323F] bg-white dark:bg-[#1E222B] flex items-center justify-between">
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
            <Users className="w-3.5 h-3.5 text-[#4F7A5A]" /> {room.member_count} members online
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

      {/* Pinned Announcement Bar */}
      {pinnedMessage && (
        <div className="px-4 py-2 bg-[#FEF3C7] dark:bg-[#2C210C] border-b border-[#FDE68A] dark:border-[#5C4212] flex items-center justify-between text-xs text-[#92400E] dark:text-[#FDE68A]">
          <div className="flex items-center gap-2 truncate">
            <Pin className="w-3.5 h-3.5 shrink-0 fill-[#92400E] dark:fill-[#FDE68A]" />
            <span className="font-bold shrink-0">Pinned Note:</span>
            <span className="truncate">{pinnedMessage.content}</span>
          </div>
          <button
            onClick={() => onTogglePin(pinnedMessage.id)}
            className="text-[11px] font-bold hover:underline shrink-0 ml-2"
          >
            Unpin
          </button>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {messages.map((msg) => {
          const isMe = msg.user_id === currentUser.id;

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} group`}
            >
              {/* Sender Name & Timestamp */}
              <div className="flex items-center gap-1.5 mb-1 px-1 text-[11px] text-[#718096] dark:text-[#A0AEC0]">
                {!isMe && <span className="font-bold text-[#2D3748] dark:text-[#E2E8F0]">{msg.full_name}</span>}
                <span className="font-mono text-[10px]">{formatDate(msg.created_at, 'h:mm a')}</span>
                {msg.is_pinned && (
                  <span className="text-[10px] text-[#B0831E] font-bold inline-flex items-center gap-0.5">
                    <Pin className="w-2.5 h-2.5 fill-[#B0831E]" /> Pinned
                  </span>
                )}
              </div>

              {/* Message Bubble */}
              <div
                className={`relative max-w-lg p-3.5 rounded-2xl border transition-all text-xs leading-relaxed ${
                  msg.is_pinned
                    ? 'bg-[#FEF3C7] dark:bg-[#2C210C] text-[#1A202C] dark:text-[#FDF8E8] border-[#FDE68A] dark:border-[#5C4212] shadow-subtle'
                    : isMe
                    ? 'bg-[#E9B949] text-[#1A202C] border-[#D4A32D] shadow-subtle rounded-tr-sm'
                    : 'bg-white dark:bg-[#1E222B] text-[#2D3748] dark:text-[#F7FAFC] border-[#EFE6D5] dark:border-[#2C323F] shadow-subtle rounded-tl-sm'
                }`}
              >
                {/* Reply quote header */}
                {msg.reply_to && (
                  <div className="mb-2 p-2 rounded-lg bg-black/5 dark:bg-white/5 border-l-2 border-[#1A202C]/40 text-[11px] opacity-80">
                    <span className="font-bold block">@{msg.reply_to.username}</span>
                    <span className="truncate block font-mono">{msg.reply_to.content}</span>
                  </div>
                )}

                {/* Shared Problem Card */}
                {msg.shared_problem && (
                  <div className="mb-2 p-3 rounded-xl bg-white/80 dark:bg-black/20 border border-[#EFE6D5] dark:border-[#2C323F] text-xs">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-mono text-[10px] font-bold text-[#718096]">
                        {msg.shared_problem.problem_id}
                      </span>
                      <DifficultyBadge difficulty={msg.shared_problem.difficulty} className="text-[9px] py-0 px-1.5" />
                    </div>
                    <div className="font-bold text-[#1A202C] dark:text-white">
                      {msg.shared_problem.problem_name}
                    </div>
                    {msg.shared_problem.link && (
                      <a
                        href={msg.shared_problem.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-[#B0831E] dark:text-[#E9B949] hover:underline flex items-center gap-1 mt-1 font-semibold"
                      >
                        <ExternalLink className="w-3 h-3" /> View Problem on {msg.shared_problem.platform}
                      </a>
                    )}
                  </div>
                )}

                {/* Message Text (Markdown formatting) */}
                <div className="whitespace-pre-wrap font-sans select-text">
                  {msg.content}
                </div>

                {/* Reactions list */}
                {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2 pt-1 border-t border-black/5 dark:border-white/5">
                    {Object.entries(msg.reactions).map(([emoji, userIds]) => (
                      <button
                        key={emoji}
                        onClick={() => onToggleReaction(msg.id, emoji)}
                        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] bg-black/5 dark:bg-white/10 hover:bg-black/10 transition-colors font-bold"
                      >
                        <span>{emoji}</span>
                        <span>{userIds.length}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Hover Quick Actions */}
              <div className="flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity text-[11px] text-[#718096]">
                <button
                  onClick={() => setReplyingTo(msg)}
                  className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 transition-colors flex items-center gap-0.5"
                  title="Reply"
                >
                  <Reply className="w-3 h-3" />
                  <span>Reply</span>
                </button>
                <button
                  onClick={() => onTogglePin(msg.id)}
                  className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 transition-colors flex items-center gap-0.5"
                  title={msg.is_pinned ? 'Unpin message' : 'Pin message'}
                >
                  <Pin className="w-3 h-3" />
                  <span>{msg.is_pinned ? 'Unpin' : 'Pin'}</span>
                </button>
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
        <div className="px-4 py-2 bg-[#FFF9EE] dark:bg-[#1E222B] border-t border-[#EFE6D5] dark:border-[#2C323F] flex items-center justify-between text-xs text-[#718096]">
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
      <form onSubmit={handleSend} className="p-3 border-t border-[#EFE6D5] dark:border-[#2C323F] bg-white dark:bg-[#1E222B] space-y-2">
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
