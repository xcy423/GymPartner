import { useState } from 'react';
import { DoorOpen, Dumbbell, Settings } from 'lucide-react';
import type { UserData } from '../types';
import { PageHeader } from './PageHeader';

const C = {
  primary: '#6EA4BB',
  primaryDark: '#4E8BA3',
  primaryTint: 'rgba(110,164,187,0.12)',
  primaryBorder: 'rgba(110,164,187,0.35)',
  red: '#C04C4B',
  redTint: 'rgba(192,76,75,0.10)',
  redBorder: 'rgba(192,76,75,0.30)',
  surface2: '#F3F4F8',
  surface3: '#ECEEF5',
  textPrimary: '#2A2D35',
  textMuted: '#6B7280',
  textFaint: '#B0B8C8',
};

interface Props {
  user: UserData;
  onSaveSettings: (displayName: string, weekMode: 'fixed' | 'rolling', approvalCode: string) => void;
  onLogout: () => void;
}

export function SettingsScreen({ user, onSaveSettings, onLogout }: Props) {
  const [displayName, setDisplayName] = useState(user.displayName);
  const [weekMode, setWeekMode] = useState<'fixed' | 'rolling'>(user.weekMode);
  const [approvalCode, setApprovalCode] = useState(user.approvalCode);

  const [nameFocus, setNameFocus] = useState(false);
  const [codeFocus, setCodeFocus] = useState(false);

  const inputStyle = (focused: boolean): React.CSSProperties => ({
    width: '100%', height: '46px', borderRadius: '6px',
    background: C.surface2,
    border: `1.5px solid ${focused ? C.primary : 'rgba(110,164,187,0.20)'}`,
    boxShadow: focused ? `0 0 0 4px ${C.primaryTint}` : 'none',
    padding: '0 14px', fontSize: '14px', color: C.textPrimary,
    outline: 'none', transition: 'border-color 0.15s, box-shadow 0.15s',
    boxSizing: 'border-box',
  });

  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '11px', fontWeight: 700,
    letterSpacing: '0.05em', color: C.textMuted,
    textTransform: 'uppercase', marginBottom: '6px',
  };

  return (
    <div style={{ padding: '0 16px 96px' }}>
      <PageHeader
        title={
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            Settings
            <Settings size={22} />
          </span>
        }
        subtitle="Manage your account."
      />

      <div style={{ paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>

        {/* Account settings card */}
        <div style={{
          background: '#FFF', borderRadius: '8px',
          border: '1px solid rgba(0,0,0,0.06)', padding: '16px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
        }}>
          <label style={labelStyle}>Account</label>

          {/* Display name */}
          <div style={{ marginBottom: '14px' }}>
            <label style={{ ...labelStyle, marginBottom: '6px' }}>Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              onFocus={() => setNameFocus(true)}
              onBlur={() => setNameFocus(false)}
              style={inputStyle(nameFocus)}
            />
          </div>

          {/* Week counting */}
          <div style={{ marginBottom: '14px' }}>
            <label style={{ ...labelStyle, marginBottom: '6px' }}>Week Counting</label>
            <select
              value={weekMode}
              onChange={(e) => setWeekMode(e.target.value as 'fixed' | 'rolling')}
              style={{
                ...inputStyle(false),
                appearance: 'none', cursor: 'pointer',
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236B7280' d='M6 8L1 3h10L6 8z'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'calc(100% - 14px) center',
                paddingRight: '36px',
              }}
            >
              <option value="fixed">Mon–Sun fixed</option>
              <option value="rolling">Rolling 7 days</option>
            </select>
          </div>

          {/* Approval code */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ ...labelStyle, marginBottom: '6px' }}>Approval Code (for vouchers)</label>
            <input
              type="password"
              value={approvalCode}
              onChange={(e) => setApprovalCode(e.target.value)}
              onFocus={() => setCodeFocus(true)}
              onBlur={() => setCodeFocus(false)}
              style={inputStyle(codeFocus)}
            />
          </div>

          <button
            onClick={() => onSaveSettings(displayName, weekMode, approvalCode)}
            style={{
              width: '100%', height: '46px', borderRadius: '8px',
              background: `linear-gradient(135deg, ${C.primary}, ${C.primaryDark})`,
              border: 'none', color: '#FFF', fontSize: '14px', fontWeight: 700,
              cursor: 'pointer', boxShadow: `0 4px 12px rgba(110,164,187,0.35)`,
            }}
          >
            Save settings
          </button>
        </div>

        {/* Account info */}
        <div style={{
          background: C.surface2, borderRadius: '8px',
          border: '1px solid rgba(0,0,0,0.06)', padding: '14px 16px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: C.textPrimary }}>Signed in as</div>
            <div style={{ fontSize: '12px', color: C.textMuted }}>@{user.username}</div>
          </div>
          <div style={{
            width: '36px', height: '36px', borderRadius: '50%',
            background: C.primaryTint, border: `1px solid ${C.primaryBorder}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Dumbbell size={16} color={C.primaryDark} />
          </div>
        </div>

        {/* Sign out */}
        <button
          onClick={onLogout}
          style={{
            width: '100%', height: '48px', borderRadius: '8px',
            background: C.redTint, border: `1.5px solid ${C.redBorder}`,
            color: C.red, fontSize: '14px', fontWeight: 700,
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: '8px', transition: 'opacity 0.15s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.8')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
        >
          <DoorOpen size={16} /> Sign out
        </button>
      </div>
    </div>
  );
}
