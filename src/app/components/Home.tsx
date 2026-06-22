import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { Session, UserData, ActiveSession } from '../App';

const C = {
  primary: '#6EA4BB',
  primaryDark: '#4E8BA3',
  primaryTint: 'rgba(110,164,187,0.12)',
  primaryBorder: 'rgba(110,164,187,0.35)',
  gold: '#D4A843',
  goldTint: 'rgba(212,168,67,0.12)',
  goldBorder: 'rgba(212,168,67,0.35)',
  green: '#5A9E6E',
  greenTint: 'rgba(90,158,110,0.12)',
  greenBorder: 'rgba(90,158,110,0.30)',
  warn: '#D4854A',
  warnTint: 'rgba(212,133,74,0.12)',
  warnBorder: 'rgba(212,133,74,0.35)',
  surface2: '#F3F4F8',
  surface3: '#ECEEF5',
  textPrimary: '#2A2D35',
  textMuted: '#6B7280',
  textFaint: '#B0B8C8',
};

interface Props {
  currentUser: UserData;
  viewUser: UserData;
  viewMode: 'self' | 'partner';
  sessions: Session[];
  activeSession: ActiveSession | null;
  timerMin: number;
  weekSessions: number;
  monthSessions: number;
  sessionToday: boolean;
  onCheckIn: (photo: string | null) => void;
  onCheckOut: (photo: string | null) => void;
}

const MULTIPLIERS = [1.0, 1.2, 1.4, 1.6, 1.8, 2.0, 2.2, 2.4, 2.6, 2.8, 3.0];

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const reader = new FileReader();
    reader.onload = (e) => res(e.target?.result as string);
    reader.onerror = rej;
    reader.readAsDataURL(file);
  });
}

