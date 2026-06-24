import { useState, useEffect, useCallback } from 'react';
import { Toaster } from 'sonner';
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

export type { Session } from '../lib/sessionUtils';

export interface RewardRequest {
  id: string;
  requesterId: string;
  rewardId: string;
  rewardName: string;
  rewardEmoji: string;
  rewardCost: number;
  status: 'redeemed' | 'pending_use' | 'used';
  redeemedAt?: string;
  usedAt?: string;
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
  id: string;
  checkInTime: string;
  checkInPhoto: string | null;
}

export interface GymCheckOutResult {
  session_id: string;
  duration_mins: number;
  week_count: number;
  base_pts: number;
  multiplier: number;
  earned_pts: number;
}

export default function App() {
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabName>('home');
  const [timerMin, setTimerMin] = useState(0);

  const {
    profile,
    partnerProfile,
    sessions,
    rewardRequests,
    catalog,
    activeSession,
    loading,
    checkIn,
    checkOut,
    redeemReward,
    approveCouponUse,
    requestCouponUse,
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
    const id = setInterval(update, 10000);
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

  if (!partnerProfile) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: '#FFFFFF', fontFamily: "'Inter', sans-serif", color: '#6B7280' }}
      >
        Partner profile not linked yet.
      </div>
    );
  }

  const selfWeekSessions = getWeekSessions(sessions, profile.id, profile.weekMode);
  const partnerWeekSessions = getWeekSessions(sessions, partnerProfile.id, partnerProfile.weekMode);
  const selfMonthSessions = getMonthSessions(sessions, profile.id);
  const partnerMonthSessions = getMonthSessions(sessions, partnerProfile.id);
  const selfTodaySession = hasSessionToday(sessions, profile.id);
  const partnerTodaySession = hasSessionToday(sessions, partnerProfile.id);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFFFFF', fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: '440px', margin: '0 auto', position: 'relative' }}>
        {activeTab === 'home' && (
          <Home
            currentUser={profile}
            partnerUser={partnerProfile}
            sessions={sessions}
            activeSession={activeSession}
            timerMin={timerMin}
            selfWeekSessions={selfWeekSessions}
            partnerWeekSessions={partnerWeekSessions}
            selfMonthSessions={selfMonthSessions}
            partnerMonthSessions={partnerMonthSessions}
            selfSessionToday={selfTodaySession}
            partnerSessionToday={partnerTodaySession}
            onCheckIn={checkIn}
            onCheckOut={checkOut}
          />
        )}
        {activeTab === 'rewards' && (
          <Rewards
            currentUser={profile}
            partnerUser={partnerProfile}
            catalog={catalog}
            rewardRequests={rewardRequests}
            onRedeemReward={redeemReward}
            onApproveCouponUse={approveCouponUse}
            onRequestCouponUse={requestCouponUse}
          />
        )}
        {activeTab === 'calendar' && (
          <CalendarScreen sessions={sessions} currentUser={profile} partnerUser={partnerProfile} />
        )}
        {activeTab === 'settings' && (
          <SettingsScreen user={profile} onSaveSettings={saveSettings} onLogout={handleLogout} />
        )}
      </div>
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      <Toaster position="top-center" richColors />
    </div>
  );
}
