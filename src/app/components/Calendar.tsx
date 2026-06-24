import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CalendarDays, CheckCircle2, ChevronLeft, ChevronRight, Clock3, Heart, X } from 'lucide-react';
import type { Session, UserData } from '../types';
import { PageHeader } from './PageHeader';

const C = {
  primary: '#6EA4BB',
  primaryTint: 'rgba(110,164,187,0.12)',
  primaryBorder: 'rgba(110,164,187,0.35)',
  gold: '#D4A843',
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

const DAY_LABELS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];

interface Props {
  sessions: Session[];
  currentUser: UserData;
  partnerUser: UserData;
}

function ownerId(user: UserData): string {
  return user.id ?? user.username;
}

function localDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1; // 0=Mon...6=Sun
}

function BothGymBadge() {
  return (
    <span
      style={{
        width: '12px',
        height: '12px',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        lineHeight: 0,
      }}
      aria-label="Both went gym"
      title="Both went gym"
    >
      <Heart size={20} color="#A84D4B" fill="#F1C7C6" strokeWidth={1} />
    </span>
  );
}

function BothGymDayCell({ day }: { day: number }) {
  return (
    <span
      style={{
        width: '100%',
        height: '100%',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}
      aria-label="Both went gym"
      title="Both went gym"
    >
      <Heart size={44} color="#A84D4B" fill="#F1C7C6" strokeWidth={1} style={{ width: '88%', height: '88%' }} />
      <span
        style={{
          position: 'absolute',
          fontSize: '12px',
          lineHeight: '18px',
          fontWeight: 700,
          color: '#C04C4B',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -42%)',
        }}
      >
        {day}
      </span>
    </span>
  );
}

