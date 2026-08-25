import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Code2,
  Calendar,
  RefreshCw,
  Star,
  FileText,
  Trophy,
  Users,
  Crown,
  User,
  Settings,
  LogOut,
  Target,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Problem } from '../../types';

interface SidebarProps {
  isOpen: boolean; // For mobile
  onClose: () => void;
  isCollapsed: boolean; // For desktop
  onToggleCollapse: () => void;
  problems: Problem[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  isCollapsed,
  onToggleCollapse,
  problems,
}) => {
  const { profile, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const revisionCount = problems.filter((p) => p.revision_needed).length;
  const favoriteCount = problems.filter((p) => p.favorite).length;
  const totalCount = problems.length;
  const targetGoal = profile?.target_goal || 500;
  const progressPercent = Math.min(Math.round((totalCount / targetGoal) * 100), 100);

  const isAdmin = profile?.role === 'admin';

  // Standard requested user order
  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/problems', label: 'Problems', icon: Code2, badge: totalCount },
    { to: '/history', label: 'History', icon: Calendar },
    { to: '/revision', label: 'Revision Queue', icon: RefreshCw, badge: revisionCount, badgeColor: 'bg-[#FEF6E9] text-[#8C5D0B]' },
    { to: '/favorites', label: 'Favorites', icon: Star, badge: favoriteCount, badgeColor: 'bg-[#FFF3D6] text-[#B0831E]' },
    { to: '/notes', label: 'Notes', icon: FileText },
    { to: '/achievements', label: 'Achievements', icon: Trophy },
    { to: '/community', label: 'Community', icon: Users },
    { to: '/leaderboard', label: 'Leaderboard', icon: Crown },
    { to: '/profile', label: 'Profile', icon: User },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  const handleLogout = async () => {
    onClose();
    await signOut();
    navigate('/');
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 border-r border-[#EFE6D5] dark:border-[#2C323F] bg-[#FFFDF8] dark:bg-[#16181D] flex flex-col justify-between transition-all duration-250 ease-in-out ${
          isOpen ? 'translate-x-0 w-[260px]' : '-translate-x-full lg:translate-x-0'
        } ${isCollapsed ? 'lg:w-[72px]' : 'lg:w-[260px]'}`}
      >
        {/* Nav Items List */}
        <div className="p-3 space-y-1 overflow-y-auto custom-scrollbar flex-1">
          {/* Header row with Desktop Collapse Toggle */}
          <div className="flex items-center justify-between px-2 py-1 mb-1">
            {!isCollapsed ? (
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#A0AEC0] dark:text-[#718096]">
                Workspace
              </span>
            ) : (
              <div className="w-full text-center">
                <span className="text-[9px] font-bold uppercase tracking-wider text-[#A0AEC0]">
                  • • •
                </span>
              </div>
            )}

            <button
              onClick={onToggleCollapse}
              className="hidden lg:flex p-1 rounded-lg hover:bg-[#FFF9EE] dark:hover:bg-[#1E222B] text-[#718096] hover:text-[#1A202C] transition-colors"
              title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {isCollapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </button>
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.to;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                title={isCollapsed ? item.label : undefined}
                className={`flex items-center rounded-xl text-xs font-semibold transition-all ${
                  isCollapsed ? 'justify-center p-2.5' : 'justify-between px-3 py-2.5'
                } ${
                  isActive
                    ? 'bg-[#FEF6E9] dark:bg-[#2C210C] text-[#8C5D0B] dark:text-[#E9B949] border border-[#F8E0B0] dark:border-[#5C4212] font-bold shadow-subtle'
                    : 'text-[#4A5568] dark:text-[#A0AEC0] hover:bg-[#FFF9EE]/70 dark:hover:bg-[#1E222B]/70 hover:text-[#1A202C] dark:hover:text-white border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#E9B949]' : 'text-[#A0AEC0]'}`} />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </div>

                {!isCollapsed && item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`px-1.5 py-0.2 rounded-md text-[10px] font-bold shrink-0 ${
                      item.badgeColor || 'bg-[#EFE6D5] dark:bg-[#2C323F] text-[#4A5568] dark:text-[#CBD5E0]'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}

          {/* Admin Control (Strictly visible ONLY to Admin role) */}
          {isAdmin && (
            <div className="pt-2">
              <NavLink
                to="/admin"
                onClick={onClose}
                title={isCollapsed ? 'Admin Control' : undefined}
                className={`flex items-center rounded-xl text-xs font-bold transition-all ${
                  isCollapsed ? 'justify-center p-2.5' : 'justify-between px-3 py-2.5'
                } ${
                  location.pathname.startsWith('/admin')
                    ? 'bg-[#FEF6E9] dark:bg-[#2C210C] text-[#8C5D0B] dark:text-[#E9B949] border border-[#F8E0B0]'
                    : 'text-[#B0831E] dark:text-[#E9B949] hover:bg-[#FFF9EE] dark:hover:bg-[#1E222B] border border-[#F8E0B0]/60'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <ShieldCheck className="w-4 h-4 shrink-0 text-[#E9B949]" />
                  {!isCollapsed && <span>Admin Workspace</span>}
                </div>
                {!isCollapsed && (
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#E9B949] text-[#1A202C] font-bold">
                    ADMIN
                  </span>
                )}
              </NavLink>
            </div>
          )}

          {/* Logout Button in sidebar */}
          <div className="pt-2">
            <button
              onClick={handleLogout}
              title={isCollapsed ? 'Logout' : undefined}
              className={`w-full flex items-center rounded-xl text-xs font-semibold text-[#C54A53] hover:bg-[#FDF0F0] dark:hover:bg-[#2E1416] transition-colors ${
                isCollapsed ? 'justify-center p-2.5' : 'gap-2.5 px-3 py-2.5 text-left'
              }`}
            >
              <LogOut className="w-4 h-4 shrink-0" />
              {!isCollapsed && <span>Logout</span>}
            </button>
          </div>
        </div>

        {/* Bottom Sidebar: Target Goal progress card (hidden when collapsed) */}
        {!isCollapsed ? (
          <div className="p-3 border-t border-[#EFE6D5] dark:border-[#2C323F] animate-in fade-in duration-200">
            <div className="p-3 rounded-[14px] bg-[#FFF9EE] dark:bg-[#1E222B] border border-[#EFE6D5] dark:border-[#2C323F]">
              <div className="flex items-center justify-between text-xs mb-1.5 font-bold">
                <span className="text-[#2D3748] dark:text-[#E2E8F0] flex items-center gap-1">
                  <Target className="w-3.5 h-3.5 text-[#E9B949]" /> Goal Progress
                </span>
                <span className="text-[#B0831E] dark:text-[#E9B949]">{progressPercent}%</span>
              </div>
              <div className="w-full h-1.5 bg-[#EFE6D5] dark:bg-[#2C323F] rounded-full overflow-hidden mb-1">
                <div
                  className="h-full bg-[#E9B949] rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className="text-[10px] text-[#718096] dark:text-[#A0AEC0] block truncate">
                {totalCount} / {targetGoal} problems solved
              </span>
            </div>
          </div>
        ) : (
          <div className="p-2 border-t border-[#EFE6D5] dark:border-[#2C323F] flex justify-center">
            <div
              className="w-8 h-8 rounded-lg bg-[#FEF6E9] dark:bg-[#2C210C] text-[#8C5D0B] dark:text-[#E9B949] flex items-center justify-center font-bold text-[10px] border border-[#F8E0B0]"
              title={`${totalCount} / ${targetGoal} problems solved (${progressPercent}%)`}
            >
              {progressPercent}%
            </div>
          </div>
        )}
      </aside>
    </>
  );
};
