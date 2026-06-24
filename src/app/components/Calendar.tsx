import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { Session, UserData } from '../App';

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
  userId: string;
  viewUser: UserData;
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1; // 0=Mon...6=Sun
}

export function CalendarScreen({ sessions, userId, viewUser }: Props) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [lightbox, setLightbox] = useState<string | null>(null);

  const todayStr = today.toISOString().split('T')[0];
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const sessionsByDate: Record<string, Session[]> = {};
  sessions.forEach((s) => {
    if (s.userId === userId) {
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

  const monthSessions = sessions.filter((s) => {
    const mStr = `${year}-${String(month + 1).padStart(2, '0')}`;
    return s.userId === userId && s.date.startsWith(mStr);
  }).sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div style={{ padding: '0 16px 96px' }}>
      {/* Topbar */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        borderBottom: '1px solid rgba(0,0,0,0.07)',
        padding: '12px 16px', margin: '0 -16px',
      }}>
        <div style={{ fontSize: '28px', fontWeight: 900, color: C.textPrimary, letterSpacing: '-0.05em' }}>
          📅 {MONTH_NAMES[month]} {year}
        </div>
        <div style={{ fontSize: '13px', color: C.textMuted }}>
          {viewUser.displayName}'s gym session history.
        </div>
      </div>

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
            >‹</button>
            <span style={{ fontSize: '15px', fontWeight: 800, color: C.textPrimary }}>
              {MONTH_NAMES[month]} {year}
            </span>
            <button
              onClick={nextMonth}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.textMuted, fontSize: '18px', padding: '4px 8px' }}
            >›</button>
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
              const state = getDayState(d);
              const isToday = getDateStr(d) === todayStr;
              const bg =
                state === 'complete' ? C.greenTint :
                state === 'partial' ? C.warnTint :
                'transparent';
              const borderColor =
                state === 'complete' ? 'rgba(90,158,110,0.25)' :
                state === 'partial' ? 'rgba(212,133,74,0.25)' :
                'transparent';
              const color =
                state === 'complete' ? C.green :
                state === 'partial' ? C.warn :
                C.textPrimary;

              return (
                <div
                  key={d}
                  style={{
                    aspectRatio: '1',
                    borderRadius: '8px',
                    background: bg,
                    border: isToday ? `1.5px dashed ${C.primary}` : `1px solid ${borderColor}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '12px', fontWeight: isToday || state !== 'empty' ? 700 : 400,
                    color,
                    position: 'relative',
                    boxShadow: isToday ? `inset 0 0 0 2px ${C.primaryTint}` : 'none',
                  }}
                >
                  {d}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', gap: '16px', marginTop: '14px', flexWrap: 'wrap' }}>
            {[
              { color: C.green, label: 'Full session', type: 'fill' },
              { color: C.warn, label: 'Partial', type: 'fill' },
              { color: C.primary, label: 'Today', type: 'dashed' },
            ].map((item) => (
              <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {item.type === 'dashed' ? (
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', border: `1.5px dashed ${item.color}` }} />
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
          <div style={{ fontSize: '18px', fontWeight: 800, color: C.textPrimary, letterSpacing: '-0.03em', marginBottom: '12px' }}>
            Session history
          </div>

          {monthSessions.length === 0 && (
            <div style={{ textAlign: 'center', padding: '32px 16px', color: C.textFaint, fontSize: '14px' }}>
              No sessions logged this month.
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {monthSessions.map((session) => {
              const sDate = new Date(session.date + 'T00:00:00');
              const dateLabel = sDate.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
              const durationMin = session.checkOutTime
                ? (() => {
                    const [ih, im] = session.checkInTime.split(':').map(Number);
                    const [oh, om] = session.checkOutTime.split(':').map(Number);
                    return (oh * 60 + om) - (ih * 60 + im);
                  })()
                : null;

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
                      {session.complete ? '✅ Complete session' : '⏳ Partial session'}
                    </div>
                    <div style={{
                      padding: '2px 8px', borderRadius: '999px', fontSize: '11px', fontWeight: 700,
                      background: session.complete ? C.greenTint : C.warnTint,
                      color: session.complete ? C.green : C.warn,
                      border: `1px solid ${session.complete ? C.greenBorder : C.warnBorder}`,
                    }}>
                      {session.complete ? 'Done' : 'Partial'}
                    </div>
                  </div>
                  <div style={{ fontSize: '11px', color: C.textMuted, marginBottom: '10px' }}>{dateLabel}</div>

                  {/* Times */}
                  <div style={{ display: 'flex', gap: '16px', marginBottom: '12px' }}>
                    <span style={{ fontSize: '11px', color: C.textMuted }}>In: <strong>{session.checkInTime}</strong></span>
                    {session.checkOutTime && (
                      <span style={{ fontSize: '11px', color: C.textMuted }}>Out: <strong>{session.checkOutTime}</strong></span>
                    )}
                    {durationMin !== null && durationMin > 0 && (
                      <span style={{ fontSize: '11px', color: C.textMuted }}><strong>{durationMin} min</strong></span>
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
            >✕</button>
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
