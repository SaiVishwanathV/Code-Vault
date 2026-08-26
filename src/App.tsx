import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { useToast } from './context/ToastContext';
import { Problem, Streak } from './types';
import { problemService } from './services/problemService';
import { streakService } from './services/streakService';
import { achievementService } from './services/achievementService';
import { triggerConfetti } from './lib/utils';

// Common Components
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';
import { Footer } from './components/common/Footer';
import { GlobalSearchModal } from './components/common/GlobalSearchModal';

// Auth Components & Modals
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { LoginModal } from './components/auth/LoginModal';
import { RegisterModal } from './components/auth/RegisterModal';
import { OtpVerificationModal } from './components/auth/OtpVerificationModal';
import { ForgotPasswordModal } from './components/auth/ForgotPasswordModal';

// Problem Modals
import { AddEditProblemModal } from './components/problems/AddEditProblemModal';
import { ProblemDetailModal } from './components/problems/ProblemDetailModal';
import { CsvImportExportModal } from './components/problems/CsvImportExportModal';

// Pages
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProblemsPage } from './pages/ProblemsPage';
import { HistoryPage } from './pages/HistoryPage';
import { RevisionPage } from './pages/RevisionPage';
import { FavoritesPage } from './pages/FavoritesPage';
import { NotesPage } from './pages/NotesPage';
import { AchievementsPage } from './pages/AchievementsPage';
import { CommunityPage } from './pages/CommunityPage';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';
import { AdminPage } from './pages/AdminPage';
import { AboutPage } from './pages/AboutPage';
import { NotFoundPage } from './pages/NotFoundPage';

