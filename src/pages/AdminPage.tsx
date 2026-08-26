import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Users,
  MessageSquare,
  Megaphone,
  BarChart3,
  Search,
  UserCheck,
  UserX,
  Trash2,
  Crown,
  Plus,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Clock,
  Layers,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { AdminStats, Announcement, ChatRoom, LeaderboardEntry } from '../types';
import { adminService } from '../services/adminService';
import { announcementService } from '../services/announcementService';
import { formatDate } from '../lib/utils';

export const AdminPage: React.FC = () => {
  const { profile } = useAuth();
  const { success, error: showError } = useToast();

  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'community' | 'announcements'>('overview');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<LeaderboardEntry[]>([]);
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  // User search query
  const [userQuery, setUserQuery] = useState('');

  // New Announcement Form
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState<Announcement['category']>('general');
  const [newPriority, setNewPriority] = useState<Announcement['priority']>('normal');
  const [creatingAnn, setCreatingAnn] = useState(false);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [statsData, usersData, roomsData, annData] = await Promise.all([
        adminService.getAdminStats(),
        adminService.getAllUsers(),
        adminService.getAllRooms(),
        announcementService.getAllAnnouncements(),
      ]);
      setStats(statsData);
      setUsers(usersData);
      setRooms(roomsData);
      setAnnouncements(annData);
    } catch (err: any) {
      showError('Error', err.message || 'Failed to load admin telemetry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  // User Actions
  const handleToggleStatus = async (user: LeaderboardEntry) => {
    const nextStatus = user.status === 'active' ? 'suspended' : 'active';
    try {
      await adminService.updateUserStatus(user.id, nextStatus);
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, status: nextStatus } : u))
      );
      const newStats = await adminService.getAdminStats();
      setStats(newStats);
      success(
        nextStatus === 'suspended' ? 'User Suspended' : 'User Reactivated',
        `@${user.username} account status updated to ${nextStatus}.`
      );
    } catch (err: any) {
      showError('Action Failed', err.message);
    }
  };

  const handleToggleRole = async (user: LeaderboardEntry) => {
    const nextRole = user.role === 'admin' ? 'user' : 'admin';
    try {
      await adminService.updateUserRole(user.id, nextRole);
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, role: nextRole } : u))
      );
      success('Role Updated', `@${user.username} is now a ${nextRole}.`);
    } catch (err: any) {
      showError('Action Failed', err.message);
    }
  };

  const handleDeleteUser = async (userId: string, username: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete @${username} and all their records?`)) return;
    try {
      await adminService.deleteUser(userId);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      const newStats = await adminService.getAdminStats();
      setStats(newStats);
      success('User Deleted', `@${username} permanently removed from database.`);
    } catch (err: any) {
      showError('Delete Failed', err.message);
    }
  };

  // Community Room Actions
  const handleDeleteRoom = async (roomId: string, roomName: string) => {
    if (!window.confirm(`Delete community room "${roomName}" and its history?`)) return;
    try {
      await adminService.deleteRoom(roomId);
      setRooms((prev) => prev.filter((r) => r.id !== roomId));
      success('Room Deleted', `"${roomName}" has been removed.`);
    } catch (err: any) {
      showError('Action Failed', err.message);
    }
  };

  // Announcement Actions
  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;
    setCreatingAnn(true);
    try {
      const created = await announcementService.createAnnouncement(
        newTitle,
        newContent,
        newCategory,
        newPriority,
        profile?.id
      );
      setAnnouncements((prev) => [created, ...prev]);
      setNewTitle('');
      setNewContent('');
      success('Announcement Published', 'Broadcast is now live on all student dashboards.');
    } catch (err: any) {
      showError('Failed to Publish', err.message);
    } finally {
      setCreatingAnn(false);
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    try {
      await announcementService.deleteAnnouncement(id);
      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
      success('Deleted', 'Announcement removed.');
    } catch (err: any) {
      showError('Action Failed', err.message);
    }
  };

  const filteredUsers = users.filter((u) => {
    const q = userQuery.toLowerCase();
    return (
      u.full_name.toLowerCase().includes(q) ||
      u.username.toLowerCase().includes(q) ||
      (u.role && u.role.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 sm:p-8 rounded-[18px] border border-[#EFE6D5] dark:border-[#2C323F] bg-white dark:bg-[#1E222B] shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FEF6E9] dark:bg-[#2C210C] text-[#8C5D0B] dark:text-[#E9B949] text-xs font-bold border border-[#F8E0B0] dark:border-[#5C4212]">
              <ShieldCheck className="w-3.5 h-3.5" /> Administrative Control Center
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#1A202C] dark:text-white tracking-tight">
              CodeVault Admin Workspace
            </h1>
            <p className="text-xs sm:text-sm text-[#718096] dark:text-[#A0AEC0]">
              Manage registered users, moderate study chatrooms, publish broadcasts, and oversee platform health.
            </p>
          </div>

          <button
            onClick={loadAdminData}
            disabled={loading}
            className="p-2.5 rounded-xl border border-[#EFE6D5] dark:border-[#2C323F] hover:bg-[#FFF9EE] text-xs font-bold text-[#718096] flex items-center gap-1.5 self-start sm:self-auto transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex flex-wrap items-center gap-2 mt-6 pt-6 border-t border-[#EFE6D5] dark:border-[#2C323F]">
          {[
            { id: 'overview', label: 'Overview Metrics', icon: BarChart3 },
            { id: 'users', label: `User Management (${users.length})`, icon: Users },
            { id: 'community', label: `Community Moderation (${rooms.length})`, icon: MessageSquare },
            { id: 'announcements', label: `Announcements (${announcements.length})`, icon: Megaphone },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  isActive
                    ? 'bg-[#E9B949] text-[#1A202C] font-bold shadow-sm'
                    : 'bg-[#FFF9EE] dark:bg-[#16181D] border border-[#EFE6D5] dark:border-[#2C323F] text-[#718096] hover:text-[#1A202C] dark:hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab 1: Overview Metrics (5 Cards) */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="p-5 rounded-[18px] border border-[#EFE6D5] dark:border-[#2C323F] bg-white dark:bg-[#1E222B] shadow-card space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#718096]">
                Total Registered
              </span>
              <div className="text-2xl font-black text-[#1A202C] dark:text-white">
                {stats?.totalUsers || 0}
              </div>
              <span className="text-[11px] text-[#4F7A5A] font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Validated Profiles
              </span>
            </div>

            <div className="p-5 rounded-[18px] border border-[#EFE6D5] dark:border-[#2C323F] bg-white dark:bg-[#1E222B] shadow-card space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#718096]">
                Active Users
              </span>
              <div className="text-2xl font-black text-[#B0831E] dark:text-[#E9B949]">
                {stats?.activeUsers || 0}
              </div>
              <span className="text-[11px] text-[#718096]">
                {stats?.totalUsers ? `${Math.round(((stats?.activeUsers || 0) / stats.totalUsers) * 100)}% active accounts` : 'Active accounts'}
              </span>
            </div>

            <div className="p-5 rounded-[18px] border border-[#EFE6D5] dark:border-[#2C323F] bg-white dark:bg-[#1E222B] shadow-card space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#718096]">
                Problems Solved
              </span>
              <div className="text-2xl font-black text-[#1A202C] dark:text-white">
                {stats?.totalProblemsSolved || 0}
              </div>
              <span className="text-[11px] text-[#718096]">Total vault submissions</span>
            </div>

            <div className="p-5 rounded-[18px] border border-[#EFE6D5] dark:border-[#2C323F] bg-white dark:bg-[#1E222B] shadow-card space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#718096]">
                New This Week
              </span>
              <div className="text-2xl font-black text-[#4F7A5A]">
                +{stats?.newUsersThisWeek || 0}
              </div>
              <span className="text-[11px] text-[#4F7A5A] font-semibold">Past 7 days signups</span>
            </div>

            <div className="p-5 rounded-[18px] border border-[#EFE6D5] dark:border-[#2C323F] bg-white dark:bg-[#1E222B] shadow-card space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#718096]">
                Active Rooms
              </span>
              <div className="text-2xl font-black text-[#1A202C] dark:text-white">
                {stats?.activeRooms || 0}
              </div>
              <span className="text-[11px] text-[#718096]">Study channels</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: User Management */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="relative max-w-sm w-full">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#A0AEC0]" />
              <input
                type="text"
                value={userQuery}
                onChange={(e) => setUserQuery(e.target.value)}
                placeholder="Search coder by name or username..."
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-[#EFE6D5] dark:border-[#2C323F] bg-white dark:bg-[#1E222B] text-xs text-[#1A202C] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#E9B949]"
              />
            </div>
          </div>

          <div className="rounded-[18px] border border-[#EFE6D5] dark:border-[#2C323F] bg-white dark:bg-[#1E222B] shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#EFE6D5] dark:border-[#2C323F] bg-[#FFF9EE]/70 dark:bg-[#16181D]/60 text-[11px] font-bold uppercase tracking-wider text-[#718096]">
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-center">Problems Solved</th>
                    <th className="py-3 px-4 text-center">Streak</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EFE6D5]/60 dark:divide-[#2C323F]/80 text-xs">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-[#FFF9EE]/40 dark:hover:bg-[#252B37]/30 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={u.avatar_url}
                            alt={u.username}
                            className="w-8 h-8 rounded-lg object-cover border border-[#EFE6D5] shrink-0"
                          />
                          <div>
                            <div className="font-bold text-[#1A202C] dark:text-white">
                              {u.full_name}
                            </div>
                            <span className="text-[11px] text-[#718096] font-mono">
                              @{u.username}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            u.role === 'admin'
                              ? 'bg-[#FEF6E9] text-[#8C5D0B] border border-[#F8E0B0]'
                              : 'bg-[#EFE6D5]/50 text-[#718096]'
                          }`}
                        >
                          {u.role === 'admin' && <Crown className="w-3 h-3 text-[#E9B949]" />}
                          {u.role?.toUpperCase() || 'USER'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            u.status === 'active'
                              ? 'bg-[#EBF3ED] text-[#4F7A5A] border border-[#C7DFC9]'
                              : 'bg-[#FDF2F3] text-[#C54A53] border border-[#F8D2D5]'
                          }`}
                        >
                          {u.status === 'active' ? 'Active' : 'Suspended'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center font-bold text-[#1A202C] dark:text-white">
                        {u.total_solved || 0}
                      </td>

                      <td className="py-3.5 px-4 text-center font-bold text-[#B0831E] dark:text-[#E9B949]">
                        {u.current_streak || 0}d
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleToggleStatus(u)}
                            className={`p-1.5 rounded-lg border text-xs font-semibold transition-colors ${
                              u.status === 'active'
                                ? 'border-[#F8D2D5] text-[#C54A53] hover:bg-[#FDF2F3]'
                                : 'border-[#C7DFC9] text-[#4F7A5A] hover:bg-[#EBF3ED]'
                            }`}
                            title={u.status === 'active' ? 'Suspend User' : 'Reactivate User'}
                          >
                            {u.status === 'active' ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                          </button>

                          <button
                            onClick={() => handleToggleRole(u)}
                            className="p-1.5 rounded-lg border border-[#EFE6D5] dark:border-[#2C323F] text-[#718096] hover:text-[#1A202C] hover:bg-[#FFF9EE]"
                            title={u.role === 'admin' ? 'Demote to User' : 'Promote to Admin'}
                          >
                            <Crown className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleDeleteUser(u.id, u.username)}
                            className="p-1.5 rounded-lg border border-[#F8D2D5] text-[#C54A53] hover:bg-[#FDF2F3]"
                            title="Delete User"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Community Moderation */}
      {activeTab === 'community' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rooms.map((room) => (
              <div
                key={room.id}
                className="p-5 rounded-[18px] border border-[#EFE6D5] dark:border-[#2C323F] bg-white dark:bg-[#1E222B] shadow-card flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#FFF9EE] dark:bg-[#16181D] text-[#8C5D0B] dark:text-[#E9B949] border border-[#F8E0B0]">
                      {room.is_private ? 'Private Study Group' : 'Open Public Room'}
                    </span>
                    <span className="text-xs text-[#718096]">{room.member_count} members</span>
                  </div>

                  <h3 className="font-bold text-sm text-[#1A202C] dark:text-white">
                    {room.name}
                  </h3>
                  <p className="text-xs text-[#718096] dark:text-[#A0AEC0] mt-1 leading-relaxed">
                    {room.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#EFE6D5] dark:border-[#2C323F] flex items-center justify-between">
                  <span className="text-[11px] text-[#A0AEC0]">Category: #{room.category || 'general'}</span>
                  <button
                    onClick={() => handleDeleteRoom(room.id, room.name)}
                    className="p-1.5 rounded-lg border border-[#F8D2D5] text-[#C54A53] hover:bg-[#FDF2F3] text-xs font-semibold flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete Room
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Platform Announcements */}
      {activeTab === 'announcements' && (
        <div className="space-y-6">
          {/* Create Announcement Form */}
          <form
            onSubmit={handleCreateAnnouncement}
            className="p-5 rounded-[18px] border border-[#EFE6D5] dark:border-[#2C323F] bg-white dark:bg-[#1E222B] shadow-card space-y-4"
          >
            <h3 className="text-sm font-bold text-[#1A202C] dark:text-white flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-[#E9B949]" /> Publish Platform Broadcast
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-[#718096] mb-1">
                  Announcement Title
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. 🏆 Weekly DSA Contest #43 Registration Open"
                  required
                  className="w-full px-3.5 py-2 rounded-xl border border-[#EFE6D5] dark:border-[#2C323F] bg-[#FFFDF8] dark:bg-[#16181D] text-xs text-[#1A202C] dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#718096] mb-1">
                  Category
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#EFE6D5] dark:border-[#2C323F] bg-[#FFFDF8] dark:bg-[#16181D] text-xs text-[#1A202C] dark:text-white"
                >
                  <option value="contest">Contest</option>
                  <option value="placement">Placement</option>
                  <option value="notice">Notice</option>
                  <option value="general">General</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#718096] mb-1">
                Announcement Content
              </label>
              <textarea
                rows={2}
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="Broadcast text that will appear at the top of all user dashboards..."
                required
                className="w-full px-3.5 py-2 rounded-xl border border-[#EFE6D5] dark:border-[#2C323F] bg-[#FFFDF8] dark:bg-[#16181D] text-xs text-[#1A202C] dark:text-white"
              />
            </div>

            <button
              type="submit"
              disabled={creatingAnn}
              className="px-5 py-2.5 rounded-xl bg-[#E9B949] hover:bg-[#D4A32D] text-[#1A202C] font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              {creatingAnn ? 'Publishing...' : 'Publish Broadcast'}
            </button>
          </form>

          {/* List Announcements */}
          <div className="space-y-3">
            {announcements.map((ann) => (
              <div
                key={ann.id}
                className="p-4 rounded-[16px] border border-[#EFE6D5] dark:border-[#2C323F] bg-white dark:bg-[#1E222B] shadow-card flex items-start justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#1A202C] dark:text-white">
                      {ann.title}
                    </span>
                    <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-[#FFF9EE] text-[#8C5D0B] border border-[#F8E0B0]">
                      {ann.category}
                    </span>
                  </div>
                  <p className="text-xs text-[#718096] dark:text-[#A0AEC0]">{ann.content}</p>
                </div>

                <button
                  onClick={() => handleDeleteAnnouncement(ann.id)}
                  className="p-1.5 rounded-lg border border-[#F8D2D5] text-[#C54A53] hover:bg-[#FDF2F3]"
                  title="Delete Announcement"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