export function CalendarScreen({ sessions, currentUser, partnerUser }: Props) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [historyFilter, setHistoryFilter] = useState<'self' | 'partner'>('self');
  const [lightbox, setLightbox] = useState<string | null>(null);

  const todayStr = localDateString(today);
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const sessionsByDate: Record<string, Session[]> = {};
  sessions.forEach((s) => {
    if (s.userId === ownerId(currentUser) || s.userId === ownerId(partnerUser)) {
      if (!sessionsByDate[s.date]) sessionsByDate[s.date] = [];
      sessionsByDate[s.date].push(s);
    }
  });

  const getDateStr = (d: number) => {
    const m = String(month + 1).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    return `${year}-${m}-${dd}`;
  };

  const getDayState = (d: number): 'empty' | 'complete' | 'partial' | 'today' => {
    const dateStr = getDateStr(d);
    const isToday = dateStr === todayStr;
    const daySessions = sessionsByDate[dateStr] ?? [];
    if (daySessions.length === 0) return isToday ? 'today' : 'empty';
    const hasComplete = daySessions.some((s) => s.complete);
    if (hasComplete) return 'complete';
    return 'partial';
  };

  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
  };

  const historySessions = sessions
    .filter((s) => {
      const owner = historyFilter === 'self' ? ownerId(currentUser) : ownerId(partnerUser);
      return s.userId === owner;
    })
    .sort((a, b) => {
      const aTime = a.checkOutTime ?? a.checkInTime;
      const bTime = b.checkOutTime ?? b.checkInTime;
      return b.date.localeCompare(a.date) || bTime.localeCompare(aTime);
    });

  const personPillStyle = (active: boolean, color: string, isLeft: boolean): React.CSSProperties => ({
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
    marginRight: isLeft && active ? '-6px' : 0,
  });

  return (
    <div style={{ padding: '0 16px 96px' }}>
      <PageHeader
        title={
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <CalendarDays size={22} />
            {MONTH_NAMES[month]} {year}
          </span>
        }
        subtitle="Shared gym session history."
      />

      <div style={{ paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Calendar card */}
        <div style={{
          background: '#FFF', borderRadius: '12px',
          border: '1px solid rgba(0,0,0,0.08)',
          padding: '16px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        }}>
          {/* Month nav */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <button
              onClick={prevMonth}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.textMuted, fontSize: '18px', padding: '4px 8px' }}
            ><ChevronLeft size={18} /></button>
            <span style={{ fontSize: '15px', fontWeight: 800, color: C.textPrimary }}>
              {MONTH_NAMES[month]} {year}
            </span>
            <button
              onClick={nextMonth}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.textMuted, fontSize: '18px', padding: '4px 8px' }}
            ><ChevronRight size={18} /></button>
          </div>

          {/* Day header */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '4px' }}>
            {DAY_LABELS.map((d) => (
              <div key={d} style={{ textAlign: 'center', fontSize: '11px', fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.04em', padding: '4px 0' }}>
                {d}
              </div>
            ))}
          </div>

          {/* Day grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
            {/* Empty cells before first day */}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {/* Day cells */}
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => {
              const dateStr = getDateStr(d);
              const daySessions = sessionsByDate[dateStr] ?? [];
              const hasSelf = daySessions.some((s) => s.userId === ownerId(currentUser));
              const hasPartner = daySessions.some((s) => s.userId === ownerId(partnerUser));
              const isToday = dateStr === todayStr;
              const bothWentGym = hasSelf && hasPartner;
              const bg = bothWentGym
                ? `linear-gradient(135deg, ${C.primaryTint} 0 50%, rgba(212,168,67,0.28) 50% 100%)`
                : hasSelf
                ? C.primaryTint
                : hasPartner
                ? 'rgba(212,168,67,0.28)'
                : 'transparent';
              const borderColor =
                hasSelf || hasPartner ? 'rgba(0,0,0,0.08)' :
                'transparent';
              const color = hasSelf ? C.primary : hasPartner ? C.gold : C.textPrimary;

              return (
                <div
                  key={d}
                  style={{
                    aspectRatio: '1',
                    borderRadius: '8px',
                    background: bothWentGym ? 'transparent' : bg,
                    border: bothWentGym ? '1px solid rgba(0,0,0,0)' : isToday ? `1.5px dashed ${C.primary}` : `1px solid ${borderColor}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '12px', fontWeight: isToday || hasSelf || hasPartner ? 700 : 400,
                    color,
                    position: 'relative',
                    boxShadow: isToday ? `inset 0 0 0 2px ${C.primaryTint}` : 'none',
                  }}
                >
                  {bothWentGym ? <BothGymDayCell day={d} /> : d}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', gap: '16px', marginTop: '14px', flexWrap: 'wrap' }}>
            {[
              { color: C.primary, label: currentUser.displayName, type: 'fill' },
              { color: C.gold, label: partnerUser.displayName, type: 'fill' },
              { color: C.primary, label: 'Today', type: 'dashed' },
              { color: '#C04C4B', label: 'Both went gym', type: 'heart' },
            ].map((item) => (
              <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {item.type === 'dashed' ? (
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', border: `1.5px dashed ${item.color}` }} />
                ) : item.type === 'heart' ? (
                  <BothGymBadge />
                ) : (
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: item.color, opacity: 0.7 }} />
                )}
                <span style={{ fontSize: '11px', color: C.textMuted, fontWeight: 600 }}>{item.label}</span>
              </div>
            ))}
          </div>

        </div>

        {/* Session history list */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '12px' }}>
            <div style={{ fontSize: '18px', lineHeight: '27px', fontWeight: 800, color: C.textPrimary, letterSpacing: '-0.03em' }}>
              Session history
            </div>
            <div style={{ borderRadius: '999px', border: '2px solid rgba(240,219,165,0.2)', background: 'rgba(240,219,165,0.2)', padding: '1px', overflow: 'clip', display: 'inline-flex', alignItems: 'center', gap: 0 }}>
              <button type="button" onClick={() => setHistoryFilter('self')} style={personPillStyle(historyFilter === 'self', C.primary, true)}>
                {currentUser.displayName}
              </button>
              <button type="button" onClick={() => setHistoryFilter('partner')} style={personPillStyle(historyFilter === 'partner', C.gold, false)}>
                {partnerUser.displayName}
              </button>
            </div>
          </div>

          {historySessions.length === 0 && (
            <div style={{ textAlign: 'center', padding: '32px 16px', color: C.textFaint, fontSize: '14px' }}>
              No sessions yet for {historyFilter === 'self' ? currentUser.displayName : partnerUser.displayName}.
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {historySessions.map((session) => {
              const sDate = new Date(session.date + 'T00:00:00');
              const dateLabel = sDate.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
              const durationMin =
                session.durationMins ??
                (session.checkOutTime
                  ? (() => {
                      const [ih, im] = session.checkInTime.split(':').map(Number);
                      const [oh, om] = session.checkOutTime.split(':').map(Number);
                      return oh * 60 + om - (ih * 60 + im);
                    })()
                  : null);
              const isSelfSession = session.userId === ownerId(currentUser);

              return (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    background: '#FFF', borderRadius: '12px',
                    border: `1px solid ${session.complete ? 'rgba(90,158,110,0.20)' : 'rgba(212,133,74,0.20)'}`,
                    padding: '16px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  }}
                >
                  {/* Header row */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: C.textPrimary }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          {session.complete ? <CheckCircle2 size={14} /> : <Clock3 size={14} />}
                          {session.complete ? 'Complete session' : 'Partial session'}
                        </span>
                    </div>
                    <div style={{
                      padding: '2px 8px', borderRadius: '999px', fontSize: '11px', fontWeight: 700,
                      background: isSelfSession ? C.primaryTint : 'rgba(212,168,67,0.14)',
                      color: isSelfSession ? C.primary : C.gold,
                      border: `1px solid ${isSelfSession ? C.primaryBorder : 'rgba(212,168,67,0.35)'}`,
                    }}>
                      {isSelfSession ? `${currentUser.displayName} (You)` : partnerUser.displayName}
                    </div>
                  </div>
                  <div style={{ fontSize: '11px', color: C.textMuted, marginBottom: '10px' }}>{dateLabel}</div>

                  {/* Times */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '12px', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', color: C.textMuted }}>In: <strong>{session.checkInTime}</strong></span>
                    {session.checkOutTime && (
                      <span style={{ fontSize: '11px', color: C.textMuted }}>Out: <strong>{session.checkOutTime}</strong></span>
                    )}
                    {durationMin !== null && durationMin > 0 && (
                      <span style={{ fontSize: '11px', color: C.textMuted }}><strong>{durationMin} min</strong></span>
                    )}
                    {session.earnedPts > 0 && (
                      <span style={{ fontSize: '11px', fontWeight: 700, color: C.green }}>+{session.earnedPts} pts</span>
                    )}
                  </div>

                  {/* Photo thumbnails */}
                  {(session.checkInPhoto || session.checkOutPhoto) && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      {(['checkInPhoto', 'checkOutPhoto'] as const).map((key) => {
                        const photo = session[key];
                        const label = key === 'checkInPhoto' ? 'Check-in' : 'Check-out';
                        return (
                          <div
                            key={key}
                            style={{
                              aspectRatio: '4/3', borderRadius: '8px',
                              background: C.surface3, border: '1px solid rgba(0,0,0,0.06)',
                              overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
                              cursor: photo ? 'pointer' : 'default',
                            }}
                            onClick={() => photo && setLightbox(photo)}
                          >
                            {photo ? (
                              <img src={photo} alt={label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              <span style={{ fontSize: '11px', color: C.textFaint }}>{label}</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* No photos: show placeholder grid */}
                  {!session.checkInPhoto && !session.checkOutPhoto && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      {['Check-in', 'Check-out'].map((label) => (
                        <div
                          key={label}
                          style={{
                            aspectRatio: '4/3', borderRadius: '8px',
                            background: C.surface3, border: '1px solid rgba(0,0,0,0.06)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}
                        >
                          <span style={{ fontSize: '11px', color: C.textFaint }}>{label}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
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
            ><X size={18} /></button>
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
