import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Code2,
  Search,
  Plus,
  User,
  Settings,
  Users,
  Info,
  HelpCircle,
  LogOut,
  ChevronDown,
  Menu,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ThemeToggle } from './ThemeToggle';

interface NavbarProps {
  onOpenSearch: () => void;
  onOpenAddProblem: () => void;
  onOpenLogin: () => void;
  onOpenRegister: () => void;
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenSearch,
  onOpenAddProblem,
  onOpenLogin,
  onOpenRegister,
  onToggleSidebar,
}) => {
  const { user, profile, signOut, isGuest } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    setDropdownOpen(false);
    await signOut();
    navigate('/');
  };

  const isAdmin = profile?.role === 'admin';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#EFE6D5] dark:border-[#2C323F] bg-[#FFFDF8]/95 dark:bg-[#16181D]/95 backdrop-blur-md">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 max-w-7xl mx-auto">
        {/* Left: Mobile Menu & Brand */}
        <div className="flex items-center gap-3">
          {user && onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2 rounded-xl border border-[#EFE6D5] dark:border-[#2C323F] text-[#2D3748] dark:text-[#E2E8F0] hover:bg-[#FFF9EE] dark:hover:bg-[#1E222B]"
              aria-label="Toggle navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <Link to={user ? '/dashboard' : '/'} className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-[#E9B949] text-[#1A202C] flex items-center justify-center font-bold shadow-sm group-hover:scale-105 transition-transform shrink-0">
              <Code2 className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 leading-none">
                <span className="font-extrabold text-base tracking-tight text-[#1A202C] dark:text-white">
                  CodeVault
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-[#FEF6E9] dark:bg-[#2C210C] text-[#8C5D0B] dark:text-[#E9B949] border border-[#F8E0B0] dark:border-[#5C4212]">
                  Coders Space
                </span>
              </div>
              <span className="text-[10px] text-[#718096] dark:text-[#A0AEC0] font-medium tracking-wide mt-0.5 truncate max-w-[210px] sm:max-w-none">
                Your Personal DSA Learning Workspace
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Spotlight Search or Public Nav */}
        {user ? (
          <button
            onClick={onOpenSearch}
            className="hidden md:flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl border border-[#EFE6D5] dark:border-[#2C323F] bg-[#FFF9EE] dark:bg-[#1E222B] hover:border-[#D4A32D] text-xs text-[#718096] dark:text-[#A0AEC0] w-64 transition-all shadow-subtle text-left"
          >
            <Search className="w-4 h-4 text-[#A0AEC0] shrink-0" />
            <span className="truncate">Search problems or notes...</span>
          </button>
        ) : (
          <nav className="hidden md:flex items-center gap-7 text-xs font-semibold text-[#4A5568] dark:text-[#CBD5E0]">
            <Link
              to="/"
              className={`hover:text-[#1A202C] dark:hover:text-white transition-colors ${
                location.pathname === '/' ? 'text-[#1A202C] dark:text-white font-bold' : ''
              }`}
            >
              Home
            </Link>
            <Link
              to="/about"
              className={`hover:text-[#1A202C] dark:hover:text-white transition-colors ${
                location.pathname === '/about' ? 'text-[#1A202C] dark:text-white font-bold' : ''
              }`}
            >
              About
            </Link>
          </nav>
        )}

        {/* Right Actions */}
        <div className="flex items-center gap-2.5">
          {user && (
            <>
              {/* Add Problem button in Header */}
              <button
                onClick={onOpenAddProblem}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#E9B949] hover:bg-[#D4A32D] text-[#1A202C] font-bold text-xs shadow-sm transition-all active:scale-[0.98]"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Add Problem</span>
              </button>

              {/* Mobile Search button */}
              <button
                onClick={onOpenSearch}
                className="md:hidden p-2 rounded-xl border border-[#EFE6D5] dark:border-[#2C323F] text-[#2D3748] dark:text-[#E2E8F0]"
                aria-label="Search"
              >
                <Search className="w-4 h-4" />
              </button>
            </>
          )}

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* User Profile dropdown */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 p-1 rounded-xl hover:bg-[#FFF9EE] dark:hover:bg-[#1E222B] transition-colors"
                aria-label="User menu"
              >
                <img
                  src={
                    profile?.avatar_url ||
                    `https://api.dicebear.com/7.x/bottts/svg?seed=${profile?.username || 'user'}`
                  }
                  alt="Avatar"
                  className="w-8 h-8 rounded-lg object-cover border border-[#EFE6D5] dark:border-[#2C323F]"
                />
                <ChevronDown className="w-3.5 h-3.5 text-[#A0AEC0] hidden sm:block" />
              </button>

              {dropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-[#1E222B] border border-[#EFE6D5] dark:border-[#2C323F] shadow-card py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-4 py-2.5 border-b border-[#EFE6D5] dark:border-[#2C323F]">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-[#1A202C] dark:text-white truncate">
                          {profile?.full_name || 'Vishwa Patel'}
                        </p>
                        {isAdmin && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-[#FEF6E9] text-[#8C5D0B] border border-[#F8E0B0]">
                            ADMIN
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#718096] dark:text-[#A0AEC0] truncate">
                        @{profile?.username || 'user'}
                      </p>
                      {isGuest && (
                        <span className="mt-1 inline-block text-[10px] px-2 py-0.5 rounded bg-[#FEF6E9] text-[#8C5D0B] border border-[#F8E0B0] font-semibold">
                          Guest Demo Mode
                        </span>
                      )}
                    </div>

                    <div className="p-1 space-y-0.5 text-xs font-medium">
                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-[#8C5D0B] dark:text-[#E9B949] bg-[#FFF9EE] dark:bg-[#2C210C]/60 rounded-xl font-bold transition-colors"
                        >
                          <ShieldCheck className="w-4 h-4 text-[#E9B949]" />
                          Admin Workspace
                        </Link>
                      )}

                      <Link
                        to="/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-[#2D3748] dark:text-[#E2E8F0] hover:bg-[#FFF9EE] dark:hover:bg-[#252B37] rounded-xl transition-colors"
                      >
                        <User className="w-4 h-4 text-[#718096]" />
                        My Profile
                      </Link>

                      <Link
                        to="/settings"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-[#2D3748] dark:text-[#E2E8F0] hover:bg-[#FFF9EE] dark:hover:bg-[#252B37] rounded-xl transition-colors"
                      >
                        <Settings className="w-4 h-4 text-[#718096]" />
                        Settings
                      </Link>

                      <Link
                        to="/community"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-[#2D3748] dark:text-[#E2E8F0] hover:bg-[#FFF9EE] dark:hover:bg-[#252B37] rounded-xl transition-colors"
                      >
                        <Users className="w-4 h-4 text-[#718096]" />
                        Community
                      </Link>

                      <Link
                        to="/about"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-[#2D3748] dark:text-[#E2E8F0] hover:bg-[#FFF9EE] dark:hover:bg-[#252B37] rounded-xl transition-colors"
                      >
                        <Info className="w-4 h-4 text-[#718096]" />
                        About CodeVault
                      </Link>

                      <Link
                        to="/about"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-[#2D3748] dark:text-[#E2E8F0] hover:bg-[#FFF9EE] dark:hover:bg-[#252B37] rounded-xl transition-colors"
                      >
                        <HelpCircle className="w-4 h-4 text-[#718096]" />
                        Help
                      </Link>
                    </div>

                    <div className="p-1 border-t border-[#EFE6D5] dark:border-[#2C323F]">
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-[#C54A53] hover:bg-[#FDF0F0] dark:hover:bg-[#2E1416] rounded-xl transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenLogin}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-[#2D3748] dark:text-[#E2E8F0] hover:bg-[#FFF9EE] dark:hover:bg-[#1E222B] transition-colors"
              >
                Login
              </button>
              <button
                onClick={onOpenRegister}
                className="px-3.5 py-2 rounded-xl bg-[#E9B949] hover:bg-[#D4A32D] text-[#1A202C] text-xs font-bold shadow-sm transition-all"
              >
                Register
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
