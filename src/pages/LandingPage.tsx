import React from 'react';
import { motion } from 'framer-motion';
import {
  Code2,
  RefreshCw,
  Users,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface LandingPageProps {
  onOpenLogin: () => void;
  onOpenRegister: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenLogin,
  onOpenRegister,
}) => {
  const { startGuestSession } = useAuth();
  const navigate = useNavigate();

  const handleStartLearning = () => {
    startGuestSession();
    navigate('/dashboard');
  };

  const threeFeatures = [
    {
      icon: Code2,
      title: 'Track Problems',
      description:
        'Catalog every DSA problem across LeetCode, Codeforces, GFG, and HackerRank with personal notes and time complexities.',
      badge: 'Multi-Platform',
    },
    {
      icon: RefreshCw,
      title: 'Revision Queue',
      description:
        'Spaced repetition system to re-solve tricky questions before your technical placement interviews and retain core patterns.',
      badge: 'Spaced Repetition',
    },
    {
      icon: Users,
      title: 'Community Chatrooms',
      description:
        'Join open discussion rooms or launch private invite-only study groups to discuss daily challenges and mock interviews.',
      badge: 'Peer Learning',
    },
  ];

  return (
    <div className="min-h-[calc(100vh-8rem)] flex flex-col justify-between py-8 sm:py-16">
      {/* Hero Section */}
      <section className="max-w-4xl mx-auto px-4 text-center space-y-7">
        {/* Minimal badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full border border-[#EFE6D5] dark:border-[#2C323F] bg-[#FFF9EE] dark:bg-[#1E222B] text-[#B0831E] dark:text-[#E9B949] text-xs font-bold shadow-subtle"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Your Personal DSA Learning Workspace</span>
        </motion.div>

        {/* Hero Title */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-2"
        >
          <h1 className="text-4xl sm:text-6xl font-black text-[#1A202C] dark:text-white tracking-tight leading-[1.15]">
            CodeVault <span className="text-[#B0831E] dark:text-[#E9B949] font-extrabold">– Coders Space</span>
          </h1>
        </motion.div>

        {/* Hero Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-base sm:text-xl text-[#4A5568] dark:text-[#CBD5E0] max-w-2xl mx-auto font-medium leading-relaxed"
        >
          Track every DSA problem. Organize notes. Maintain streaks. Prepare for placements.
        </motion.p>

        {/* Two Buttons: Start Learning and Login */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-3.5 pt-2"
        >
          <button
            onClick={handleStartLearning}
            className="px-7 py-3.5 rounded-xl bg-[#E9B949] hover:bg-[#D4A32D] text-[#1A202C] font-bold text-sm shadow-sm transition-all flex items-center gap-2 active:scale-[0.98]"
          >
            Start Learning <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenLogin}
            className="px-7 py-3.5 rounded-xl border border-[#EFE6D5] dark:border-[#2C323F] bg-white dark:bg-[#1E222B] hover:bg-[#FFF9EE] dark:hover:bg-[#252B37] text-[#2D3748] dark:text-white font-bold text-sm shadow-subtle transition-all"
          >
            Login
          </button>
        </motion.div>
      </section>

      {/* Three Feature Cards Only */}
      <section className="max-w-5xl mx-auto px-4 pt-16 sm:pt-24 w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {threeFeatures.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-[18px] border border-[#EFE6D5] dark:border-[#2C323F] bg-[#FFF9EE] dark:bg-[#1E222B] shadow-card flex flex-col justify-between space-y-4 hover:border-[#D4A32D] transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#16181D] border border-[#EFE6D5] dark:border-[#2C323F] text-[#B0831E] dark:text-[#E9B949] flex items-center justify-center shadow-subtle">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#FFFDF8] dark:bg-[#16181D] border border-[#EFE6D5] dark:border-[#2C323F] text-[#718096]">
                      {feat.badge}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-[#1A202C] dark:text-white">
                    {feat.title}
                  </h3>

                  <p className="text-xs text-[#718096] dark:text-[#A0AEC0] leading-relaxed">
                    {feat.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
