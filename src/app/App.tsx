import { useState, useEffect, useCallback } from 'react';
import { toast, Toaster } from 'sonner';
import { supabase } from '../lib/supabase';
import { useGymData } from '../lib/useGymData';
import { Login } from './components/Login';
import { Home } from './components/HomeScreen';
import { Rewards } from './components/Rewards';
import { CalendarScreen } from './components/Calendar';
import { SettingsScreen } from './components/Settings';
import { BottomNav } from './components/BottomNav';
import { supabase } from '../lib/supabase';
import { useGymData } from '../lib/useGymData';
import { getWeekSessions, getMonthSessions, hasSessionToday } from '../lib/sessionUtils';

export type TabName = 'home' | 'rewards' | 'calendar' | 'settings';

export default function App() {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabName>('home');
  const [viewMode, setViewMode] = useState<'self' | 'partner'>('self');

  const {
    profile,
    partnerProfile,
    sessions,
    rewardRequests,
    catalog,
    checkIn,
    checkOut,
    requestReward,
    approveReward,
    saveSettings,
  } = useGymData(currentUserId);

  // Restore session on mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setCurrentUserId(data.session.user.id);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUserId(session?.user.id ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = useCallback(async (username: string, password: string): Promise<boolean> => {
    const { error, data } = await supabase.auth.signInWithPassword({
      email: `${username.toLowerCase()}@gympact.app`,
      password,
    });
    if (error) {
      toast.error('Wrong username or password');
      return false;
    }
    setCurrentUserId(data.user.id);
    return true;
  }, []);

  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut();
    setCurrentUserId(null);
    setActiveTab('home');
    setViewMode('self');
  }, []);

  const handleCheckIn = useCallback(async (photo: string | null) => {
    await checkIn(photo);
    toast.success("📸 Checked in! Let's go 💪");
  }, [checkIn]);

  const handleCheckOut = useCallback(async (sessionId: string, photo: string | null) => {
    await checkOut(sessionId, photo);
    toast.success('✅ Session complete! Points updated.');
  }, [checkOut]);

  const handleRequestReward = useCallback(async (rewardId: number, costPoints: number) => {
    const exists = rewardRequests.find(
      r => r.requester_id === currentUserId && r.reward_id === rewardId && r.status === 'pending'
    );
    if (exists) { toast.info('Already requested — waiting for approval!'); return; }
    await requestReward(rewardId, costPoints);
    const partnerName = partnerProfile?.display_name ?? 'your partner';
    toast.success(`✨ Reward requested! Waiting for ${partnerName} to approve.`);
  }, [currentUserId, rewardRequests, requestReward, partnerProfile]);

  const handleApproveReward = useCallback(async (requestId: string, approvalCode: string): Promise<boolean> => {
    const ok = await approveReward(requestId, approvalCode);
    if (!ok) {
      toast.error('❌ Wrong approval code. Try again.');
      return false;
    }
    toast.success('✅ Reward approved and redeemed!');
    return true;
  }, [approveReward]);

  const handleSaveSettings = useCallback(async (
    displayName: string,
    weekMode: 'fixed' | 'rolling',
    approvalCode: string
  ) => {
    await saveSettings(displayName, weekMode, approvalCode);
    toast.success('✅ Settings saved!');
  }, [saveSettings]);

  if (!currentUserId || !profile) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#F8F8FB', fontFamily: "'Inter', sans-serif" }}>
        <Login onLogin={handleLogin} />
        <Toaster position="top-center" richColors />
      </div>
    );
  }

  const viewProfile = viewMode === 'partner' ? partnerProfile : profile;
  if (!viewProfile || !partnerProfile) return null;

  // Compute derived stats for the viewed user
  const today = new Date();
  const weekStart = getWeekStart(viewProfile.weekly_mode);
  const todayStr = today.toISOString().split('T')[0];

  const weekSessions = sessions.filter(
    s => s.user_id === viewProfile.id &&
      s.status === 'complete' &&
      s.check_in_at >= weekStart
  ).length;

  const monthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  const monthSessions = sessions.filter(
    s => s.user_id === viewProfile.id &&
      s.status === 'complete' &&
      s.check_in_at.startsWith(monthStr)
  ).length;

  const sessionToday = sessions.some(
    s => s.user_id === viewProfile.id && s.check_in_at.startsWith(todayStr)
  );

  const activeSession = sessions.find(
    s => s.user_id === profile.id && s.status === 'active'
  ) ?? null;

  const timerMin = activeSession
    ? Math.floor((Date.now() - new Date(activeSession.check_in_at).getTime()) / 60000)
    : 0;

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFFFFF', fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: '440px', margin: '0 auto', position: 'relative' }}>
        {activeTab === 'home' && (
          <Home
            currentUser={profile}
            viewUser={viewProfile}
            viewMode={viewMode}
            sessions={sessions}
            activeSession={activeSession ? { checkInTime: activeSession.check_in_at, checkInPhoto: activeSession.check_in_url } : null}
            timerMin={timerMin}
            weekSessions={weekSessions}
            monthSessions={monthSessions}
            sessionToday={sessionToday}
            onCheckIn={handleCheckIn}
            onCheckOut={(photo) => {
              if (activeSession) handleCheckOut(activeSession.id, photo);
            }}
          />
        )}
        {activeTab === 'rewards' && partnerProfile && (
          <Rewards
            currentUser={profile}
            partnerUser={partnerProfile}
            catalog={catalog}
            rewardRequests={rewardRequests}
            onRequestReward={(id, name, cost) =>
              requestReward(id, name, REWARD_EMOJI[id] ?? '🎁', cost)
            }
            onApproveReward={approveReward}
            onUseCoupon={useCoupon}
          />
        )}
        {activeTab === 'calendar' && (
          <CalendarScreen
            sessions={sessions}
            userId={viewProfile.id}
            viewUser={viewProfile}
          />
        )}
        {activeTab === 'settings' && (
          <SettingsScreen
            user={profile}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            onSaveSettings={handleSaveSettings}
            onLogout={handleLogout}
          />
        )}
      </div>
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      <Toaster position="top-center" richColors />
    </div>
  );
}

function getWeekStart(mode: 'fixed' | 'rolling'): string {
  const today = new Date();
  if (mode === 'rolling') {
    const d = new Date(today);
    d.setDate(d.getDate() - 6);
    d.setHours(0, 0, 0, 0);
    return d.toISOString();
  }
  const d = new Date(today);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}
