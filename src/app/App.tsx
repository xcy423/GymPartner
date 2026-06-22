import { useState, useEffect, useCallback } from 'react';
import { toast, Toaster } from 'sonner';
import { Login } from './components/Login';
import { Home } from './components/HomeScreen';
import { Rewards } from './components/Rewards';
import { CalendarScreen } from './components/Calendar';
import { SettingsScreen } from './components/Settings';
import { BottomNav } from './components/BottomNav';
import { INITIAL_USERS, DEMO_SESSIONS } from './data';
import { getWeekSessions, getMonthSessions, hasSessionToday } from './session-utils';
import type { TabName, Session, RewardRequest, UserData, ActiveSession } from './types';
import { db, EMAIL_MAP } from './supabase';

interface DbProfile {
  id: string;
  username: string;
  display_name: string | null;
  points: number | null;
  multiplier: number | null;
  streak_weeks: number | null;
  partner_id: string | null;
}

interface DbProfileWithPartner extends DbProfile {
  partner: DbProfile | DbProfile[] | null;
}

function mapProfileToUser(profile: DbProfile, partnerUsername: string): UserData {
  const defaults = INITIAL_USERS[profile.username];
  return {
    username: profile.username,
    password: defaults?.password ?? '',
    displayName: profile.display_name ?? defaults?.displayName ?? profile.username,
    partner: partnerUsername,
    approvalCode: defaults?.approvalCode ?? '',
    points: profile.points ?? defaults?.points ?? 0,
    multiplier: profile.multiplier ?? defaults?.multiplier ?? 1,
    weekStreak: profile.streak_weeks ?? defaults?.weekStreak ?? 0,
    weekMode: defaults?.weekMode ?? 'fixed',
  };
}

