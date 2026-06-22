import { useState, useEffect, useCallback } from 'react';
import { toast, Toaster } from 'sonner';
import { Login } from './components/Login';
import { Home } from './components/Home';
import { Rewards } from './components/Rewards';
import { CalendarScreen } from './components/Calendar';
import { SettingsScreen } from './components/Settings';
import { BottomNav } from './components/BottomNav';

export type TabName = 'home' | 'rewards' | 'calendar' | 'settings';

export interface Session {
  id: string;
  userId: string;
  date: string;
  checkInTime: string;
  checkOutTime: string | null;
  checkInPhoto: string | null;
  checkOutPhoto: string | null;
  complete: boolean;
}

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

const INITIAL_USERS: Record<string, UserData> = {
  codee: {
    username: 'codee',
    password: 'gym123',
    displayName: 'Codee',
    partner: 'owen',
    approvalCode: 'love2026',
    points: 240,
    multiplier: 1.4,
    weekStreak: 2,
    weekMode: 'fixed',
  },
  owen: {
    username: 'owen',
    password: 'gym456',
    displayName: 'Owen',
    partner: 'codee',
    approvalCode: 'pact2026',
    points: 180,
    multiplier: 1.2,
    weekStreak: 1,
    weekMode: 'fixed',
  },
};

const DEMO_SESSIONS: Session[] = [
  // codee - Week 2 (June 8–14): 3 sessions → streak 1, multiplier → 1.2
  { id: 's1', userId: 'codee', date: '2026-06-09', checkInTime: '09:00', checkOutTime: '10:30', checkInPhoto: null, checkOutPhoto: null, complete: true },
  { id: 's2', userId: 'codee', date: '2026-06-11', checkInTime: '08:30', checkOutTime: '10:00', checkInPhoto: null, checkOutPhoto: null, complete: true },
  { id: 's3', userId: 'codee', date: '2026-06-13', checkInTime: '07:00', checkOutTime: '08:45', checkInPhoto: null, checkOutPhoto: null, complete: true },
  // codee - Week 3 (June 15–21): 3 sessions → streak 2, multiplier → 1.4
  { id: 's4', userId: 'codee', date: '2026-06-16', checkInTime: '09:00', checkOutTime: '10:30', checkInPhoto: null, checkOutPhoto: null, complete: true },
  { id: 's5', userId: 'codee', date: '2026-06-18', checkInTime: '18:00', checkOutTime: null, checkInPhoto: null, checkOutPhoto: null, complete: false },
  { id: 's6', userId: 'codee', date: '2026-06-20', checkInTime: '08:00', checkOutTime: '09:30', checkInPhoto: null, checkOutPhoto: null, complete: true },
  // owen - Week 2 (June 8–14): 3 sessions → streak 1, multiplier → 1.2
  { id: 's7', userId: 'owen', date: '2026-06-10', checkInTime: '10:00', checkOutTime: '11:30', checkInPhoto: null, checkOutPhoto: null, complete: true },
  { id: 's8', userId: 'owen', date: '2026-06-12', checkInTime: '09:00', checkOutTime: '10:15', checkInPhoto: null, checkOutPhoto: null, complete: true },
  { id: 's9', userId: 'owen', date: '2026-06-14', checkInTime: '08:30', checkOutTime: '10:00', checkInPhoto: null, checkOutPhoto: null, complete: true },
  // owen - Week 3 (June 15–21): only 1 session — streak resets
  { id: 's10', userId: 'owen', date: '2026-06-17', checkInTime: '07:30', checkOutTime: '09:00', checkInPhoto: null, checkOutPhoto: null, complete: true },
];

function getMonday(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

export function getWeekSessions(sessions: Session[], userId: string, weekMode: 'fixed' | 'rolling'): number {
  const today = new Date();
  let weekStart: Date;
  if (weekMode === 'rolling') {
    weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - 6);
    weekStart.setHours(0, 0, 0, 0);
  } else {
    weekStart = getMonday(today);
  }
  const todayStr = today.toISOString().split('T')[0];
  const weekStartStr = weekStart.toISOString().split('T')[0];
  return sessions.filter(
    (s) => s.userId === userId && s.complete && s.date >= weekStartStr && s.date <= todayStr
  ).length;
}

export function getMonthSessions(sessions: Session[], userId: string): number {
  const today = new Date();
  const monthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  return sessions.filter((s) => s.userId === userId && s.complete && s.date.startsWith(monthStr)).length;
}

export function hasSessionToday(sessions: Session[], userId: string): boolean {
  const today = new Date().toISOString().split('T')[0];
  return sessions.some((s) => s.userId === userId && s.date === today);
}