export function Home({
  currentUser,
  viewUser,
  viewMode,
  sessions: _sessions,
  activeSession,
  timerMin,
  weekSessions,
  monthSessions,
  sessionToday,
  onCheckIn,
  onCheckOut,
}: Props) {
  const [checkInPhoto, setCheckInPhoto] = useState<string | null>(null);
  const [checkOutPhoto, setCheckOutPhoto] = useState<string | null>(null);
  const [checkInPreview, setCheckInPreview] = useState<string | null>(null);
  const [checkOutPreview, setCheckOutPreview] = useState<string | null>(null);
  const checkInRef = useRef<HTMLInputElement>(null);
  const checkOutRef = useRef<HTMLInputElement>(null);
  const [lightbox, setLightbox] = useState<string | null>(null);

  const isPartner = viewMode === 'partner';

  const heroMsg =
    weekSessions >= 5
      ? 'Incredible week! 5/5 sessions! ⭐'
      : weekSessions >= 3
      ? 'Weekly goal hit! 🎯 Keep going for bonus!'
      : weekSessions === 2
      ? '1 more session to go! 💪'
      : weekSessions === 1
      ? '2 more sessions to go! 💪'
      : "Let's get moving! 💪 0 sessions this week.";

  const progressPct = Math.min((weekSessions / 5) * 100, 100);
  const milestones = [0, 1, 2, 3, 4, 5];

  const handleCheckInFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await fileToDataUrl(file);
    setCheckInPreview(url);
    setCheckInPhoto(url);
  };

  const handleCheckOutFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await fileToDataUrl(file);
    setCheckOutPreview(url);
    setCheckOutPhoto(url);
  };

  const handleCheckInSubmit = () => {
    onCheckIn(checkInPhoto);
    setCheckInPhoto(null);
    setCheckInPreview(null);
  };

  const handleCheckOutSubmit = () => {
    onCheckOut(checkOutPhoto);
    setCheckOutPhoto(null);
    setCheckOutPreview(null);
  };

  const timeRemaining = Math.max(0, 60 - timerMin);
  const checkoutReady = timerMin >= 60;

  const multiplierIdx = MULTIPLIERS.indexOf(
    MULTIPLIERS.find((m) => Math.abs(m - viewUser.multiplier) < 0.05) ?? 1.0
  );

  return (
    <div style={{ padding: '0 16px 96px', paddingTop: '0' }}>
      {/* Sticky Topbar */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'rgba(255,255,255,0.88)',
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        borderBottom: '1px solid rgba(0,0,0,0.07)',
        padding: '12px 16px',
        margin: '0 -16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '34px', height: '34px', borderRadius: '8px',
            background: `linear-gradient(135deg, ${C.primaryTint}, ${C.goldTint})`,
            border: `1px solid ${C.primaryBorder}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px',
          }}>
            🏋️
          </div>
          <div>
            <div style={{ fontSize: '15px', fontWeight: 800, color: C.textPrimary, letterSpacing: '-0.02em' }}>GymPact</div>
            <div style={{ fontSize: '11px', color: C.textMuted }}>
              {viewUser.displayName} · <span style={{ color: C.gold, fontWeight: 700 }}>{viewUser.points} pts</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {/* Partner banner */}
        <AnimatePresence>
          {isPartner && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              style={{
                padding: '10px 14px',
                borderRadius: '999px',
                background: C.goldTint,
                border: `1px solid ${C.goldBorder}`,
                textAlign: 'center',
                fontSize: '13px',
                fontWeight: 600,
                color: '#B88E2F',
              }}
            >
              👀 Viewing {viewUser.displayName}'s progress
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hero card */}
        <div style={{
          borderRadius: '12px',
          background: `linear-gradient(135deg, ${C.primaryTint}, rgba(255,255,255,0))`,
          border: `1px solid ${C.primaryBorder}`,
          boxShadow: '0 4px 16px rgba(110,164,187,0.15)',
          padding: '24px',
          overflow: 'hidden',
          position: 'relative',
        }}>
          {/* Decorative circles */}
          <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '120px', height: '120px', borderRadius: '50%', background: C.primaryTint, opacity: 0.5 }} />
          <div style={{ position: 'absolute', top: '20px', right: '20px', width: '70px', height: '70px', borderRadius: '50%', background: C.primaryTint, opacity: 0.4 }} />

          {/* Eyebrow chip */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '4px',
            padding: '3px 10px', borderRadius: '999px',
            background: C.primaryTint, border: `1px solid ${C.primaryBorder}`,
            color: C.primary, fontSize: '11px', fontWeight: 700,
            letterSpacing: '0.04em', marginBottom: '10px',
          }}>
            This week · {weekSessions} / 3
          </div>

          {/* Hero title */}
          <div style={{ fontSize: '22px', fontWeight: 900, color: C.textPrimary, letterSpacing: '-0.04em', marginBottom: '8px' }}>
            {heroMsg}
          </div>

          {/* Body copy */}
          <div style={{ fontSize: '13px', color: C.textMuted, lineHeight: 1.5, marginBottom: '16px' }}>
            Hit 3 sessions/week = 100 pts · Hit 5 sessions = 250 pts · Streak multiplier grows each week
          </div>

          {/* Weekly progress bar */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: C.textMuted, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Weekly sessions</span>
              <span style={{ fontSize: '11px', fontWeight: 700, color: C.textMuted }}>{weekSessions} / 5</span>
            </div>
            <div style={{
              height: '10px', borderRadius: '999px', background: C.surface3,
              position: 'relative', overflow: 'hidden',
            }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                style={{
                  height: '100%', borderRadius: '999px',
                  background: `linear-gradient(90deg, ${C.primary}, ${C.gold})`,
                  position: 'absolute', top: 0, left: 0,
                }}
              />
            </div>
            {/* Milestone markers */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
              {milestones.map((m) => {
                const hit = weekSessions >= m;
                const isGold = m === 5;
                const isTarget = m === 3;
                return (
                  <div key={m} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
                    <div style={{
                      width: '8px', height: '8px', borderRadius: '50%',
                      background: hit ? (isGold ? C.gold : C.primary) : C.surface3,
                      transition: 'background 0.3s',
                    }} />
                    <span style={{
                      fontSize: '10px', fontWeight: 700,
                      color: hit ? (isGold ? C.gold : isTarget ? C.primary : C.textMuted) : C.textFaint,
                    }}>
                      {m === 3 ? '3 🎯' : m === 5 ? '5 ⭐' : m}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Reminder banner */}
        {!sessionToday && !activeSession && !isPartner && (
          <div style={{
            padding: '12px 14px',
            borderRadius: '8px',
            background: C.warnTint,
            border: `1px solid ${C.warnBorder}`,
            display: 'flex', alignItems: 'flex-start', gap: '10px',
          }}>
            <span style={{ fontSize: '16px', flexShrink: 0 }}>⚠️</span>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: C.warn }}>Hey, are you tracking? 👋</div>
              <div style={{ fontSize: '12px', color: C.warn, opacity: 0.8 }}>No session logged today.</div>
            </div>
          </div>
        )}

        {/* Stats 2×2 grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {[
            { label: 'Points', value: viewUser.points, color: C.gold },
            { label: 'Multiplier', value: `×${viewUser.multiplier.toFixed(1)}`, color: C.primary },
            { label: 'Week streak', value: `${viewUser.weekStreak} wks`, color: C.green },
            { label: 'Sessions / month', value: monthSessions, color: C.textPrimary },
          ].map((stat) => (
            <div key={stat.label} style={{
              background: C.surface2, borderRadius: '8px',
              border: '1px solid rgba(0,0,0,0.06)',
              padding: '12px',
            }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: C.textMuted, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '4px' }}>
                {stat.label}
              </div>
              <div style={{ fontSize: '22px', fontWeight: 900, color: stat.color, letterSpacing: '-0.04em' }}>
                {stat.value}
              </div>
            </div>
          ))}
        </div>

        {/* Streak explainer */}
        <div style={{
          background: C.surface2, borderRadius: '12px',
          border: '1px solid rgba(0,0,0,0.06)', padding: '16px',
        }}>
          <div style={{ fontSize: '15px', fontWeight: 800, color: C.textPrimary, marginBottom: '8px', letterSpacing: '-0.02em' }}>
            🔥 How streak multiplier works
          </div>
          <div style={{ fontSize: '13px', color: C.textMuted, lineHeight: 1.55, marginBottom: '12px' }}>
            Complete 3+ sessions every week to grow your multiplier. Each successful week = +×0.2 bonus, capped at ×3.0. Miss a week and it resets to ×1.0 — but your points stay!
          </div>
          {/* Multiplier ladder */}
          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
            {MULTIPLIERS.map((m, i) => {
              const isPast = i < multiplierIdx;
              const isCurrent = i === multiplierIdx;
              const isCap = m === 3.0;
              return (
                <div key={m} style={{
                  flexShrink: 0,
                  width: '40px', height: '40px',
                  borderRadius: '8px',
                  background: isCap ? C.goldTint : isCurrent ? C.primaryTint : isPast ? C.greenTint : '#FFFFFF',
                  border: `1.5px solid ${isCap ? C.goldBorder : isCurrent ? C.primary : isPast ? C.greenBorder : 'rgba(0,0,0,0.08)'}`,
                  color: isCap ? C.gold : isCurrent ? C.primary : isPast ? C.green : C.textFaint,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '10px', fontWeight: 700,
                  transform: isCurrent ? 'scale(1.12)' : 'scale(1)',
                  boxShadow: isCurrent ? `0 0 0 3px ${C.primaryTint}` : 'none',
                  transition: 'transform 0.2s',
                }}>
                  ×{m.toFixed(1)}
                </div>
              );
            })}
          </div>
        </div>

        {/* Session action area — hidden in partner view */}
        {!isPartner && (
          <div>
            {/* Section header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ fontSize: '18px', fontWeight: 800, color: C.textPrimary, letterSpacing: '-0.03em' }}>
                Today's session
              </div>
              {!activeSession && !sessionToday && (
                <div style={{ padding: '3px 10px', borderRadius: '999px', background: C.surface3, color: C.textMuted, fontSize: '11px', fontWeight: 700 }}>
                  No session
                </div>
              )}
              {activeSession && !checkoutReady && (
                <div style={{ padding: '3px 10px', borderRadius: '999px', background: C.primaryTint, border: `1px solid ${C.primaryBorder}`, color: C.primary, fontSize: '11px', fontWeight: 700 }}>
                  In progress · {timerMin}m
                </div>
              )}
              {activeSession && checkoutReady && (
                <div style={{ padding: '3px 10px', borderRadius: '999px', background: C.greenTint, border: `1px solid ${C.greenBorder}`, color: C.green, fontSize: '11px', fontWeight: 700 }}>
                  Ready to check out ✓
                </div>
              )}
              {sessionToday && !activeSession && (
                <div style={{ padding: '3px 10px', borderRadius: '999px', background: C.greenTint, border: `1px solid ${C.greenBorder}`, color: C.green, fontSize: '11px', fontWeight: 700 }}>
                  Done today ✓
                </div>
              )}
            </div>

            {/* Step 1: Check-in */}
            {!sessionToday && (
              <div style={{
                borderRadius: '8px',
                background: activeSession ? C.primaryTint : C.surface2,
                border: `${activeSession ? '1.5' : '1'}px solid ${activeSession ? C.primary : 'rgba(0,0,0,0.06)'}`,
                padding: '16px',
                marginBottom: '12px',
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '14px' }}>
                  <div style={{
                    width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
                    background: activeSession ? C.primary : C.surface3,
                    border: `1.5px solid ${activeSession ? C.primary : 'rgba(0,0,0,0.10)'}`,
                    color: activeSession ? '#FFF' : C.textMuted,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '13px', fontWeight: 800,
                  }}>
                    {activeSession ? '✓' : '1'}
                  </div>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: 800, color: C.textPrimary, marginBottom: '2px' }}>
                      Check-in photo 📸
                    </div>
                    <div style={{ fontSize: '12px', color: C.textMuted }}>
                      Selfie or gym equipment to prove you're there.
                    </div>
                  </div>
                </div>

                {!activeSession && (
                  <>
                    {/* Photo preview */}
                    <div
                      style={{
                        aspectRatio: '16/9', borderRadius: '8px', overflow: 'hidden',
                        background: C.surface3, border: '1.5px dashed rgba(110,164,187,0.40)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        marginBottom: '10px', cursor: 'pointer',
                      }}
                      onClick={() => checkInPreview && setLightbox(checkInPreview)}
                    >
                      {checkInPreview ? (
                        <img src={checkInPreview} alt="Check-in" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ textAlign: 'center', color: C.textFaint, fontSize: '13px' }}>📷 Upload check-in</div>
                      )}
                    </div>

                    {/* Upload btn */}
                    <button
                      onClick={() => checkInRef.current?.click()}
                      style={{
                        width: '100%', padding: '10px', borderRadius: '6px',
                        background: 'transparent', border: `1.5px dashed ${C.primary}`,
                        color: C.primary, fontSize: '13px', fontWeight: 600,
                        cursor: 'pointer', marginBottom: '10px',
                      }}
                    >
                      ↑ Choose photo
                    </button>
                    <input ref={checkInRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleCheckInFile} />

                    <button
                      onClick={handleCheckInSubmit}
                      style={{
                        width: '100%', height: '46px', borderRadius: '8px',
                        background: `linear-gradient(135deg, ${C.primary}, ${C.primaryDark})`,
                        border: 'none', color: '#FFF', fontSize: '15px', fontWeight: 700,
                        cursor: 'pointer', boxShadow: `0 4px 12px rgba(110,164,187,0.35)`,
                      }}
                    >
                      Check in now ✓
                    </button>
                    <div style={{ marginTop: '8px', fontSize: '11px', color: C.textFaint, textAlign: 'center' }}>
                      No check-in yet today.
                    </div>
                  </>
                )}

                {activeSession && (
                  <div style={{ fontSize: '12px', color: C.primary, fontWeight: 600, textAlign: 'center' }}>
                    ✓ Checked in at {new Date(activeSession.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    {activeSession.checkInPhoto && (
                      <div style={{ marginTop: '8px' }}>
                        <img
                          src={activeSession.checkInPhoto}
                          alt="Check-in"
                          style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover', borderRadius: '6px', cursor: 'pointer' }}
                          onClick={() => setLightbox(activeSession.checkInPhoto!)}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Check-out (only after check-in) */}
            <AnimatePresence>
              {activeSession && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.24, ease: 'easeOut' }}
                  style={{
                    borderRadius: '8px',
                    background: checkoutReady ? C.greenTint : C.primaryTint,
                    border: `1.5px solid ${checkoutReady ? C.green : C.primary}`,
                    padding: '16px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '14px' }}>
                    <div style={{
                      width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
                      background: checkoutReady ? C.green : C.primary,
                      border: `1.5px solid ${checkoutReady ? C.green : C.primary}`,
                      color: '#FFF',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '13px', fontWeight: 800,
                    }}>
                      2
                    </div>
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: 800, color: C.textPrimary, marginBottom: '2px' }}>
                        Check-out photo 📸
                      </div>
                      <div style={{ fontSize: '12px', color: C.textMuted }}>
                        Required after at least 1 hour
                      </div>
                    </div>
                  </div>

                  {/* Timer bar */}
                  <div style={{ marginBottom: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Time in gym</span>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: C.textMuted }}>{timerMin} / 60 min</span>
                    </div>
                    <div style={{ height: '6px', borderRadius: '999px', background: C.surface3, overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', borderRadius: '999px',
                        background: checkoutReady
                          ? `linear-gradient(90deg, ${C.green}, ${C.green})`
                          : `linear-gradient(90deg, ${C.primary}, ${C.green})`,
                        width: `${Math.min((timerMin / 60) * 100, 100)}%`,
                        transition: 'width 0.5s ease',
                      }} />
                    </div>
                  </div>

                  {/* Photo area */}
                  <div
                    style={{
                      aspectRatio: '16/9', borderRadius: '8px', overflow: 'hidden',
                      background: C.surface3, border: '1.5px dashed rgba(110,164,187,0.40)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      marginBottom: '10px', cursor: 'pointer',
                    }}
                    onClick={() => checkOutPreview && setLightbox(checkOutPreview)}
                  >
                    {checkOutPreview ? (
                      <img src={checkOutPreview} alt="Check-out" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ textAlign: 'center', color: C.textFaint, fontSize: '13px' }}>📷 Upload check-out</div>
                    )}
                  </div>

                  <button
                    onClick={() => checkOutRef.current?.click()}
                    style={{
                      width: '100%', padding: '10px', borderRadius: '6px',
                      background: 'transparent', border: `1.5px dashed ${checkoutReady ? C.green : C.primary}`,
                      color: checkoutReady ? C.green : C.primary, fontSize: '13px', fontWeight: 600,
                      cursor: 'pointer', marginBottom: '10px',
                    }}
                  >
                    ↑ Choose photo
                  </button>
                  <input ref={checkOutRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleCheckOutFile} />

                  <button
                    onClick={handleCheckOutSubmit}
                    disabled={!checkoutReady}
                    style={{
                      width: '100%', height: '46px', borderRadius: '8px',
                      background: checkoutReady
                        ? `linear-gradient(135deg, ${C.green}, #3d8055)`
                        : C.surface3,
                      border: 'none', color: checkoutReady ? '#FFF' : C.textFaint,
                      fontSize: '15px', fontWeight: 700,
                      cursor: checkoutReady ? 'pointer' : 'not-allowed',
                      boxShadow: checkoutReady ? `0 4px 12px rgba(90,158,110,0.35)` : 'none',
                      transition: 'all 0.2s',
                    }}
                  >
                    Complete session 🎉
                  </button>

                  <div style={{ marginTop: '8px', fontSize: '11px', color: C.textMuted, textAlign: 'center' }}>
                    {checkoutReady
                      ? 'Upload your check-out photo and finish!'
                      : `${timeRemaining} minutes remaining — keep going! 💪`}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightbox(null)}
            style={{
              position: 'fixed', inset: 0, zIndex: 100,
              background: 'rgba(0,0,0,0.88)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '20px',
            }}
          >
            <button
              onClick={() => setLightbox(null)}
              style={{
                position: 'absolute', top: '16px', right: '16px',
                width: '40px', height: '40px', borderRadius: '50%',
                background: 'rgba(255,255,255,0.15)', border: 'none',
                color: '#FFF', fontSize: '18px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              ✕
            </button>
            <img
              src={lightbox}
              alt="Full view"
              style={{ maxHeight: '90vh', maxWidth: '100%', borderRadius: '12px', objectFit: 'contain' }}
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
