import { useState, useEffect, useCallback } from 'react';
import { Toaster } from 'sonner';
import { Login } from './components/Login';
import { Home } from './components/Home';
import { Rewards } from './components/Rewards';
import { CalendarScreen } from './components/Calendar';
import { SettingsScreen } from './components/Settings';
import { BottomNav } from './components/BottomNav';
import { supabase } from '../lib/supabase';
import { useGymData } from '../lib/useGymData';
import { getWeekSessions, getMonthSessions, hasSessionToday } from '../lib/sessionUtils';

export type TabName = 'home' | 'rewards' | 'calendar' | 'settings';

export type { Session } from '../lib/sessionUtils';

export interface RewardRequest {
  id: string;
  requesterId: string;
  rewardId: string;
  rewardName: string;
  rewardEmoji: string;
  rewardCost: number;
  status: 'pending' | 'approved';
  approvedAt?: string;
}

export interface UserData {
  id: string;
  username: string;
  password: string;
  displayName: string;
  partner: string;
  approvalCode: string;
  points: number;
  multiplier: number;
  weekStreak: number;
  weekMode: 'fixed' | 'rolling';
}

export interface ActiveSession {
  checkInTime: string;
  checkInPhoto: string | null;
}

export default function App() {
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabName>('home');
  const [viewMode, setViewMode] = useState<'self' | 'partner'>('self');
  const [timerMin, setTimerMin] = useState(0);

  const {
    profile,
    partnerProfile,
    sessions,
    rewardRequests,
    activeSession,
    loading,
    checkIn,
    checkOut,
    requestReward,
    approveReward,
    saveSettings,
  } = useGymData(currentUser);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setCurrentUser(data.session.user.id);
    });
  }, []);

  useEffect(() => {
    if (!activeSession) {
      setTimerMin(0);
      return;
    }
    const update = () => {
      const elapsed = Math.floor((Date.now() - new Date(activeSession.checkInTime).getTime()) / 60000);
      setTimerMin(elapsed);
    };
    update();
    const id = setInterval(update, 30000);
    return () => clearInterval(id);
  }, [activeSession]);

  const handleLogin = useCallback(async (username: string, password: string): Promise<boolean> => {
    const { error, data } = await supabase.auth.signInWithPassword({
      email: `${username.toLowerCase()}@gympact.app`,
      password,
    });
    if (error) return false;
    setCurrentUser(data.user.id);
    return true;
  }, []);

  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setActiveTab('home');
    setViewMode('self');
  }, []);

  if (!currentUser) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#F8F8FB', fontFamily: "'Inter', sans-serif" }}>
        <Login onLogin={handleLogin} />
        <Toaster position="top-center" richColors />
      </div>
    );
  }

  if (loading || !profile) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: '#FFFFFF', fontFamily: "'Inter', sans-serif", color: '#6B7280' }}
      >
        Loading your gym data…
      </div>
    );
  }

  const viewUserId = viewMode === 'partner' ? profile.partner : currentUser;
  const viewUser = viewMode === 'partner' ? partnerProfile ?? profile : profile;
  const weekSessions = getWeekSessions(sessions, viewUserId, viewUser.weekMode);
  const monthSessions = getMonthSessions(sessions, viewUserId);
  const todaySession = hasSessionToday(sessions, viewUserId);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFFFFF', fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: '440px', margin: '0 auto', position: 'relative' }}>
        {activeTab === 'home' && (
          <Home
            currentUser={profile}
            viewUser={viewUser}
            viewMode={viewMode}
            sessions={sessions}
            activeSession={activeSession}
            timerMin={timerMin}
            weekSessions={weekSessions}
            monthSessions={monthSessions}
            sessionToday={todaySession}
            onCheckIn={checkIn}
            onCheckOut={checkOut}
          />
        )}
        {activeTab === 'rewards' && partnerProfile && (
          <Rewards
            currentUser={profile}
            partnerUser={partnerProfile}
            rewardRequests={rewardRequests}
            viewMode={viewMode}
            onRequestReward={requestReward}
            onApproveReward={approveReward}
          />
        )}
        {activeTab === 'calendar' && (
          <CalendarScreen sessions={sessions} userId={viewUserId} viewUser={viewUser} />
        )}
        {activeTab === 'settings' && (
          <SettingsScreen
            user={profile}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            onSaveSettings={saveSettings}
            onLogout={handleLogout}
          />
        )}
      </div>
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      <Toaster position="top-center" richColors />
    </div>
  );
}
