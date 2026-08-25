import React, { useState, useEffect } from 'react';
import { Bell, Trophy, Megaphone, AlertCircle, X, ChevronRight } from 'lucide-react';
import { Announcement } from '../../types';
import { announcementService } from '../../services/announcementService';

export const AnnouncementBanner: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [dismissedIds, setDismissedIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('codevault_dismissed_announcements') || '[]');
    } catch {
      return [];
    }
  });

  useEffect(() => {
    const load = async () => {
      const data = await announcementService.getActiveAnnouncements();
      setAnnouncements(data);
    };
    load();
  }, []);

  const handleDismiss = (id: string) => {
    const next = [...dismissedIds, id];
    setDismissedIds(next);
    localStorage.setItem('codevault_dismissed_announcements', JSON.stringify(next));
  };

  const activeVisible = announcements.filter((a) => !dismissedIds.includes(a.id));

  if (activeVisible.length === 0) return null;

  return (
    <div className="space-y-3">
      {activeVisible.slice(0, 2).map((ann) => {
        const isUrgent = ann.priority === 'urgent' || ann.priority === 'high';

        return (
          <div
            key={ann.id}
            className={`p-4 rounded-[16px] border transition-all flex items-start justify-between gap-3 shadow-subtle ${
              isUrgent
                ? 'bg-[#FFF9EE] dark:bg-[#2C210C]/70 border-[#F8E0B0] dark:border-[#5C4212]'
                : 'bg-white dark:bg-[#1E222B] border-[#EFE6D5] dark:border-[#2C323F]'
            }`}
          >
            <div className="flex items-start gap-3 min-w-0">
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                  isUrgent
                    ? 'bg-[#E9B949] text-[#1A202C] shadow-sm'
                    : 'bg-[#FFF9EE] dark:bg-[#16181D] text-[#8C5D0B] dark:text-[#E9B949] border border-[#F8E0B0]'
                }`}
              >
                {ann.category === 'contest' ? (
                  <Trophy className="w-4 h-4" />
                ) : ann.category === 'placement' ? (
                  <Megaphone className="w-4 h-4" />
                ) : (
                  <Bell className="w-4 h-4" />
                )}
              </div>

              <div className="min-w-0 space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#1A202C] dark:text-white">
                    {ann.title}
                  </span>
                  {ann.priority === 'high' && (
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-[#FEF6E9] text-[#8C5D0B] border border-[#F8E0B0]">
                      HIGH PRIORITY
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#718096] dark:text-[#A0AEC0] leading-relaxed">
                  {ann.content}
                </p>
              </div>
            </div>

            <button
              onClick={() => handleDismiss(ann.id)}
              className="p-1 rounded-lg text-[#A0AEC0] hover:text-[#2D3748] dark:hover:text-white transition-colors shrink-0"
              title="Dismiss announcement"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
