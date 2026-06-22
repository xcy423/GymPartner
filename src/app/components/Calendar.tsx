import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CalendarDays, ChevronLeft, ChevronRight, X } from 'lucide-react';
import type { Session, UserData } from '../types';
import { PageHeader } from './PageHeader';

const C = {
  self: '#6EA4BB',
  partner: '#D4A843',
  selfTint: 'rgba(110,164,187,0.18)',
  partnerTint: 'rgba(212,168,67,0.28)',
  textPrimary: '#2A2D35',
  textMuted: '#6B7280',
  textFaint: '#B0B8C8',
  surface3: '#ECEEF5',
};

const DAY_LABELS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

interface Props {
  sessions: Session[];
  currentUser: UserData;
  partnerUser: UserData;
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1;
}

export function CalendarScreen({ sessions, currentUser, partnerUser }: Props) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [filter, setFilter] = useState<'self' | 'partner'>('self');
  const [lightbox, setLightbox] = useState<string | null>(null);

  const todayStr = today.toISOString().split('T')[0];
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const visibleUserIds = filter === 'self' ? [currentUser.username] : [partnerUser.username];

  const monthPrefix = `${year}-${String(month + 1).padStart(2, '0')}`;
  const visibleSessions = sessions
    .filter((s) => visibleUserIds.includes(s.userId) && s.date.startsWith(monthPrefix))
    .sort((a, b) => b.date.localeCompare(a.date));

  const sessionsByDate = useMemo(() => {
    const out: Record<string, Session[]> = {};
    for (const s of sessions) {
      if (!visibleUserIds.includes(s.userId)) continue;
      if (!out[s.date]) out[s.date] = [];
      out[s.date].push(s);
    }
    return out;
  }, [sessions, visibleUserIds]);

  const getDateStr = (d: number) => `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

  const prevMonth = () => {
    if (month === 0) {
      setYear((y) => y - 1);
      setMonth(11);
    } else setMonth((m) => m - 1);
  };

  const nextMonth = () => {
    if (month === 11) {
      setYear((y) => y + 1);
      setMonth(0);
    } else setMonth((m) => m + 1);
  };

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
        <div style={{ background: '#FFF', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.08)', padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <button onClick={prevMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.textMuted, padding: '4px 8px' }}><ChevronLeft size={18} /></button>
            <span style={{ fontSize: '15px', fontWeight: 800, color: C.textPrimary }}>{MONTH_NAMES[month]} {year}</span>
            <button onClick={nextMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.textMuted, padding: '4px 8px' }}><ChevronRight size={18} /></button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '4px' }}>
            {DAY_LABELS.map((d) => (
              <div key={d} style={{ textAlign: 'center', fontSize: '11px', fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.04em', padding: '4px 0' }}>{d}</div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
            {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => {
              const dateStr = getDateStr(d);
              const daySessions = sessionsByDate[dateStr] ?? [];
              const hasSelf = daySessions.some((s) => s.userId === currentUser.username);
              const hasPartner = daySessions.some((s) => s.userId === partnerUser.username);
              const isToday = dateStr === todayStr;

              let background = 'transparent';
              if (hasSelf && hasPartner) background = `linear-gradient(135deg, ${C.selfTint} 0 50%, ${C.partnerTint} 50% 100%)`;
              else if (hasSelf) background = C.selfTint;
              else if (hasPartner) background = C.partnerTint;

              const color = hasSelf ? C.self : hasPartner ? C.partner : C.textPrimary;
              const borderColor = hasSelf || hasPartner ? 'rgba(0,0,0,0.08)' : 'transparent';

              return (
                <div key={d} style={{ aspectRatio: '1', borderRadius: '8px', background, border: isToday ? `1.5px dashed ${C.self}` : `1px solid ${borderColor}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: isToday || hasSelf || hasPartner ? 700 : 400, color, boxShadow: isToday ? `inset 0 0 0 2px rgba(110,164,187,0.12)` : 'none' }}>{d}</div>
              );
            })}
          </div>

          <div style={{ display: 'flex', gap: '16px', marginTop: '14px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '10px', height: '10px', borderRadius: '50%', background: C.self }} /><span style={{ fontSize: '11px', color: C.textMuted, fontWeight: 600 }}>Me</span></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '10px', height: '10px', borderRadius: '50%', background: C.partner }} /><span style={{ fontSize: '11px', color: C.textMuted, fontWeight: 600 }}>{partnerUser.displayName}</span></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'linear-gradient(135deg, rgba(110,164,187,0.55) 0 50%, rgba(212,168,67,0.55) 50% 100%)' }} /><span style={{ fontSize: '11px', color: C.textMuted, fontWeight: 600 }}>{currentUser.displayName} & {partnerUser.displayName}</span></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '10px', height: '10px', borderRadius: '50%', border: `1.5px dashed ${C.self}` }} /><span style={{ fontSize: '11px', color: C.textMuted, fontWeight: 600 }}>Today</span></div>
          </div>
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', gap: '12px' }}>
            <div style={{ fontSize: '18px', lineHeight: '27px', fontWeight: 800, color: C.textPrimary, letterSpacing: '-0.03em' }}>Session history</div>
            <div style={{ borderRadius: '999px', border: '2px solid rgba(240,219,165,0.2)', background: 'rgba(240,219,165,0.2)', padding: '1px', overflow: 'clip', display: 'inline-flex', alignItems: 'center', gap: 0 }}>
              <button
                type="button"
                onClick={() => setFilter('self')}
                style={personPillStyle(filter === 'self', C.self, true)}
              >
                {currentUser.displayName}
              </button>
              <button
                type="button"
                onClick={() => setFilter('partner')}
                style={personPillStyle(filter === 'partner', C.partner, false)}
              >
                {partnerUser.displayName}
              </button>
            </div>
          </div>

          {visibleSessions.length === 0 && <div style={{ textAlign: 'center', padding: '32px 16px', color: C.textFaint, fontSize: '14px' }}>No sessions logged this month.</div>}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {visibleSessions.map((session) => {
              const sDate = new Date(session.date + 'T00:00:00');
              const dateLabel = sDate.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
              const durationMin = session.checkOutTime ? (() => {
                const [ih, im] = session.checkInTime.split(':').map(Number);
                const [oh, om] = session.checkOutTime.split(':').map(Number);
                return oh * 60 + om - (ih * 60 + im);
              })() : null;
              const userColor = session.userId === currentUser.username ? C.self : C.partner;
              const userName = session.userId === currentUser.username ? `${currentUser.displayName} (You)` : partnerUser.displayName;

              return (
                <motion.div key={session.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} style={{ background: '#FFF', borderRadius: '12px', border: `1px solid rgba(0,0,0,0.08)`, padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: C.textPrimary }}>{session.complete ? 'Complete session' : 'Partial session'}</div>
                    <div style={{ padding: '2px 8px', borderRadius: '999px', fontSize: '11px', fontWeight: 700, background: session.userId === currentUser.username ? C.selfTint : C.partnerTint, color: userColor, border: '1px solid rgba(0,0,0,0.08)' }}>{userName}</div>
                  </div>
                  <div style={{ fontSize: '11px', color: C.textMuted, marginBottom: '10px' }}>{dateLabel}</div>
                  <div style={{ display: 'flex', gap: '16px', marginBottom: '12px' }}>
                    <span style={{ fontSize: '11px', color: C.textMuted }}>In: <strong>{session.checkInTime}</strong></span>
                    {session.checkOutTime && <span style={{ fontSize: '11px', color: C.textMuted }}>Out: <strong>{session.checkOutTime}</strong></span>}
                    {durationMin !== null && durationMin > 0 && <span style={{ fontSize: '11px', color: C.textMuted }}><strong>{durationMin} min</strong></span>}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    {(['checkInPhoto', 'checkOutPhoto'] as const).map((key) => {
                      const photo = session[key];
                      const label = key === 'checkInPhoto' ? 'Check-in' : 'Check-out';
                      return (
                        <div key={key} style={{ aspectRatio: '4/3', borderRadius: '8px', background: C.surface3, border: '1px solid rgba(0,0,0,0.06)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: photo ? 'pointer' : 'default' }} onClick={() => photo && setLightbox(photo)}>
                          {photo ? <img src={photo} alt={label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: '11px', color: C.textFaint }}>{label}</span>}
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {lightbox && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setLightbox(null)} style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.88)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <button onClick={() => setLightbox(null)} style={{ position: 'absolute', top: '16px', right: '16px', width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)', border: 'none', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><X size={18} /></button>
            <img src={lightbox} alt="Full view" style={{ maxHeight: '90vh', maxWidth: '100%', borderRadius: '12px', objectFit: 'contain' }} onClick={(e) => e.stopPropagation()} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
