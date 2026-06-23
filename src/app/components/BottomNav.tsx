import type React from 'react';
import type { TabName } from '../types';
import { CalendarDays, Gift, Home, Settings } from 'lucide-react';

const C = {
  primary: '#6EA4BB',
  primaryTint: 'rgba(110,164,187,0.12)',
  textMuted: '#6B7280',
  textFaint: '#B0B8C8',
};

const TABS: { id: TabName; icon: React.ComponentType<{ size?: number }>; label: string }[] = [
  { id: 'home', icon: Home, label: 'Home' },
  { id: 'rewards', icon: Gift, label: 'Rewards' },
  { id: 'calendar', icon: CalendarDays, label: 'Calendar' },
  { id: 'settings', icon: Settings, label: 'Settings' },
];

interface Props {
  activeTab: TabName;
  onTabChange: (tab: TabName) => void;
}

export function BottomNav({ activeTab, onTabChange }: Props) {
  return (
    <div style={{
      position: 'fixed',
      bottom: '16px',
      left: '50%',
      transform: 'translateX(-50%)',
      width: 'calc(100% - 32px)',
      maxWidth: '420px',
      borderRadius: '16px',
      padding: '6px',
      background: 'rgba(255,255,255,0.88)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      border: '1px solid rgba(0,0,0,0.10)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08)',
      display: 'flex',
      gap: '4px',
      zIndex: 80,
    }}>
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            style={{
              flex: 1,
              height: '52px',
              borderRadius: '12px',
              border: 'none',
              background: isActive ? C.primaryTint : 'transparent',
              color: isActive ? C.primary : C.textFaint,
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '3px',
              transition: 'all 0.15s',
              outline: 'none',
            }}
          >
            <Icon size={18} />
            <span style={{
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              lineHeight: 1,
            }}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
