import { useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Camera, Check, ChevronDown, ChevronUp, Heart, Upload, X } from 'lucide-react';
import type { ActiveSession, Session, UserData } from '../types';

const C = {
  me: '#6EA4BB',
  partner: '#D4A843',
  meTint: 'rgba(110,164,187,0.12)',
  meTintStrong: 'rgba(110,164,187,0.18)',
  meBorder: 'rgba(110,164,187,0.35)',
  partnerTint: 'rgba(212,168,67,0.14)',
  partnerTintStrong: 'rgba(240,219,165,0.20)',
  partnerBorder: 'rgba(212,168,67,0.35)',
  green: '#5A9E6E',
  greenTint: 'rgba(90,158,110,0.12)',
  greenBorder: 'rgba(90,158,110,0.30)',
  textPrimary: '#2A2D35',
  textMuted: '#6B7280',
  textFaint: '#B0B8C8',
  surface3: '#ECEEF5',
  white: '#FFFFFF',
};

const MULTIPLIERS = [1, 1.2, 1.4, 1.6, 1.8, 2, 2.2, 2.4, 2.6, 2.8, 3];

interface Props {
  currentUser: UserData;
  partnerUser: UserData;
  sessions: Session[];
  activeSession: ActiveSession | null;
  timerMin: number;
  selfWeekSessions: number;
  partnerWeekSessions: number;
  selfMonthSessions: number;
  partnerMonthSessions: number;
  selfSessionToday: boolean;
  partnerSessionToday: boolean;
  onCheckIn: (photo: string | null) => void;
  onCheckOut: (photo: string | null) => void;
}

type SessionViewUser = 'me' | 'partner';

function toDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function fmtClock(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function ownerId(user: UserData): string {
  return user.id ?? user.username;
}

function latestSessionForDate(sessions: Session[], userId: string, date: string): Session | null {
  const list = sessions.filter((s) => s.userId === userId && s.date === date);
  if (list.length === 0) return null;
  return list[list.length - 1];
}

function pillStyle(active: boolean, color: string): React.CSSProperties {
  return {
    height: '23px',
    minWidth: '52px',
    borderRadius: '999px',
    border: 'none',
    background: active
      ? 'linear-gradient(90deg, rgba(110, 164, 187, 0.2) 0%, rgba(110, 164, 187, 0.2) 100%), linear-gradient(90deg, rgb(255, 255, 255) 0%, rgb(255, 255, 255) 100%)'
      : 'transparent',
    color,
    fontSize: '11px',
    lineHeight: '16.5px',
    fontWeight: 700,
    padding: '3px 10px',
    cursor: 'pointer',
    position: 'relative',
    zIndex: active ? 2 : 1,
  };
}

function partnerPillStyle(active: boolean): React.CSSProperties {
  const base = pillStyle(active, C.partner);
  return {
    ...base,
    background: active
      ? 'linear-gradient(90deg, rgba(240, 219, 165, 0.2) 0%, rgba(240, 219, 165, 0.2) 100%), linear-gradient(90deg, rgb(255, 255, 255) 0%, rgb(255, 255, 255) 100%)'
      : 'transparent',
  };
}

export function Home({
  currentUser,
  partnerUser,
  sessions,
  activeSession,
  timerMin,
  selfWeekSessions,
  selfSessionToday,
  partnerSessionToday,
  onCheckIn,
  onCheckOut,
}: Props) {
  const [checkInPreview, setCheckInPreview] = useState<string | null>(null);
  const [checkOutPreview, setCheckOutPreview] = useState<string | null>(null);
  const [checkInPhoto, setCheckInPhoto] = useState<string | null>(null);
  const [checkOutPhoto, setCheckOutPhoto] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [sessionViewUser, setSessionViewUser] = useState<SessionViewUser>('me');
  const [showStreakInfo, setShowStreakInfo] = useState(true);

  const checkInRef = useRef<HTMLInputElement>(null);
  const checkOutRef = useRef<HTMLInputElement>(null);

  const checkoutReady = timerMin >= 60;
  const timeRemaining = Math.max(0, 60 - timerMin);

  const heroTitle = `Good Morning, ${currentUser.displayName}!`;
  const heroTip = partnerSessionToday
    ? `${partnerUser.displayName} logged a session today. Your move. 👀`
    : `${partnerUser.displayName} is waiting for your gym update. 👀`;
  const bothWentToday = selfSessionToday && partnerSessionToday;

  const myMulIndex = Math.max(
    0,
    MULTIPLIERS.findIndex((m) => Math.abs(m - currentUser.multiplier) < 0.05),
  );

  const today = new Date().toISOString().split('T')[0];
  const myToday = useMemo(() => latestSessionForDate(sessions, ownerId(currentUser), today), [sessions, currentUser]);
  const partnerToday = useMemo(() => latestSessionForDate(sessions, ownerId(partnerUser), today), [sessions, partnerUser]);

  const focusedIsMe = sessionViewUser === 'me';
  const focusedColor = focusedIsMe ? C.me : C.partner;
  const focusedTint = focusedIsMe ? C.meTint : C.partnerTint;
  const focusedBorder = focusedIsMe ? C.meBorder : C.partnerBorder;
  const focusedActive = focusedIsMe ? activeSession : null;
  const focusedLoggedToday = focusedIsMe ? selfSessionToday : partnerSessionToday;
  const focusedSavedSession = focusedIsMe ? myToday : partnerToday;
  const sessionCardBg = focusedIsMe ? '#F0F3F6' : 'rgba(240,219,165,0.3)';
  const timelineRailBg = focusedIsMe
    ? 'rgba(110,164,187,0.35)'
    : 'linear-gradient(180deg, rgba(212, 168, 67, 0.6) 31.25%, rgba(240, 219, 165, 0.3) 60.577%, rgba(176, 184, 200, 0.2) 100%)';
  const toggleShellColor = focusedIsMe ? C.partnerTintStrong : 'rgba(110,164,187,0.2)';

  const checkInDone = !!focusedActive || focusedLoggedToday || !!focusedSavedSession;
  const checkInLabel = focusedActive?.checkInTime
    ? fmtClock(focusedActive.checkInTime)
    : focusedSavedSession?.checkInTime ?? null;

  const onCheckInFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await toDataUrl(file);
    setCheckInPreview(url);
    setCheckInPhoto(url);
  };

  const onCheckOutFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await toDataUrl(file);
    setCheckOutPreview(url);
    setCheckOutPhoto(url);
  };

  return (
    <div style={{ padding: '0 20px 100px', background: C.white }}>
      <div style={{ height: '75px', margin: '0 -20px', padding: '12px 16px 13px', borderBottom: '1px solid rgba(0,0,0,0.07)', background: 'rgba(255,255,255,0.88)' }}>
        <div style={{ fontSize: '20px', lineHeight: '30px', fontWeight: 900, letterSpacing: '-0.05em', color: C.textPrimary }}>{heroTitle}</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
          <div style={{ fontSize: '13px', lineHeight: '19.5px', color: C.textMuted }}>{heroTip}</div>
          {bothWentToday && (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                color: '#C04C4B',
                fontSize: '11px',
                fontWeight: 700,
                whiteSpace: 'nowrap',
              }}
            >
              <Heart size={14} fill="currentColor" />
              Both trained
            </div>
          )}
        </div>
      </div>

      <div style={{ marginTop: '12px', borderRadius: '12px', border: `1px solid ${C.meBorder}`, boxShadow: '0 4px 16px rgba(110,164,187,0.15)', padding: '25px', position: 'relative', overflow: 'hidden', background: 'linear-gradient(149.7deg, rgba(110,164,187,0.12) 0%, rgba(255,255,255,0) 100%)' }}>
        <div style={{ position: 'absolute', right: '-30px', top: '-30px', width: '120px', height: '120px', borderRadius: '60px', background: 'rgba(110,164,187,0.12)', opacity: 0.5 }} />
        <div style={{ position: 'absolute', right: '20px', top: '20px', width: '70px', height: '70px', borderRadius: '35px', background: 'rgba(110,164,187,0.12)', opacity: 0.4 }} />

        <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <div style={{ color: C.me, fontWeight: 700, fontSize: '16px', lineHeight: '16px', marginBottom: '8px' }}>GymPartner Points</div>
            <div style={{ color: C.me, fontWeight: 900, fontSize: '36px', lineHeight: '36px', letterSpacing: '-0.04em' }}>{currentUser.points}</div>
          </div>
          <div style={{ height: '24.5px', borderRadius: '999px', border: `1px solid ${C.meBorder}`, background: C.meTint, color: C.me, fontSize: '11px', fontWeight: 700, letterSpacing: '0.04em', padding: '4px 11px' }}>
            This week · {selfWeekSessions} / 3
          </div>
        </div>

        <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Week streak</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 0 }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#C04C4B', textTransform: 'capitalize' }}>{currentUser.weekStreak} weeks</span>
            <span style={{ fontSize: '8px', fontWeight: 700, color: C.me }}> (+{Math.round((currentUser.multiplier - 1) * 100)}% bonus)</span>
          </div>
        </div>

        <div style={{ marginTop: '8px' }}>
          <div style={{ height: '10px', borderRadius: '999px', background: C.surface3, overflow: 'hidden' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((selfWeekSessions / 5) * 100, 100)}%` }}
              transition={{ duration: 0.35 }}
              style={{ height: '100%', borderRadius: '999px', background: 'linear-gradient(90deg, #6EA4BB 0%, #D4A843 100%)' }}
            />
          </div>

          <div style={{ marginTop: '4px', display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', alignItems: 'start' }}>
            {[0, 1, 2, 3, 4, 5].map((v) => {
              const filled = v === 0 ? true : selfWeekSessions >= v;
              return (
                <div key={v} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '4px', background: filled ? C.me : C.surface3 }} />
                  <div style={{ fontSize: '10px', lineHeight: '15px', fontWeight: 700, color: filled ? C.textMuted : C.textFaint }}>
                    {v}{v === 3 ? ' 🎯' : v === 5 ? ' ⭐' : ''}
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Weekly sessions</span>
            <span style={{ fontSize: '11px', fontWeight: 700, color: C.textMuted }}>{selfWeekSessions} / 5</span>
          </div>
        </div>

        <div style={{ marginTop: '12px', fontSize: '8px', lineHeight: '8px', color: C.textMuted }}>
          Hit 3 sessions/week = 100 pts · Hit 5 sessions = 250 pts · Streak multiplier grows each week
        </div>
      </div>

      <div
        style={{
          marginTop: '12px',
          background: '#F3F4F8',
          borderRadius: '12px',
          border: '1px solid rgba(0,0,0,0.06)',
          padding: '12px 16px',
        }}
      >
        <button
          type="button"
          onClick={() => setShowStreakInfo((v) => !v)}
          style={{
            width: '100%',
            border: 'none',
            background: 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0',
            cursor: 'pointer',
          }}
          aria-expanded={showStreakInfo}
          aria-label="Toggle streak multiplier info"
        >
          <div style={{ fontSize: '15px', lineHeight: '22.5px', fontWeight: 800, letterSpacing: '-0.02em', color: C.me }}>
            How Streak Multiplier Works
          </div>
          {showStreakInfo ? <ChevronUp size={16} color={C.me} /> : <ChevronDown size={16} color={C.me} />}
        </button>

        <AnimatePresence initial={false}>
          {showStreakInfo && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{ overflow: 'hidden' }}
            >
              <div style={{ paddingTop: '8px', fontSize: '12px', lineHeight: '20px', color: C.textMuted, marginBottom: '8px' }}>
                Complete <span style={{ color: C.me, fontWeight: 700 }}>3+ sessions/week</span> to grow your multiplier.
                Each successful week gives <span style={{ color: C.me, fontWeight: 700 }}>+x0.2 bonus</span>, capped at <span style={{ color: C.me, fontWeight: 700 }}>x3.0</span>.
                Miss a week and it resets to <span style={{ color: C.me, fontWeight: 700 }}>x1.0</span>.
              </div>

              <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '2px' }}>
                {MULTIPLIERS.map((m, idx) => {
                  const isPast = idx < myMulIndex;
                  const isCurrent = idx === myMulIndex;
                  const boxColor = isCurrent ? C.me : isPast ? C.green : C.textFaint;
                  const boxBorder = isCurrent ? C.me : isPast ? C.greenBorder : 'rgba(0,0,0,0.08)';
                  const bg = isCurrent ? C.meTint : isPast ? C.greenTint : '#FFFFFF';
                  const size = isCurrent ? 44.8 : 40;
                  return (
                    <div
                      key={m}
                      style={{
                        flexShrink: 0,
                        width: `${size}px`,
                        height: `${size}px`,
                        borderRadius: isCurrent ? '8.96px' : '8px',
                        border: `${isCurrent ? 1.68 : 1.5}px solid ${boxBorder}`,
                        background: bg,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: boxColor,
                        fontSize: isCurrent ? '11.2px' : '10px',
                        lineHeight: isCurrent ? '16.8px' : '15px',
                        fontWeight: 700,
                      }}
                    >
                      x{m.toFixed(1)}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: '16px', lineHeight: '23px', fontWeight: 900, letterSpacing: '-0.02em', color: C.textPrimary }}>Today's session</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 0, borderRadius: '999px', padding: '1px', border: `2px solid ${toggleShellColor}`, background: toggleShellColor, overflow: 'clip' }}>
          <button
            type="button"
            onClick={() => setSessionViewUser('me')}
            style={{
              ...pillStyle(sessionViewUser === 'me', C.me),
              marginRight: '-6px',
            }}
          >
            {currentUser.displayName}
          </button>
          <button type="button" onClick={() => setSessionViewUser('partner')} style={partnerPillStyle(sessionViewUser === 'partner')}>
            {partnerUser.displayName}
          </button>
        </div>
      </div>

      <div style={{ marginTop: '8px', position: 'relative', paddingLeft: '16px' }}>
        <div style={{ position: 'absolute', left: '12px', top: '24px', bottom: 0, width: '8px', borderRadius: '999px', background: timelineRailBg }} />

        <div style={{ position: 'relative', marginBottom: checkInDone ? '8px' : 0 }}>
          <div style={{ position: 'absolute', left: '-16px', top: 0, width: '32px', height: '32px', borderRadius: '16px', background: checkInDone ? focusedColor : C.surface3, color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
            {checkInDone ? <Check size={14} /> : '1'}
          </div>

          <div style={{ marginLeft: '24px', borderRadius: '12px', background: sessionCardBg, border: '1px solid rgba(0,0,0,0.06)', padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
              <div style={{ fontSize: '15px', lineHeight: '23px', fontWeight: 800, color: C.textPrimary }}>Check-in photo 📸</div>
              {checkInLabel && (
                <div style={{ fontSize: '12px', lineHeight: '18px', color: focusedColor, fontWeight: 600 }}>Checked in at {checkInLabel}</div>
              )}
            </div>

            <div style={{ fontSize: '12px', lineHeight: '18px', color: C.textMuted, marginBottom: focusedIsMe && !checkInDone ? '8px' : 0 }}>
              Selfie or gym equipment to prove you're there.
            </div>

            {focusedIsMe && !checkInDone && (
              <>
                <div
                  style={{
                    aspectRatio: '16 / 9',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    background: C.surface3,
                    border: `1.5px dashed ${focusedBorder}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '10px',
                    cursor: 'pointer',
                  }}
                  onClick={() => checkInPreview && setLightbox(checkInPreview)}
                >
                  {checkInPreview ? (
                    <img src={checkInPreview} alt="Check-in" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ textAlign: 'center', color: C.textFaint, fontSize: '13px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <Camera size={14} /> Press to Upload check-in
                      </span>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => checkInRef.current?.click()}
                  style={{
                    width: '100%',
                    height: '38px',
                    borderRadius: '8px',
                    border: `1.5px dashed ${focusedColor}`,
                    background: 'transparent',
                    color: focusedColor,
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <Upload size={14} /> Choose photo
                  </span>
                </button>
                <input ref={checkInRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={onCheckInFile} />

                <button
                  onClick={() => {
                    onCheckIn(checkInPhoto);
                    setCheckInPreview(null);
                    setCheckInPhoto(null);
                  }}
                  style={{
                    marginTop: '8px',
                    width: '100%',
                    height: '42px',
                    borderRadius: '8px',
                    border: 'none',
                    color: '#fff',
                    fontSize: '15px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    background: `linear-gradient(135deg, ${C.me}, #4E8BA3)`,
                  }}
                >
                  Check in now
                </button>
              </>
            )}
          </div>
        </div>

        {checkInDone && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: '-16px', top: 0, width: '32px', height: '32px', borderRadius: '16px', background: focusedIsMe ? focusedColor : 'rgba(240,219,165,0.6)', color: focusedIsMe ? '#FFFFFF' : C.partner, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
              2
            </div>

            <div style={{ marginLeft: '24px', borderRadius: '12px', background: sessionCardBg, border: '1px solid rgba(0,0,0,0.06)', padding: '16px' }}>
              <div style={{ fontSize: '15px', lineHeight: '23px', fontWeight: 800, color: C.textPrimary, marginBottom: '2px' }}>Check-out photo 📸</div>
              <div style={{ fontSize: '12px', lineHeight: '18px', color: C.textMuted, marginBottom: '8px' }}>Required after at least 1 hour</div>

              {focusedIsMe && (
                <>
                  <div style={{ marginBottom: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Time in gym</span>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: C.textMuted }}>{timerMin} / 60 min</span>
                    </div>
                    <div style={{ height: '6px', borderRadius: '999px', background: C.surface3, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${Math.min((timerMin / 60) * 100, 100)}%`, borderRadius: '999px', background: focusedColor }} />
                    </div>
                  </div>

                  <div
                    style={{
                      aspectRatio: '16 / 9',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      background: C.surface3,
                      border: `1.5px dashed ${focusedBorder}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '10px',
                      cursor: 'pointer',
                    }}
                    onClick={() => checkOutPreview && setLightbox(checkOutPreview)}
                  >
                    {checkOutPreview ? (
                      <img src={checkOutPreview} alt="Check-out" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ textAlign: 'center', color: C.textFaint, fontSize: '13px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          📷 Press to Upload check-out
                        </span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => checkOutRef.current?.click()}
                    style={{
                      width: '100%',
                      height: '38px',
                      borderRadius: '8px',
                      border: `1.5px dashed ${checkoutReady ? C.green : focusedColor}`,
                      background: 'transparent',
                      color: checkoutReady ? C.green : focusedColor,
                      fontSize: '13px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      marginBottom: '8px',
                    }}
                  >
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <Upload size={14} /> Choose photo
                    </span>
                  </button>
                  <input ref={checkOutRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={onCheckOutFile} />

                  <button
                    onClick={() => {
                      onCheckOut(checkOutPhoto);
                      setCheckOutPreview(null);
                      setCheckOutPhoto(null);
                    }}
                    disabled={!checkoutReady}
                    style={{
                      width: '100%',
                      height: '45px',
                      borderRadius: '8px',
                      border: 'none',
                      color: checkoutReady ? '#fff' : C.textFaint,
                      fontSize: '16px',
                      fontWeight: 700,
                      cursor: checkoutReady ? 'pointer' : 'not-allowed',
                      background: checkoutReady ? `linear-gradient(135deg, ${C.green}, #3D8055)` : C.surface3,
                    }}
                  >
                    Complete session 🎉
                  </button>
                </>
              )}

              {!focusedIsMe && (
                <>
                  <div style={{ marginBottom: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Time in gym</span>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: C.textMuted }}>5 / 60 min</span>
                    </div>
                    <div style={{ height: '6px', borderRadius: '999px', background: C.surface3, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${(5 / 60) * 100}%`, borderRadius: '999px', background: 'linear-gradient(90deg, #6EA4BB 0%, #5A9E6E 100%)' }} />
                    </div>
                  </div>

                  <div
                    style={{
                      aspectRatio: '16 / 9',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      background: C.surface3,
                      border: '1.5px dashed rgba(240,219,165,0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '10px',
                    }}
                  >
                    <div style={{ textAlign: 'center', color: C.textFaint, fontSize: '13px', lineHeight: '19.5px' }}>
                      <div>📷 Press to</div>
                      <div>Upload check-out</div>
                    </div>
                  </div>

                  <button
                    disabled
                    style={{
                      width: '100%',
                      height: '45px',
                      borderRadius: '8px',
                      border: 'none',
                      color: C.textFaint,
                      fontSize: '15px',
                      fontWeight: 700,
                      cursor: 'not-allowed',
                      background: C.surface3,
                    }}
                  >
                    Complete session 🎉
                  </button>

                  <div style={{ marginTop: '8px', fontSize: '11px', lineHeight: '16.5px', color: C.textMuted, textAlign: 'center' }}>
                    55 minutes remaining — keep going! 💪
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </div>

      {focusedIsMe && checkInDone && (
        <div style={{ position: 'fixed', left: '50%', transform: 'translateX(-50%)', bottom: '55px', width: 'min(420px, calc(100vw - 24px))', borderRadius: '8px 8px 0 0', background: '#FFFFFF', border: '1px solid rgba(0,0,0,0.08)', borderBottom: 'none', padding: '8px 12px', zIndex: 60, textAlign: 'center', boxShadow: '0 -1px 6px rgba(0,0,0,0.08)', color: C.textMuted, fontSize: '11px', lineHeight: '17px' }}>
          {checkoutReady ? 'You can complete this session now. 💪' : `${timeRemaining} minutes remaining - keep going! 💪`}
        </div>
      )}

      <AnimatePresence>
        {lightbox && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setLightbox(null)} style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.88)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <button onClick={() => setLightbox(null)} style={{ position: 'absolute', top: '16px', right: '16px', width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)', border: 'none', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <X size={18} />
            </button>
            <img src={lightbox} alt="Full view" style={{ maxHeight: '90vh', maxWidth: '100%', borderRadius: '12px', objectFit: 'contain' }} onClick={(e) => e.stopPropagation()} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