export default function App() {
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabName>('home');
  const [viewMode, setViewMode] = useState<'self' | 'partner'>('self');
  const [users, setUsers] = useState<Record<string, UserData>>(INITIAL_USERS);
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

  const handleLogin = useCallback((username: string, password: string): boolean => {
    const u = users[username.toLowerCase()];
    if (!u || u.password !== password) return false;
    setCurrentUser(u.username);
    return true;
  }, [users]);

  const handleLogout = useCallback(() => {
    setCurrentUser(null);
    setActiveTab('home');
    setViewMode('self');
    setActiveSession(null);
  }, []);

  const handleCheckIn = useCallback((photo: string | null) => {
    if (!currentUser) return;
    setActiveSession({ checkInTime: new Date().toISOString(), checkInPhoto: photo });
    toast.success('📸 Checked in! Let\'s go 💪');
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
    let msg = '✅ Session complete!';

    if (weekCount === 3) {
      pts = Math.round(100 * user.multiplier);
      msg = `🎯 3 sessions this week! +${pts} pts earned!`;
    } else if (weekCount === 5) {
      pts = Math.round(150 * user.multiplier);
      msg = `⭐ 5 sessions this week! Bonus +${pts} pts!`;
    } else if (weekCount < 3) {
      msg = `✅ Session done! ${3 - weekCount} more to earn points this week!`;
    }

    if (pts > 0) {
      setUsers((prev) => ({
        ...prev,
        [currentUser]: { ...prev[currentUser], points: prev[currentUser].points + pts },
      }));
    }
    toast.success(msg);
  }, [currentUser, activeSession, sessions, users]);

  const handleRequestReward = useCallback((rewardId: string, rewardName: string, rewardEmoji: string, rewardCost: number) => {
    if (!currentUser) return;
    const exists = rewardRequests.find((r) => r.requesterId === currentUser && r.rewardId === rewardId && r.status === 'pending');
    if (exists) { toast.info('Already requested — waiting for approval!'); return; }
    setRewardRequests((prev) => [
      ...prev,
      { id: Date.now().toString(), requesterId: currentUser, rewardId, rewardName, rewardEmoji, rewardCost, status: 'pending' },
    ]);
    const partnerName = users[users[currentUser].partner].displayName;
    toast.success(`✨ Reward requested! Waiting for ${partnerName} to approve.`);
  }, [currentUser, rewardRequests, users]);

  const handleApproveReward = useCallback((requestId: string, approvalCode: string): boolean => {
    if (!currentUser) return false;
    const req = rewardRequests.find((r) => r.id === requestId);
    if (!req) return false;
    if (users[currentUser].approvalCode !== approvalCode) {
      toast.error('❌ Wrong approval code. Try again.');
      return false;
    }
    setUsers((prev) => ({
      ...prev,
      [req.requesterId]: { ...prev[req.requesterId], points: Math.max(0, prev[req.requesterId].points - req.rewardCost) },
    }));
    setRewardRequests((prev) =>
      prev.map((r) => r.id === requestId ? { ...r, status: 'approved', approvedAt: new Date().toISOString() } : r)
    );
    toast.success(`✅ ${req.rewardEmoji} ${req.rewardName} approved and redeemed!`);
    return true;
  }, [currentUser, rewardRequests, users]);

  const handleSaveSettings = useCallback((displayName: string, weekMode: 'fixed' | 'rolling', approvalCode: string) => {
    if (!currentUser) return;
    setUsers((prev) => ({ ...prev, [currentUser]: { ...prev[currentUser], displayName, weekMode, approvalCode } }));
    toast.success('✅ Settings saved!');
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#F8F8FB', fontFamily: "'Inter', sans-serif" }}>
        <Login onLogin={handleLogin} />
        <Toaster position="top-center" richColors />
      </div>
    );
  }

  const user = users[currentUser];
  const viewUserId = viewMode === 'partner' ? user.partner : currentUser;
  const viewUser = users[viewUserId];
  const weekSessions = getWeekSessions(sessions, viewUserId, viewUser.weekMode);
  const monthSessions = getMonthSessions(sessions, viewUserId);
  const todaySession = hasSessionToday(sessions, viewUserId);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFFFFF', fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: '440px', margin: '0 auto', position: 'relative' }}>
        {activeTab === 'home' && (
          <Home
            currentUser={user}
            viewUser={viewUser}
            viewMode={viewMode}
            sessions={sessions}
            activeSession={activeSession}
            timerMin={timerMin}
            weekSessions={weekSessions}
            monthSessions={monthSessions}
            sessionToday={todaySession}
            onCheckIn={handleCheckIn}
            onCheckOut={handleCheckOut}
          />
        )}
        {activeTab === 'rewards' && (
          <Rewards
            currentUser={user}
            partnerUser={users[user.partner]}
            rewardRequests={rewardRequests}
            viewMode={viewMode}
            onRequestReward={handleRequestReward}
            onApproveReward={handleApproveReward}
          />
        )}
        {activeTab === 'calendar' && (
          <CalendarScreen sessions={sessions} userId={viewUserId} viewUser={viewUser} />
        )}
        {activeTab === 'settings' && (
          <SettingsScreen
            user={user}
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
