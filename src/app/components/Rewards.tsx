import { useMemo, useRef, useState } from 'react';
import { ArrowLeft, Clock3, Filter, Gift } from 'lucide-react';
import type { RewardRequest, UserData } from '../types';

const C = {
  primary: '#6EA4BB',
  primaryTint: 'rgba(110,164,187,0.12)',
  primaryTintStrong: 'rgba(110,164,187,0.20)',
  primaryBorder: 'rgba(110,164,187,0.35)',
  gold: '#D4A843',
  goldDark: '#B88E2F',
  goldTint: 'rgba(212,168,67,0.12)',
  goldBorder: 'rgba(212,168,67,0.35)',
  green: '#5A9E6E',
  greenDark: '#3D8055',
  greenTint: 'rgba(90,158,110,0.12)',
  greenBorder: 'rgba(90,158,110,0.30)',
  warn: '#D4854A',
  warnTint: 'rgba(212,133,74,0.12)',
  warnBorder: 'rgba(212,133,74,0.35)',
  surface3: '#ECEEF5',
  cardShadow: '0 6px 18px rgba(36, 52, 76, 0.08)',
  textPrimary: '#2A2D35',
  textMuted: '#6B7280',
  textFaint: '#B0B8C8',
};

type RewardItem = {
  id: string;
  emoji: string;
  name: string;
  desc: string;
  cost: number;
};

const REWARDS: RewardItem[] = [
  { id: 'letter', emoji: '💌', name: 'Handwritten letter', desc: 'A heartfelt handwritten letter from your partner.', cost: 200 },
  { id: 'meal', emoji: '🍳', name: 'Home-cooked meal', desc: 'A custom home meal prepared by your partner.', cost: 1000 },
  { id: 'wish', emoji: '⭐', name: 'Custom wish', desc: 'A custom reward of your choice from your partner.', cost: 2000 },
];

interface Props {
  currentUser: UserData;
  partnerUser: UserData;
  rewardRequests: RewardRequest[];
  onRequestReward: (id: string, name: string, cost: number) => void;
  onApproveReward: (requestId: string, approvalCode: string) => boolean;
}

function formatPts(value: unknown): string {
  const n = typeof value === 'number' && Number.isFinite(value) ? value : 0;
  return n.toLocaleString();
}