export default function App() {
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [authBooting, setAuthBooting] = useState(true);
  const [activeTab, setActiveTab] = useState<TabName>('home');
  const [users, setUsers] = useState<Record<string, UserData>>({});
  const [sessions, setSessions] = useState<Session[]>(DEMO_SESSIONS);
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(null);
  const [rewardRequests, setRewardRequests] = useState<RewardRequest[]>([]);
  const [timerMin, setTimerMin] = useState(0);

  useEffect(() => {
    if (!activeSession) { setTimerMin(0); return; }
    const update = () => {
      const elapsed = Math.floor((Date.now() - new Date(activeSession.checkInTime).getTime()) / 60000);
      setTimerMin(elapsed);
    };
    update();
    const id = setInterval(update, 30000);
    return () => clearInterval(id);
  }, [activeSession]);

  const hydrateUsersFromProfile = useCallback((profile: DbProfileWithPartner, preferredUsername?: string) => {
    const partnerRaw = Array.isArray(profile.partner) ? profile.partner[0] : profile.partner;
    if (!partnerRaw || !partnerRaw.username) {
      throw new Error('Partner profile is missing or not linked.');
    }

    const primary = mapProfileToUser(profile, partnerRaw.username);
    const secondary = mapProfileToUser(partnerRaw, primary.username);

    let me = primary;
    let partner = secondary;

    if (preferredUsername && secondary.username === preferredUsername) {
      me = secondary;
      partner = primary;
    }

    setUsers((prev) => ({ ...prev, [me.username]: me, [partner.username]: partner }));
    setCurrentUser(preferredUsername ?? me.username);
    return me;
  }, []);

  const loadProfileFromUserId = useCallback(async (userId: string, preferredUsername?: string) => {
    const { data, error } = await db
      .from('profiles')
      .select('id, username, display_name, points, multiplier, streak_weeks, partner_id, partner:partner_id(id, username, display_name, points, multiplier, streak_weeks, partner_id)')
      .eq('id', userId)
      .single();

    if (error || !data) {
      throw new Error(error?.message ?? 'Profile could not be loaded.');
    }

    return hydrateUsersFromProfile(data as DbProfileWithPartner, preferredUsername);
  }, [hydrateUsersFromProfile]);

  const handleLogin = useCallback(async (username: string, password: string): Promise<boolean> => {
    const email = EMAIL_MAP[username.toLowerCase()];
    if (!email) {
      toast.error('Unknown username.');
      return false;
    }

    const { data, error } = await db.auth.signInWithPassword({ email, password });
    if (error || !data.user) {
      toast.error('Wrong password.');
      return false;
    }

    try {
      const me = await loadProfileFromUserId(data.user.id, username.toLowerCase());
      toast.success(`Welcome back, ${me.displayName}!`);
      return true;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not load your profile.');
      return false;
    }
  }, [loadProfileFromUserId]);

  useEffect(() => {
    let mounted = true;

    const restore = async () => {
      const { data } = await db.auth.getSession();
      const userId = data.session?.user?.id;
      const email = data.session?.user?.email;
      const restoredUsername = email
        ? Object.entries(EMAIL_MAP).find(([, mapped]) => mapped.toLowerCase() === email.toLowerCase())?.[0]
        : undefined;

      if (!userId) {
        if (mounted) setAuthBooting(false);
        return;
      }

      try {
        await loadProfileFromUserId(userId, restoredUsername);
      } catch {
        await db.auth.signOut();
      } finally {
        if (mounted) setAuthBooting(false);
      }
    };

    restore();

    return () => {
      mounted = false;
    };
  }, [loadProfileFromUserId]);

  const handleLogout = useCallback(async () => {
    await db.auth.signOut();
    setCurrentUser(null);
    setActiveTab('home');
    setActiveSession(null);
  }, []);

  const handleCheckIn = useCallback((photo: string | null) => {
    if (!currentUser) return;
    setActiveSession({ checkInTime: new Date().toISOString(), checkInPhoto: photo });
    toast.success('Checked in. Let\'s go.');
  }, [currentUser]);

  const handleCheckOut = useCallback((photo: string | null) => {
    if (!currentUser || !activeSession) return;
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const ci = new Date(activeSession.checkInTime);
    const fmtTime = (d: Date) => `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;

    const newSession: Session = {
      id: `s${Date.now()}`,
      userId: currentUser,
      date: todayStr,
      checkInTime: fmtTime(ci),
      checkOutTime: fmtTime(now),
      checkInPhoto: activeSession.checkInPhoto,
      checkOutPhoto: photo,
      complete: true,
    };

    const newSessions = [...sessions, newSession];
    setSessions(newSessions);
    setActiveSession(null);

    const user = users[currentUser];
    const weekCount = getWeekSessions(newSessions, currentUser, user.weekMode);
    let pts = 0;
    let msg = 'Session complete.';

    if (weekCount === 3) {
      pts = Math.round(100 * user.multiplier);
      msg = `3 sessions this week. +${pts} points earned.`;
    } else if (weekCount === 5) {
      pts = Math.round(150 * user.multiplier);
      msg = `5 sessions this week. Bonus +${pts} points.`;
    } else if (weekCount < 3) {
      msg = `Session saved. ${3 - weekCount} more this week to earn points.`;
    }

    if (pts > 0) {
      setUsers((prev) => ({
        ...prev,
        [currentUser]: { ...prev[currentUser], points: prev[currentUser].points + pts },
      }));
    }
    toast.success(msg);
  }, [currentUser, activeSession, sessions, users]);

  const handleRequestReward = useCallback((rewardId: string, rewardName: string, rewardCost: number) => {
    if (!currentUser) return;
    const exists = rewardRequests.find((r) => r.requesterId === currentUser && r.rewardId === rewardId && r.status === 'pending');
    if (exists) { toast.info('Already requested — waiting for approval!'); return; }
    setRewardRequests((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        requesterId: currentUser,
        rewardId,
        rewardName,
        rewardCost,
        status: 'pending',
        requestedAt: new Date().toISOString(),
      },
    ]);
    const partnerName = users[users[currentUser].partner].displayName;
    toast.success(`Reward requested. Waiting for ${partnerName} to approve.`);
  }, [currentUser, rewardRequests, users]);

  const handleApproveReward = useCallback((requestId: string, approvalCode: string): boolean => {
    if (!currentUser) return false;
    const req = rewardRequests.find((r) => r.id === requestId);
    if (!req) return false;
    if (users[currentUser].approvalCode !== approvalCode) {
      toast.error('Wrong approval code. Try again.');
      return false;
    }
    setUsers((prev) => ({
      ...prev,
      [req.requesterId]: { ...prev[req.requesterId], points: Math.max(0, prev[req.requesterId].points - req.rewardCost) },
    }));
    setRewardRequests((prev) =>
      prev.map((r) => r.id === requestId ? { ...r, status: 'approved', approvedAt: new Date().toISOString() } : r)
    );
    toast.success(`${req.rewardName} approved and redeemed.`);
    return true;
  }, [currentUser, rewardRequests, users]);

  const handleUseCoupon = useCallback((requestId: string): boolean => {
    if (!currentUser) return false;
    const req = rewardRequests.find((r) => r.id === requestId && r.requesterId === currentUser);
    if (!req || req.status !== 'approved') return false;
    setRewardRequests((prev) =>
      prev.map((r) => r.id === requestId ? { ...r, status: 'used', usedAt: new Date().toISOString() } : r)
    );
    toast.success(`${req.rewardName} coupon used.`);
    return true;
  }, [currentUser, rewardRequests]);

  const handleSaveSettings = useCallback((displayName: string, weekMode: 'fixed' | 'rolling', approvalCode: string) => {
    if (!currentUser) return;
    setUsers((prev) => ({ ...prev, [currentUser]: { ...prev[currentUser], displayName, weekMode, approvalCode } }));
    toast.success('Settings saved.');
  }, [currentUser]);

  if (authBooting) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#F8F8FB', fontFamily: "'Inter', sans-serif" }}>
        <Toaster position="top-center" richColors />
      </div>
    );
  }

  if (!currentUser || !users[currentUser]) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#F8F8FB', fontFamily: "'Inter', sans-serif" }}>
        <Login onLogin={handleLogin} />
        <Toaster position="top-center" richColors />
      </div>
    );
  }

  const user = users[currentUser];
  const partnerUser = users[user.partner];
  if (!partnerUser) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#F8F8FB', fontFamily: "'Inter', sans-serif" }}>
        <Toaster position="top-center" richColors />
      </div>
    );
  }

  const selfWeekSessions = getWeekSessions(sessions, currentUser, user.weekMode);
  const partnerWeekSessions = getWeekSessions(sessions, partnerUser.username, partnerUser.weekMode);
  const selfMonthSessions = getMonthSessions(sessions, currentUser);
  const partnerMonthSessions = getMonthSessions(sessions, partnerUser.username);
  const selfTodaySession = hasSessionToday(sessions, currentUser);
  const partnerTodaySession = hasSessionToday(sessions, partnerUser.username);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFFFFF', fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: '440px', margin: '0 auto', position: 'relative' }}>
        {activeTab === 'home' && (
          <Home
            currentUser={user}
            partnerUser={partnerUser}
            sessions={sessions}
            activeSession={activeSession}
            timerMin={timerMin}
            selfWeekSessions={selfWeekSessions}
            partnerWeekSessions={partnerWeekSessions}
            selfMonthSessions={selfMonthSessions}
            partnerMonthSessions={partnerMonthSessions}
            selfSessionToday={selfTodaySession}
            partnerSessionToday={partnerTodaySession}
            onCheckIn={handleCheckIn}
            onCheckOut={handleCheckOut}
          />
        )}
        {activeTab === 'rewards' && (
          <Rewards
            currentUser={user}
            partnerUser={partnerUser}
            rewardRequests={rewardRequests}
            onRequestReward={handleRequestReward}
            onApproveReward={handleApproveReward}
            onUseCoupon={handleUseCoupon}
          />
        )}
        {activeTab === 'calendar' && (
          <CalendarScreen sessions={sessions} currentUser={user} partnerUser={partnerUser} />
        )}
        {activeTab === 'settings' && (
          <SettingsScreen
            user={user}
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
