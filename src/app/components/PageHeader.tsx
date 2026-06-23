import type { ReactNode } from 'react';

interface Props {
  title: ReactNode;
  subtitle: string;
  rightSlot?: ReactNode;
}

export function PageHeader({ title, subtitle, rightSlot }: Props) {
  return (
    <div
      style={{
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
      }}
    >
      <div>
        <div style={{ fontSize: '20px', fontWeight: 900, color: '#2A2D35', letterSpacing: '-0.05em' }}>{title}</div>
        <div style={{ fontSize: '13px', color: '#6B7280' }}>{subtitle}</div>
      </div>
      {rightSlot ? rightSlot : null}
    </div>
  );
}
