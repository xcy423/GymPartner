import { useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Filter,
  Gift,
  PenLine,
  Sparkles,
  Star,
  TicketCheck,
  Utensils,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { RewardRequest, UserData } from '../App';
import type { RewardCatalogItem } from '../../lib/useGymData';

const C = {
  primary: '#6EA4BB',
  primaryDark: '#4E8BA3',
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
  warnBorder: 'rgba(212,133,74,0.30)',
  surface3: '#ECEEF5',
  cardShadow: '0 6px 18px rgba(36, 52, 76, 0.08)',
  textPrimary: '#2A2D35',
  textMuted: '#6B7280',
  textFaint: '#B0B8C8',
};

type RewardDisplay = RewardCatalogItem & {
  icon: LucideIcon;
  iconColor: string;
};

function iconForCost(costPoints: number): { icon: LucideIcon; iconColor: string } {
  if (costPoints >= 2000) return { icon: Star, iconColor: '#B88E2F' };
  if (costPoints >= 1000) return { icon: Utensils, iconColor: '#B88E2F' };
  return { icon: PenLine, iconColor: '#B88E2F' };
}

function toRewardDisplay(item: RewardCatalogItem): RewardDisplay {
  const { icon, iconColor } = iconForCost(item.cost_points);
  return { ...item, icon, iconColor };
}

interface Props {
  currentUser: UserData;
  partnerUser: UserData;
  catalog: RewardCatalogItem[];
  rewardRequests: RewardRequest[];
  onRedeemReward: (rewardId: number, costPoints: number) => void;
  onApproveCouponUse: (requestId: string, approvalCode: string) => boolean | Promise<boolean>;
  onRequestCouponUse: (requestId: string) => boolean | Promise<boolean>;
}

function formatPts(value: number): string {
  return value.toLocaleString();
}

function formatDate(value?: string): string {
  if (!value) return 'Unknown date';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Unknown date';
  return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatDateTime(value?: string): string {
  if (!value) return 'Unknown time';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Unknown time';
  return date.toLocaleString([], {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function rewardIconFor(rewardId: string, catalog: RewardCatalogItem[]): LucideIcon {
  const item = catalog.find((r) => String(r.id) === rewardId);
  if (!item) return Gift;
  return iconForCost(item.cost_points).icon;
}

export function Rewards({
  currentUser,
  partnerUser,
  catalog,
  rewardRequests,
  onRedeemReward,
  onApproveCouponUse,
  onRequestCouponUse,
}: Props) {
  const [view, setView] = useState<'rewards' | 'tickets'>('rewards');
  const [confirmRewardId, setConfirmRewardId] = useState<number | null>(null);
  const [confirmUseTicketId, setConfirmUseTicketId] = useState<string | null>(null);
  const [approvalCode, setApprovalCode] = useState('');
  const approvalCardRef = useRef<HTMLDivElement | null>(null);

  const rewards = useMemo(() => catalog.map(toRewardDisplay), [catalog]);

  const myTickets = rewardRequests
    .filter((r) => r.requesterId === currentUser.id)
    .slice()
    .sort((a, b) => new Date(b.redeemedAt ?? 0).getTime() - new Date(a.redeemedAt ?? 0).getTime());

  const unusedTicketCount = myTickets.filter((t) => t.status === 'redeemed').length;

  const partnerPendingUse = rewardRequests.filter(
    (r) => r.requesterId === partnerUser.id && r.status === 'pending_use',
  );
  const pendingApproval = partnerPendingUse[0] ?? null;

  const confirmReward = confirmRewardId ? rewards.find((r) => r.id === confirmRewardId) ?? null : null;
  const confirmUseTicket = confirmUseTicketId
    ? myTickets.find((t) => t.id === confirmUseTicketId) ?? null
    : null;

  const handleApprove = async () => {
    if (!pendingApproval) return;
    const ok = await onApproveCouponUse(pendingApproval.id, approvalCode);
    if (ok) setApprovalCode('');
  };

  const topBar = (
    <div
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 30,
        margin: '0 -16px',
        padding: '12px 16px',
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
          <div
            style={{
              fontSize: '20px',
              lineHeight: '30px',
              fontWeight: 900,
              letterSpacing: '-0.05em',
              color: C.textPrimary,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            {view === 'tickets' ? (
              <>
                <TicketCheck size={20} />
                My Tickets
              </>
            ) : (
              <>
                <Gift size={20} />
                Rewards
              </>
            )}
          </div>
          {view === 'rewards' && (
            <div
              style={{
                borderRadius: '999px',
                border: `1px solid ${C.goldBorder}`,
                background: C.goldTint,
                padding: '5px 11px',
                whiteSpace: 'nowrap',
              }}
            >
              <div style={{ fontSize: '13px', lineHeight: '19.5px', fontWeight: 700, color: C.gold }}>
                {formatPts(currentUser.points)} pts
              </div>
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
            aria-label="See all tickets"
          >
            <span style={{ fontSize: '12px', lineHeight: '24px', fontWeight: 700, color: C.primary }}>
              All{unusedTicketCount > 0 ? ` (${unusedTicketCount})` : ''}
            </span>
            <Filter size={15} color={C.primary} />
          </button>
        )}
      </div>
      {view === 'rewards' && (
        <div style={{ marginTop: '4px', fontSize: '13px', lineHeight: '19.5px', color: C.textMuted }}>
          Redeem instantly ? use your coupon when you&apos;re ready.
        </div>
      )}
    </div>
  );

  return (
    <div style={{ padding: '0 16px 96px' }}>
      {topBar}

      {view === 'rewards' && (
        <div style={{ paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {partnerPendingUse.length > 0 && (
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
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                <TicketCheck size={16} />
                Coupon use requests ({partnerPendingUse.length})
              </span>
              <span style={{ fontSize: '12px', fontWeight: 700 }}>Tap to review</span>
            </button>
          )}

          {rewards.map((reward) => {
            const RewardIcon = reward.icon;
            const userPts = currentUser.points;
            const unlocked = userPts >= reward.cost_points;
            const progress = Math.min((userPts / reward.cost_points) * 100, 100);

            return (
              <div
                key={reward.id}
                style={{
                  borderRadius: '12px',
                  background: unlocked ? `linear-gradient(135deg, ${C.goldTint}, #FFFFFF)` : '#FFFFFF',
                  border: `1px solid ${unlocked ? C.goldBorder : 'rgba(0,0,0,0.08)'}`,
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
                    }}
                  >
                    <RewardIcon size={20} color={reward.iconColor} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '16px', lineHeight: '24px', fontWeight: 800, color: C.textPrimary }}>
                      {reward.title}
                    </div>
                    <div style={{ fontSize: '12px', lineHeight: '18px', color: C.textMuted }}>{reward.description}</div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: '28px', lineHeight: '32px', fontWeight: 900, color: C.gold }}>
                      {formatPts(reward.cost_points)}
                    </div>
                    <div style={{ fontSize: '11px', lineHeight: '14px', color: C.textMuted }}>pts</div>
                  </div>
                </div>

                <div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '11px',
                      lineHeight: '16px',
                      color: C.textMuted,
                    }}
                  >
                    <span>
                      {formatPts(userPts)} / {formatPts(reward.cost_points)} pts
                    </span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <div style={{ paddingTop: '6px' }}>
                    <div style={{ height: '7px', borderRadius: '999px', background: C.surface3, overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${progress}%`,
                          borderRadius: '999px',
                          background: `linear-gradient(90deg, ${C.gold} 0%, #E8C04A 100%)`,
                        }}
                      />
                    </div>
                  </div>
                </div>

                {unlocked ? (
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
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                    }}
                  >
                    Redeem
                    <Sparkles size={14} />
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
                    Need {formatPts(reward.cost_points - userPts)} more pts
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
              <div
                style={{
                  fontSize: '16px',
                  fontWeight: 800,
                  color: C.textPrimary,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <CheckCircle2 size={18} color={C.primary} />
                {partnerUser.displayName} wants to use a coupon
              </div>
              <div style={{ fontSize: '13px', color: C.textMuted }}>
                {pendingApproval.rewardName} ? {formatPts(pendingApproval.rewardCost)} pts
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
                onClick={() => void handleApprove()}
                style={{
                  width: '100%',
                  height: '42px',
                  borderRadius: '8px',
                  border: 'none',
                  background: `linear-gradient(135deg, ${C.gold}, ${C.goldDark})`,
                  color: '#FFF',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                Approve use
                <Sparkles size={14} />
              </button>
            </div>
          )}
        </div>
      )}

      {view === 'tickets' && (
        <div style={{ paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {myTickets.length === 0 ? (
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
              No tickets yet ? redeem a reward to get one!
            </div>
          ) : (
            myTickets.map((ticket) => {
              const TicketIcon = rewardIconFor(ticket.rewardId, catalog);
              const isRedeemed = ticket.status === 'redeemed';
              const isPendingUse = ticket.status === 'pending_use';
              const isUsed = ticket.status === 'used';
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
                    flexDirection: 'column',
                    gap: '10px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
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
                          flexShrink: 0,
                        }}
                      >
                        <TicketIcon size={18} color={C.goldDark} />
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: '14px', lineHeight: '20px', fontWeight: 800, color: C.textPrimary }}>
                          {ticket.rewardName}
                        </div>
                        <div style={{ fontSize: '12px', lineHeight: '16px', color: C.textMuted }}>
                          Redeemed {formatDateTime(ticket.redeemedAt)}
                        </div>
                      </div>
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 800, color: C.goldDark, whiteSpace: 'nowrap' }}>
                      -{formatPts(ticket.rewardCost)} pts
                    </div>
                  </div>

                  {isRedeemed && (
                    <button
                      type="button"
                      onClick={() => setConfirmUseTicketId(ticket.id)}
                      style={{
                        width: '100%',
                        height: '42px',
                        borderRadius: '8px',
                        border: 'none',
                        background: `linear-gradient(135deg, ${C.green}, ${C.greenDark})`,
                        color: '#FFFFFF',
                        fontSize: '14px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                      }}
                    >
                      <TicketCheck size={16} />
                      Use it
                    </button>
                  )}

                  {isPendingUse && (
                    <div
                      style={{
                        padding: '10px 12px',
                        borderRadius: '999px',
                        background: C.warnTint,
                        border: `1px solid ${C.warnBorder}`,
                        color: C.warn,
                        fontSize: '12px',
                        fontWeight: 700,
                        textAlign: 'center',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                      }}
                    >
                      <Clock3 size={14} />
                      Awaiting {partnerUser.displayName}&apos;s approval
                    </div>
                  )}

                  {isUsed && (
                    <div
                      style={{
                        padding: '10px 12px',
                        borderRadius: '8px',
                        background: C.greenTint,
                        border: `1px solid ${C.greenBorder}`,
                        color: C.green,
                        fontSize: '13px',
                        fontWeight: 700,
                        textAlign: 'center',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                      }}
                    >
                      <CheckCircle2 size={14} />
                      Used on {formatDate(ticket.usedAt)}
                    </div>
                  )}
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
                Redeem {confirmReward.title}?
              </div>
            </div>
            <div style={{ fontSize: '13px', lineHeight: '19px', color: C.textMuted }}>
              {formatPts(confirmReward.cost_points)} pts will be deducted immediately. Your coupon will appear in the
              Tickets tab, ready to use when you want.
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
                  onRedeemReward(confirmReward.id, confirmReward.cost_points);
                  setConfirmRewardId(null);
                  setView('tickets');
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
                Yes, redeem
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmUseTicket && (
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
          onClick={() => setConfirmUseTicketId(null)}
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
              <TicketCheck size={18} color={C.green} />
              <div style={{ fontSize: '17px', lineHeight: '24px', fontWeight: 900, color: C.textPrimary }}>
                Use {confirmUseTicket.rewardName}?
              </div>
            </div>
            <div style={{ fontSize: '13px', lineHeight: '19px', color: C.textMuted }}>
              This will ask {partnerUser.displayName} to enter their approval code. Once approved, the coupon will
              be marked as used.
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setConfirmUseTicketId(null)}
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
                  void onRequestCouponUse(confirmUseTicket.id);
                  setConfirmUseTicketId(null);
                }}
                style={{
                  height: '40px',
                  borderRadius: '8px',
                  border: 'none',
                  background: `linear-gradient(135deg, ${C.green}, ${C.greenDark})`,
                  color: '#FFFFFF',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Use it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