export function App() {
  const { user, profile, updateProfile, isGuest } = useAuth();
  const { success, error: showError } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // App State
  const [problems, setProblems] = useState<Problem[]>([]);
  const [streak, setStreak] = useState<Streak>({
    user_id: '',
    current_streak: 0,
    longest_streak: 0,
  });
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('codevault_sidebar_collapsed') === 'true';
  });

  const handleToggleSidebarCollapse = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('codevault_sidebar_collapsed', String(next));
      return next;
    });
  };

  // Modals state
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isOtpOpen, setIsOtpOpen] = useState(false);
  const [isForgotPassOpen, setIsForgotPassOpen] = useState(false);
  const [pendingOtpEmail, setPendingOtpEmail] = useState('');

  const [isAddProblemOpen, setIsAddProblemOpen] = useState(false);
  const [selectedProblemForDetail, setSelectedProblemForDetail] = useState<Problem | null>(null);
  const [problemToEdit, setProblemToEdit] = useState<Problem | null>(null);
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Global Keyboard Shortcuts (⌘K for search)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Fetch problems & calculate streak
  const loadData = async () => {
    if (!user) {
      setProblems([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const fetchedProblems = await problemService.getProblems(user?.id);
      setProblems(fetchedProblems);

      const calculatedStreak = await streakService.getStreak(user?.id, fetchedProblems);
      setStreak(calculatedStreak);

      // Check achievement badges
      await achievementService.evaluateAchievements(fetchedProblems, calculatedStreak);
    } catch (err: any) {
      console.error('Data loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  // Problem Handlers
  const handleSaveProblem = async (formData: any) => {
    try {
      if (formData.id) {
        // Edit existing
        const updated = await problemService.updateProblem(formData.id, {
          ...formData,
          user_id: user?.id,
        });
        setProblems((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
        success('Problem Updated', `"${updated.problem_name}" was successfully updated.`);
      } else {
        // Add new
        const added = await problemService.addProblem({
          ...formData,
          user_id: user?.id,
        });
        setProblems((prev) => [added, ...prev]);
        triggerConfetti();
        success('Problem Conquered!', `"${added.problem_name}" recorded into your Vault.`);
      }
      // Re-calculate streaks
      const newStreak = await streakService.getStreak(user?.id, problems);
      setStreak(newStreak);
    } catch (err: any) {
      showError('Action Failed', err.message);
    }
  };

  const handleDeleteProblem = async (id: string) => {
    try {
      await problemService.deleteProblem(id, user?.id);
      setProblems((prev) => prev.filter((p) => p.id !== id));
      success('Problem Deleted', 'Removed from your records.');
    } catch (err: any) {
      showError('Delete Failed', err.message);
    }
  };

  const handleToggleFavorite = async (id: string, current: boolean) => {
    try {
      const updated = await problemService.toggleFavorite(id, current, user?.id);
      setProblems((prev) =>
        prev.map((p) => (p.id === id ? { ...p, favorite: updated } : p))
      );
      if (selectedProblemForDetail?.id === id) {
        setSelectedProblemForDetail((prev) => prev ? { ...prev, favorite: updated } : null);
      }
      success(updated ? 'Added to Favorites' : 'Removed from Favorites');
    } catch (err: any) {
      showError('Error', err.message);
    }
  };

  const handleToggleRevision = async (id: string, current: boolean) => {
    try {
      const updated = await problemService.toggleRevision(id, current, user?.id);
      setProblems((prev) =>
        prev.map((p) => (p.id === id ? { ...p, revision_needed: updated } : p))
      );
      if (selectedProblemForDetail?.id === id) {
        setSelectedProblemForDetail((prev) => prev ? { ...prev, revision_needed: updated } : null);
      }
      success(updated ? 'Queued for Revision' : 'Removed from Revision');
    } catch (err: any) {
      showError('Error', err.message);
    }
  };

  const handleMarkRevised = async (id: string, nextDate?: string) => {
    try {
      const updated = await problemService.markRevised(id, nextDate, user?.id);
      setProblems((prev) => prev.map((p) => (p.id === id ? updated : p)));
      triggerConfetti();
      success('Revision Logged', `Problem revised ${updated.revision_count} time(s)!`);
    } catch (err: any) {
      showError('Error', err.message);
    }
  };

  const handleBulkImport = async (parsed: Partial<Problem>[]) => {
    try {
      const count = await problemService.bulkAddProblems(parsed, user?.id);
      await loadData();
      triggerConfetti();
      success('Import Successful', `Added ${count} DSA problems from CSV file.`);
    } catch (err: any) {
      showError('Import Error', err.message);
    }
  };

  const handleUpdateGoal = async (newGoal: number) => {
    await updateProfile({ target_goal: newGoal });
    success('Target Goal Updated', `Goal set to ${newGoal} problems.`);
  };

  return (
    <div className="min-h-screen bg-[#FFFDF8] dark:bg-[#16181D] flex flex-col">
      {/* Top Navbar */}
      <Navbar
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenAddProblem={() => {
          setProblemToEdit(null);
          setIsAddProblemOpen(true);
        }}
        onOpenLogin={() => setIsLoginOpen(true)}
        onOpenRegister={() => setIsRegisterOpen(true)}
        onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Sidebar (Rendered for logged in users) */}
        {user && (
          <Sidebar
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={handleToggleSidebarCollapse}
            problems={problems}
          />
        )}

        {/* Page Container */}
        <main
          className={`flex-1 p-4 sm:p-6 transition-all duration-250 ease-in-out ${
            user ? (isSidebarCollapsed ? 'lg:pl-[84px]' : 'lg:pl-[272px]') : 'w-full'
          }`}
        >
          <Routes>
            {/* Public Landing Page */}
            <Route
              path="/"
              element={
                user ? (
                  <Navigate to="/dashboard" replace />
                ) : (
                  <LandingPage
                    onOpenLogin={() => setIsLoginOpen(true)}
                    onOpenRegister={() => setIsRegisterOpen(true)}
                  />
                )
              }
            />

            {/* Dashboard (Protected) */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute onOpenLogin={() => setIsLoginOpen(true)}>
                  <DashboardPage
                    problems={problems}
                    streak={streak}
                    onOpenAddProblem={() => {
                      setProblemToEdit(null);
                      setIsAddProblemOpen(true);
                    }}
                    onSelectProblem={(p) => setSelectedProblemForDetail(p)}
                    onUpdateGoal={handleUpdateGoal}
                  />
                </ProtectedRoute>
              }
            />

            {/* Problems Catalog (Protected) */}
            <Route
              path="/problems"
              element={
                <ProtectedRoute onOpenLogin={() => setIsLoginOpen(true)}>
                  <ProblemsPage
                    problems={problems}
                    onOpenAddProblem={() => {
                      setProblemToEdit(null);
                      setIsAddProblemOpen(true);
                    }}
                    onSelectProblem={(p) => setSelectedProblemForDetail(p)}
                    onEditProblem={(p) => {
                      setProblemToEdit(p);
                      setIsAddProblemOpen(true);
                    }}
                    onDeleteProblem={handleDeleteProblem}
                    onToggleFavorite={handleToggleFavorite}
                    onToggleRevision={handleToggleRevision}
                    onOpenCsvModal={() => setIsCsvModalOpen(true)}
                  />
                </ProtectedRoute>
              }
            />

            {/* History Feed (Protected) */}
            <Route
              path="/history"
              element={
                <ProtectedRoute onOpenLogin={() => setIsLoginOpen(true)}>
                  <HistoryPage
                    problems={problems}
                    onSelectProblem={(p) => setSelectedProblemForDetail(p)}
                  />
                </ProtectedRoute>
              }
            />

            {/* Revision Queue (Protected) */}
            <Route
              path="/revision"
              element={
                <ProtectedRoute onOpenLogin={() => setIsLoginOpen(true)}>
                  <RevisionPage
                    problems={problems}
                    onSelectProblem={(p) => setSelectedProblemForDetail(p)}
                    onMarkRevised={handleMarkRevised}
                  />
                </ProtectedRoute>
              }
            />

            {/* Favorites (Protected) */}
            <Route
              path="/favorites"
              element={
                <ProtectedRoute onOpenLogin={() => setIsLoginOpen(true)}>
                  <FavoritesPage
                    problems={problems}
                    onSelectProblem={(p) => setSelectedProblemForDetail(p)}
                    onToggleFavorite={handleToggleFavorite}
                    onNavigateToProblems={() => navigate('/problems')}
                  />
                </ProtectedRoute>
              }
            />

            {/* Markdown Notes (Protected) */}
            <Route
              path="/notes"
              element={
                <ProtectedRoute onOpenLogin={() => setIsLoginOpen(true)}>
                  <NotesPage
                    problems={problems}
                    onSaveNotes={async (id, notes) => {
                      await problemService.updateProblem(id, { notes, user_id: user.id });
                      setProblems((prev) =>
                        prev.map((p) => (p.id === id ? { ...p, notes } : p))
                      );
                      success('Notes Saved', 'Markdown solution approach updated.');
                    }}
                  />
                </ProtectedRoute>
              }
            />

            {/* Achievements (Protected) */}
            <Route
              path="/achievements"
              element={
                <ProtectedRoute onOpenLogin={() => setIsLoginOpen(true)}>
                  <AchievementsPage problems={problems} streak={streak} />
                </ProtectedRoute>
              }
            />

            {/* Community Study Rooms (Protected - Authenticated Users Only) */}
            <Route
              path="/community"
              element={
                <ProtectedRoute onOpenLogin={() => setIsLoginOpen(true)}>
                  <CommunityPage problems={problems} />
                </ProtectedRoute>
              }
            />

            {/* Leaderboard (Protected) */}
            <Route
              path="/leaderboard"
              element={
                <ProtectedRoute onOpenLogin={() => setIsLoginOpen(true)}>
                  <LeaderboardPage />
                </ProtectedRoute>
              }
            />

            {/* Profile (Protected) */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute onOpenLogin={() => setIsLoginOpen(true)}>
                  <ProfilePage problems={problems} streak={streak} />
                </ProtectedRoute>
              }
            />

            {/* Settings (Protected) */}
            <Route
              path="/settings"
              element={
                <ProtectedRoute onOpenLogin={() => setIsLoginOpen(true)}>
                  <SettingsPage
                    problems={problems}
                    onOpenCsvModal={() => setIsCsvModalOpen(true)}
                  />
                </ProtectedRoute>
              }
            />

            {/* Admin Control Center (Protected - Admin Role Only) */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute requireAdmin={true} onOpenLogin={() => setIsLoginOpen(true)}>
                  <AdminPage />
                </ProtectedRoute>
              }
            />

            {/* Public About Page */}
            <Route
              path="/about"
              element={<AboutPage />}
            />

            {/* Catch All */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
      </div>

      {/* Global Footer */}
      <Footer />

      {/* Modals */}
      <AddEditProblemModal
        isOpen={isAddProblemOpen}
        onClose={() => {
          setIsAddProblemOpen(false);
          setProblemToEdit(null);
        }}
        onSave={handleSaveProblem}
        initialData={problemToEdit}
      />

      <ProblemDetailModal
        isOpen={Boolean(selectedProblemForDetail)}
        onClose={() => setSelectedProblemForDetail(null)}
        problem={selectedProblemForDetail}
        onEdit={(prob) => {
          setSelectedProblemForDetail(null);
          setProblemToEdit(prob);
          setIsAddProblemOpen(true);
        }}
        onDelete={handleDeleteProblem}
        onToggleFavorite={handleToggleFavorite}
        onToggleRevision={handleToggleRevision}
      />

      <CsvImportExportModal
        isOpen={isCsvModalOpen}
        onClose={() => setIsCsvModalOpen(false)}
        problems={problems}
        onImportSuccess={handleBulkImport}
      />

      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        problems={problems}
        onSelectProblem={(p) => setSelectedProblemForDetail(p)}
      />

      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onSwitchToRegister={() => {
          setIsLoginOpen(false);
          setIsRegisterOpen(true);
        }}
        onForgotPassword={() => {
          setIsLoginOpen(false);
          setIsForgotPassOpen(true);
        }}
      />

      <RegisterModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onSwitchToLogin={() => {
          setIsRegisterOpen(false);
          setIsLoginOpen(true);
        }}
        onRequireOtp={(email: string) => {
          setPendingOtpEmail(email);
          setIsRegisterOpen(false);
          setIsOtpOpen(true);
        }}
      />

      <OtpVerificationModal
        isOpen={isOtpOpen}
        onClose={() => setIsOtpOpen(false)}
        email={pendingOtpEmail}
        onSuccess={() => {
          setIsOtpOpen(false);
          navigate('/dashboard');
        }}
      />

      <ForgotPasswordModal
        isOpen={isForgotPassOpen}
        onClose={() => setIsForgotPassOpen(false)}
        onBackToLogin={() => {
          setIsForgotPassOpen(false);
          setIsLoginOpen(true);
        }}
      />
    </div>
  );
}

export default App;
