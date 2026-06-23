import { useState } from 'react';
import { Dumbbell, Sparkles } from 'lucide-react';

const C = {
  primary: '#6EA4BB',
  primaryDark: '#4E8BA3',
  primaryTint: 'rgba(110,164,187,0.12)',
  primaryBorder: 'rgba(110,164,187,0.35)',
  gold: '#D4A843',
  goldTint: 'rgba(212,168,67,0.12)',
  surface2: '#F3F4F8',
  textPrimary: '#2A2D35',
  textMuted: '#6B7280',
};

interface Props {
  onLogin: (username: string, password: string) => Promise<boolean>;
}

export function Login({ onLogin }: Props) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userFocus, setUserFocus] = useState(false);
  const [passFocus, setPassFocus] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setError('');
    setIsSubmitting(true);
    const ok = await onLogin(username.trim(), password);
    setIsSubmitting(false);
    if (!ok) setError('Invalid username or password. Try again.');
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
      background: '#F8F8FB',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '380px',
        background: '#FFFFFF',
        borderRadius: '16px',
        padding: '32px 24px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
        border: '1px solid rgba(0,0,0,0.06)',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '16px',
            background: `linear-gradient(135deg, ${C.primaryTint}, ${C.goldTint})`,
            border: `1px solid ${C.primaryBorder}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '12px',
          }}>
            <Dumbbell size={24} color={C.primaryDark} />
          </div>
          <div style={{ fontSize: '20px', fontWeight: 900, color: C.textPrimary, letterSpacing: '-0.05em', marginBottom: '4px' }}>
            GymPact
          </div>
          <div style={{ fontSize: '14px', color: C.textMuted, textAlign: 'center' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              Your private gym accountability and rewards app
              <Sparkles size={14} color={C.gold} />
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Username */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.05em',
              color: C.textMuted,
              textTransform: 'uppercase',
              marginBottom: '6px',
            }}>
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="codee or owen"
              disabled={isSubmitting}
              onFocus={() => setUserFocus(true)}
              onBlur={() => setUserFocus(false)}
              autoComplete="username"
              style={{
                width: '100%',
                height: '50px',
                borderRadius: '6px',
                background: C.surface2,
                border: `1.5px solid ${userFocus ? C.primary : 'rgba(110,164,187,0.20)'}`,
                boxShadow: userFocus ? `0 0 0 4px ${C.primaryTint}` : 'none',
                padding: '0 14px',
                fontSize: '15px',
                color: C.textPrimary,
                outline: 'none',
                transition: 'border-color 0.15s, box-shadow 0.15s',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.05em',
              color: C.textMuted,
              textTransform: 'uppercase',
              marginBottom: '6px',
            }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
              disabled={isSubmitting}
              onFocus={() => setPassFocus(true)}
              onBlur={() => setPassFocus(false)}
              autoComplete="current-password"
              style={{
                width: '100%',
                height: '50px',
                borderRadius: '6px',
                background: C.surface2,
                border: `1.5px solid ${passFocus ? C.primary : 'rgba(110,164,187,0.20)'}`,
                boxShadow: passFocus ? `0 0 0 4px ${C.primaryTint}` : 'none',
                padding: '0 14px',
                fontSize: '15px',
                color: C.textPrimary,
                outline: 'none',
                transition: 'border-color 0.15s, box-shadow 0.15s',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {error && (
            <div style={{
              marginBottom: '16px',
              padding: '10px 14px',
              borderRadius: '8px',
              background: 'rgba(192,76,75,0.10)',
              border: '1px solid rgba(192,76,75,0.30)',
              color: '#C04C4B',
              fontSize: '13px',
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              width: '100%',
              height: '50px',
              borderRadius: '999px',
              background: `linear-gradient(135deg, ${C.primary}, ${C.primaryDark})`,
              border: 'none',
              color: '#FFFFFF',
              fontSize: '15px',
              fontWeight: 700,
              cursor: isSubmitting ? 'wait' : 'pointer',
              letterSpacing: '0.01em',
              transition: 'opacity 0.15s, transform 0.1s',
              boxShadow: `0 4px 16px rgba(110,164,187,0.40)`,
              opacity: isSubmitting ? 0.75 : 1,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
            {isSubmitting ? 'Signing in...' : 'Sign in ΓåÆ'}
          </button>
        </form>
      </div>
    </div>
  );
}
