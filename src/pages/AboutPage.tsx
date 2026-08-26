import React, { useState } from 'react';
import { Sparkles, HelpCircle, Mail, Phone, ExternalLink, Copy, Check } from 'lucide-react';

export const AboutPage: React.FC = () => {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);

  const emailSubject = encodeURIComponent('[CodeVault Support] Query / Feedback / Bug Report');
  const emailBody = encodeURIComponent(
    `Hi CodeVault Support Team,\n\nName / Username: \nIssue Type: (Bug Report / Feature Request / Account Help / General)\n\nDetails:\n[Write your message here]\n\n---\nSent from CodeVault Workspace`
  );

  const gmailComposeUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=code.v4ult@gmail.com&su=${emailSubject}&body=${emailBody}`;
  const whatsappUrl = `https://wa.me/919440773606?text=${encodeURIComponent('Hi CodeVault Support Team, I have a query regarding: ')}`;

  const handleCopy = (text: string, type: 'email' | 'phone') => {
    navigator.clipboard.writeText(text);
    if (type === 'email') {
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    } else {
      setCopiedPhone(true);
      setTimeout(() => setCopiedPhone(false), 2000);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-6">
      {/* Hero Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#EFE6D5] dark:border-[#2C323F] bg-[#FFF9EE] dark:bg-[#1E222B] text-[#B0831E] dark:text-[#E9B949] text-xs font-bold shadow-subtle">
          <Sparkles className="w-3.5 h-3.5" />
          <span>About CodeVault – Coders Space</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-[#1A202C] dark:text-white tracking-tight">
          Your Personal DSA Learning Workspace
        </h1>
        <p className="text-xs sm:text-sm text-[#718096] dark:text-[#A0AEC0] max-w-xl mx-auto leading-relaxed">
          CodeVault – Coders Space provides an elegant, distraction-free educational workspace for structured problem tracking, spaced repetition revision, and peer collaboration.
        </p>
      </div>

      {/* Core Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-[18px] border border-[#EFE6D5] dark:border-[#2C323F] bg-[#FFF9EE] dark:bg-[#16181D] space-y-2 shadow-card">
          <div className="w-8 h-8 rounded-lg bg-[#E9B949] text-[#1A202C] flex items-center justify-center font-bold text-xs">
            1
          </div>
          <h3 className="font-bold text-xs text-[#1A202C] dark:text-white">Minimal & Clean</h3>
          <p className="text-[11px] text-[#718096] dark:text-[#A0AEC0] leading-relaxed">
            Generous whitespace and distraction-free design built purely for technical interview preparation.
          </p>
        </div>

        <div className="p-5 rounded-[18px] border border-[#EFE6D5] dark:border-[#2C323F] bg-[#FFF9EE] dark:bg-[#16181D] space-y-2 shadow-card">
          <div className="w-8 h-8 rounded-lg bg-[#4F7A5A] text-white flex items-center justify-center font-bold text-xs">
            2
          </div>
          <h3 className="font-bold text-xs text-[#1A202C] dark:text-white">Spaced Repetition</h3>
          <p className="text-[11px] text-[#718096] dark:text-[#A0AEC0] leading-relaxed">
            Flag tricky edge cases to the retention queue so you never forget an algorithm before interviews.
          </p>
        </div>

        <div className="p-5 rounded-[18px] border border-[#EFE6D5] dark:border-[#2C323F] bg-[#FFF9EE] dark:bg-[#16181D] space-y-2 shadow-card">
          <div className="w-8 h-8 rounded-lg bg-[#3182CE] text-white flex items-center justify-center font-bold text-xs">
            3
          </div>
          <h3 className="font-bold text-xs text-[#1A202C] dark:text-white">Community & Study Rooms</h3>
          <p className="text-[11px] text-[#718096] dark:text-[#A0AEC0] leading-relaxed">
            Collaborate in real-time study channels and private study rooms to discuss patterns with peers.
          </p>
        </div>
      </div>

      {/* Help & Support Section */}
      <div className="p-6 sm:p-8 rounded-[18px] border border-[#EFE6D5] dark:border-[#2C323F] bg-white dark:bg-[#1E222B] shadow-card space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#FFF9EE] dark:bg-[#2C210C] text-[#8C5D0B] dark:text-[#E9B949] flex items-center justify-center border border-[#F8E0B0] dark:border-[#5C4212]">
            <HelpCircle className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#1A202C] dark:text-white">
              Help & Support
            </h2>
            <p className="text-xs text-[#718096] dark:text-[#A0AEC0]">
              Need help, found a bug, or have a suggestion?
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {/* Email Support Card */}
          <div className="p-4 rounded-xl border border-[#EFE6D5] dark:border-[#2C323F] bg-[#FFF9EE]/50 dark:bg-[#16181D] hover:border-[#E9B949] transition-all flex items-center justify-between gap-3 group">
            <a
              href={gmailComposeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 min-w-0 flex-1"
              title="Open in Gmail with pre-filled support template"
            >
              <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#1E222B] border border-[#EFE6D5] dark:border-[#2C323F] text-[#B0831E] dark:text-[#E9B949] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-subtle">
                <Mail className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[11px] font-medium text-[#718096] dark:text-[#A0AEC0] flex items-center gap-1">
                  Email Support (Open Gmail) <ExternalLink className="w-2.5 h-2.5" />
                </span>
                <span className="text-xs font-bold text-[#1A202C] dark:text-white font-mono truncate block">
                  code.v4ult@gmail.com
                </span>
              </div>
            </a>
            <button
              onClick={() => handleCopy('code.v4ult@gmail.com', 'email')}
              className="p-2 rounded-lg hover:bg-white dark:hover:bg-[#1E222B] border border-transparent hover:border-[#EFE6D5] text-[#718096] hover:text-[#1A202C] dark:hover:text-white transition-all shrink-0"
              title="Copy Email Address"
            >
              {copiedEmail ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          {/* Phone / WhatsApp Card */}
          <div className="p-4 rounded-xl border border-[#EFE6D5] dark:border-[#2C323F] bg-[#FFF9EE]/50 dark:bg-[#16181D] hover:border-[#E9B949] transition-all flex items-center justify-between gap-3 group">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 min-w-0 flex-1"
              title="Open WhatsApp Chat with Support"
            >
              <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#1E222B] border border-[#EFE6D5] dark:border-[#2C323F] text-[#4F7A5A] dark:text-[#8CE4A8] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-subtle">
                <Phone className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[11px] font-medium text-[#718096] dark:text-[#A0AEC0] flex items-center gap-1">
                  Phone / WhatsApp <ExternalLink className="w-2.5 h-2.5" />
                </span>
                <span className="text-xs font-bold text-[#1A202C] dark:text-white font-mono truncate block">
                  +91 9440773606
                </span>
              </div>
            </a>
            <button
              onClick={() => handleCopy('+919440773606', 'phone')}
              className="p-2 rounded-lg hover:bg-white dark:hover:bg-[#1E222B] border border-transparent hover:border-[#EFE6D5] text-[#718096] hover:text-[#1A202C] dark:hover:text-white transition-all shrink-0"
              title="Copy Phone Number"
            >
              {copiedPhone ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Subtle Single-Line Footer Credit */}
      <div className="text-center pt-4 pb-2 border-t border-[#EFE6D5]/60 dark:border-[#2C323F]/60">
        <p className="text-xs text-[#718096] dark:text-[#A0AEC0]">
          &copy; 2026 CodeVault &bull; Designed &amp; Maintained by Sai Vishwanath V
        </p>
      </div>
    </div>
  );
};