function safeCost(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

function formatTicketDate(value?: string): string {
  if (!value) return 'Unknown time';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Unknown time';
  return date.toLocaleString([], {
    month: 'short',
  if (status === 'used') {
    return { bg: C.surface3, border: 'rgba(0,0,0,0.08)', color: C.textMuted, label: 'Used' };
    export function Rewards({ currentUser, partnerUser, rewardRequests, onRequestReward, onApproveReward }: Props) {
      const [view, setView] = useState<'rewards' | 'tickets'>('rewards');
}
      const [confirmRewardId, setConfirmRewardId] = useState<string | null>(null);
      const approvalCardRef = useRef<HTMLDivElement | null>(null);
  const [approvalCode, setApprovalCode] = useState('');
      const myRequests = rewardRequests.filter((r) => r.requesterId === currentUser.username);
    window.scrollTo({ top: 0, behavior: 'auto' });
  };
      const myPendingCount = myRequests.filter((r) => r.status === 'pending').length;

      const myApprovedTickets = myRequests
        .filter((r) => r.status === 'approved')
        .slice()
        .sort((a, b) => new Date(b.approvedAt ?? b.requestedAt ?? 0).getTime() - new Date(a.approvedAt ?? a.requestedAt ?? 0).getTime());

  const myRequests = rewardRequests.filter((r) => r.requesterId === currentUser.username);
  const partnerPendingRequests = rewardRequests.filter((r) => r.requesterId === partnerUser.username && r.status === 'pending');
        for (const req of myRequests.slice().sort((a, b) => new Date(b.requestedAt ?? 0).getTime() - new Date(a.requestedAt ?? 0).getTime())) {

  const requestByRewardId = useMemo(() => {
    const map = new Map<string, RewardRequest>();
        map.set(req.rewardId, req);
      }
      if (existing.status === 'approved' && req.status === 'pending') {
        map.set(req.rewardId, req);
      }
      const confirmReward = confirmRewardId ? REWARDS.find((r) => r.id === confirmRewardId) ?? null : null;

      const topBar = (
        <div
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 30,
            margin: '0 -20px',
            padding: '12px 20px',
            borderBottom: '1px solid rgba(0,0,0,0.07)',
            background: 'rgba(255,255,255,0.96)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
              {view === 'tickets' && (
                <button
                  type="button"
                  onClick={() => setView('rewards')}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    border: '1px solid rgba(0,0,0,0.08)',
                    background: '#FFFFFF',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    flexShrink: 0,
                  }}
                  aria-label="Back to rewards"
                >
                  <ArrowLeft size={16} color={C.textPrimary} />
                </button>
              )}
              <div style={{ fontSize: '20px', lineHeight: '30px', fontWeight: 900, letterSpacing: '-0.05em', color: C.textPrimary }}>
                {view === 'tickets' ? 'My Tickets' : 'Rewards'}
              </div>
              {view === 'rewards' && (
                <div style={{ borderRadius: '999px', border: `1px solid ${C.goldBorder}`, background: C.goldTint, padding: '5px 11px', whiteSpace: 'nowrap' }}>
                  <div style={{ fontSize: '13px', lineHeight: '19.5px', fontWeight: 700, color: C.gold }}>{formatPts(currentUser.points)} pts</div>
                </div>
              )}
            </div>

            {view === 'rewards' && (
              <button
                type="button"
                onClick={() => setView('tickets')}
                style={{
                  height: '32px',
                  borderRadius: '8px',
                  border: `1px solid ${C.primaryBorder}`,
                  background: C.primaryTintStrong,
                  padding: '0 10px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  flexShrink: 0,
                  cursor: 'pointer',
                }}
                aria-label="Open all redeemed rewards"
              >
                <span style={{ fontSize: '12px', lineHeight: '24px', fontWeight: 700, color: C.primary }}>All</span>
                <Filter size={15} color={C.primary} />
              </button>
            )}
          </div>
        </div>
      );

  const stopCardOpen = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
          {topBar}

          {view === 'rewards' && (
            <div style={{ paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button
                type="button"
                onClick={() => approvalCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                style={{
                  width: '100%',
                  borderRadius: '12px',
                  border: `1px solid ${C.primaryBorder}`,
                  background: 'linear-gradient(110deg, rgba(110,164,187,0.22) 0%, #FFFFFF 78%)',
                  color: C.primary,
                  fontWeight: 800,
                  fontSize: '15px',
                  lineHeight: '22px',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 16px',
                }}
              >
                <span>Reward Pending Requests ({partnerPendingRequests.length})</span>
                <span style={{ fontSize: '12px', fontWeight: 700 }}>Tap to review</span>
              </button>

              {REWARDS.map((reward) => {
                const request = requestByRewardId.get(reward.id);
                const points = safeCost(currentUser.points);
                const progress = Math.min((points / reward.cost) * 100, 100);
                const pending = request?.status === 'pending';
                const unlocked = points >= reward.cost;
                const needMore = Math.max(0, reward.cost - points);

                return (
                  <div
                    key={reward.id}
                    style={{
                      borderRadius: '12px',
                      background: '#FFFFFF',
                      border: '1px solid rgba(0,0,0,0.08)',
                      boxShadow: C.cardShadow,
                      padding: '14px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                      <div
                        style={{
                          width: '44px',
                          height: '44px',
                          borderRadius: '10px',
                          background: C.goldTint,
                          border: `1px solid ${C.goldBorder}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          fontSize: '21px',
                        }}
                      >
                        {reward.emoji}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '16px', lineHeight: '24px', fontWeight: 800, color: C.textPrimary }}>{reward.name}</div>
                        <div style={{ fontSize: '12px', lineHeight: '18px', color: C.textMuted }}>{reward.desc}</div>
                      </div>

                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontSize: '28px', lineHeight: '32px', fontWeight: 900, color: C.gold }}>{formatPts(reward.cost)}</div>
                        <div style={{ fontSize: '11px', lineHeight: '14px', color: C.textMuted }}>pts</div>
                      </div>
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', lineHeight: '16px', color: C.textMuted }}>
                        <span>{formatPts(points)} / {formatPts(reward.cost)} pts</span>
                        <span>{Math.round(progress)}%</span>
                      </div>
                      <div style={{ paddingTop: '6px' }}>
                        <div style={{ height: '7px', borderRadius: '999px', background: C.surface3, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${progress}%`, borderRadius: '999px', background: `linear-gradient(90deg, ${C.gold} 0%, #E8C04A 100%)` }} />
                        </div>
                      </div>
                    </div>

                    {pending ? (
                      <div
                        style={{
                          width: '100%',
                          boxSizing: 'border-box',
                          height: '42px',
                          borderRadius: '999px',
                          border: `1px solid ${C.goldBorder}`,
                          background: C.goldTint,
                          color: C.goldDark,
                          fontSize: '13px',
                          fontWeight: 700,
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                        }}
                      >
                        <Clock3 size={14} />
                        ⏳ Awaiting {partnerUser.displayName}'s approval…
                      </div>
                    ) : unlocked ? (
                      <button
                        type="button"
                        onClick={() => setConfirmRewardId(reward.id)}
                        style={{
                          width: '100%',
                          height: '42px',
                          borderRadius: '8px',
                          border: 'none',
                          background: `linear-gradient(135deg, ${C.gold}, ${C.goldDark})`,
                          color: '#FFFFFF',
                          fontSize: '14px',
                          lineHeight: '24px',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        Request this reward ✨
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled
                        style={{
                          width: '100%',
                          height: '42px',
                          borderRadius: '8px',
                          border: '1px solid rgba(0,0,0,0.08)',
                          background: C.surface3,
                          color: C.textFaint,
                          fontSize: '14px',
                          lineHeight: '24px',
                          fontWeight: 700,
                          cursor: 'not-allowed',
                        }}
                      >
                        Need {formatPts(needMore)} more pts
                      </button>
                    )}
                  </div>
                );
              })}

              {pendingApproval && (
                <div
                  ref={approvalCardRef}
                  style={{
                    borderRadius: '12px',
                    border: `1px solid ${C.primaryBorder}`,
                    boxShadow: C.cardShadow,
                    background: 'linear-gradient(130deg, rgba(110,164,187,0.16) 0%, rgba(255,255,255,1) 82%)',
                    padding: '14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                  }}
                >
                  <div style={{ fontSize: '16px', fontWeight: 800, color: C.textPrimary }}>{partnerUser.displayName} needs your approval</div>
                  <div style={{ fontSize: '13px', color: C.textMuted }}>
                    {pendingApproval.rewardName} • {formatPts(pendingApproval.rewardCost)} pts
                  </div>
                  <input
                    type="password"
                    value={approvalCode}
                    onChange={(e) => setApprovalCode(e.target.value)}
                    placeholder="Approval code"
                    style={{
                      width: '100%',
                      height: '42px',
                      borderRadius: '8px',
                      border: '1px solid rgba(0,0,0,0.12)',
                      padding: '0 12px',
                      boxSizing: 'border-box',
                      background: '#FFFFFF',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const ok = onApproveReward(pendingApproval.id, approvalCode);
                      if (ok) {
                        setApprovalCode('');
                      }
                    }}
                    style={{
                      width: '100%',
                      height: '42px',
                      borderRadius: '8px',
                      border: 'none',
                      background: `linear-gradient(135deg, ${C.gold}, ${C.goldDark})`,
                      color: '#FFF',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Approve & redeem ✨
                  </button>
                </div>
              )}
            </div>
          )}

          {view === 'tickets' && (
            <div style={{ paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {myApprovedTickets.length === 0 ? (
                <div
                  style={{
                    borderRadius: '12px',
                    border: '1px solid rgba(0,0,0,0.08)',
                    background: '#FFFFFF',
                    boxShadow: C.cardShadow,
                    padding: '20px',
                    fontSize: '14px',
                    fontWeight: 700,
                    color: C.textMuted,
                    textAlign: 'center',
                  }}
                >
                  No tickets yet - keep earning! 💪
                </div>
              ) : (
                myApprovedTickets.map((ticket) => {
                  const reward = REWARDS.find((r) => r.id === ticket.rewardId);
                  return (
                    <div
                      key={ticket.id}
                      style={{
                        borderRadius: '12px',
                        border: '1px solid rgba(0,0,0,0.08)',
                        background: '#FFFFFF',
                        boxShadow: C.cardShadow,
                        padding: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '10px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                        <div
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '10px',
                            border: `1px solid ${C.goldBorder}`,
                            background: C.goldTint,
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '20px',
                            flexShrink: 0,
                          }}
                        >
                          {reward?.emoji ?? '🎟️'}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: '14px', lineHeight: '20px', fontWeight: 800, color: C.textPrimary }}>{ticket.rewardName}</div>
                          <div style={{ fontSize: '12px', lineHeight: '16px', color: C.textMuted }}>{formatTicketDate(ticket.approvedAt ?? ticket.requestedAt)}</div>
                        </div>
                      </div>
                      <div style={{ fontSize: '13px', fontWeight: 800, color: C.goldDark, whiteSpace: 'nowrap' }}>-{formatPts(ticket.rewardCost)} pts</div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {confirmReward && (
            <div
              role="dialog"
              aria-modal="true"
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: 100,
                background: 'rgba(24, 28, 36, 0.45)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px',
              }}
              onClick={() => setConfirmRewardId(null)}
            >
              <div
                style={{
                  width: '100%',
                  maxWidth: '360px',
                  borderRadius: '12px',
                  border: '1px solid rgba(0,0,0,0.08)',
                  background: '#FFFFFF',
                  boxShadow: '0 18px 42px rgba(0,0,0,0.20)',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Gift size={18} color={C.goldDark} />
                  <div style={{ fontSize: '17px', lineHeight: '24px', fontWeight: 900, color: C.textPrimary }}>
                    Redeem {confirmReward.name}?
                  </div>
                </div>
                <div style={{ fontSize: '13px', lineHeight: '19px', color: C.textMuted }}>
                  This will send a request to {partnerUser.displayName} for approval.
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setConfirmRewardId(null)}
                    style={{
                      height: '40px',
                      borderRadius: '8px',
                      border: '1px solid rgba(0,0,0,0.12)',
                      background: '#FFFFFF',
                      color: C.textPrimary,
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onRequestReward(confirmReward.id, confirmReward.name, confirmReward.cost);
                      setConfirmRewardId(null);
                    }}
                    style={{
                      height: '40px',
                      borderRadius: '8px',
                      border: 'none',
                      background: `linear-gradient(135deg, ${C.gold}, ${C.goldDark})`,
                      color: '#FFFFFF',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Yes, request it 🎉
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        </div>
          </>
        )}
      </div>
    </div>
  );
}
