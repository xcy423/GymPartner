import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { Profile, RedemptionRequest, RewardCatalogItem } from '../../lib/useGymData';

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
  warnBorder: 'rgba(212,133,74,0.35)',
  surface3: '#ECEEF5',
  cardShadow: '0 6px 18px rgba(36, 52, 76, 0.08)',
  textPrimary: '#2A2D35',
  textMuted: '#6B7280',
  textFaint: '#B0B8C8',
};

interface Props {
  currentUser: Profile;
  partnerUser: Profile;
  catalog: RewardCatalogItem[];
  rewardRequests: RedemptionRequest[];
  viewMode: 'self' | 'partner';
  onRequestReward: (rewardId: number, costPoints: number) => void;
  onApproveReward: (requestId: string, approvalCode: string) => Promise<boolean>;
}

export function Rewards({
  currentUser,
  partnerUser,
  catalog,
  rewardRequests,
  viewMode,
  onRequestReward,
  onApproveReward,
}: Props) {
  const [approvalCode, setApprovalCode] = useState('');
  const [approveFocus, setApproveFocus] = useState(false);
  const [approving, setApproving] = useState(false);

  // Requests made by the current user
  const myPendingRequests = rewardRequests.filter(
    (r) => r.requester_id === currentUser.id && r.status === 'pending'
  );

  // Requests made by partner that current user needs to approve
  const partnerPendingRequests = rewardRequests.filter(
    (r) => r.requester_id === partnerUser.id && r.status === 'pending'
  );
  const pendingApproval = partnerPendingRequests[0] ?? null;

  const myApprovedTickets = myRequests
    .filter((r) => r.status === 'approved' || r.status === 'used')
    .slice()
    .sort(
      (a, b) =>
        new Date(b.approvedAt ?? 0).getTime() - new Date(a.approvedAt ?? 0).getTime(),
    );

  const getMyRequest = (rewardId: number) =>
    rewardRequests.find(
      (r) => r.requester_id === currentUser.id && r.reward_id === rewardId
    );

  const confirmReward = confirmRewardId ? REWARDS.find((r) => r.id === confirmRewardId) ?? null : null;

  const handleApprove = async () => {
    if (!pendingApproval) return;
    setApproving(true);
    const ok = await onApproveReward(pendingApproval.id, approvalCode);
    if (ok) setApprovalCode('');
    setApproving(false);
  };

  const displayUser = viewMode === 'partner' ? partnerUser : currentUser;

  return (
    <div style={{ padding: '0 16px 96px', paddingTop: '0' }}>
      {/* Topbar */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
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
          <div style={{ fontSize: '13px', color: C.textMuted }}>
            {viewMode === 'partner'
              ? `Viewing ${partnerUser.display_name}'s rewards`
              : 'Earn points by hitting your weekly gym goals.'}
          </div>
        </div>
        <div style={{
          padding: '4px 10px', borderRadius: '999px',
          background: C.goldTint, border: `1px solid ${C.goldBorder}`,
          color: C.gold, fontSize: '13px', fontWeight: 700,
        }}>
          {displayUser.points} pts
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
            <span style={{ fontSize: '12px', lineHeight: '24px', fontWeight: 700, color: C.primary }}>All</span>
            <Filter size={15} color={C.primary} />
          </button>
        )}
      </div>
      {view === 'rewards' && (
        <div style={{ marginTop: '4px', fontSize: '13px', lineHeight: '19.5px', color: C.textMuted }}>
          Earn points by hitting your weekly gym goals.
        </div>
      )}
    </div>
  );

  return (
    <div style={{ padding: '0 16px 96px' }}>
      {topBar}

        {/* Reward cards from catalog */}
        {catalog.map((reward) => {
          const userPts = displayUser.points;
          const unlocked = userPts >= reward.cost_points;
          const pct = Math.min((userPts / reward.cost_points) * 100, 100);
          const myReq = viewMode === 'self' ? getMyRequest(reward.id) : undefined;
          const isPending = myReq?.status === 'pending';
          const isApproved = myReq?.status === 'approved';

          return (
            <motion.div
              key={reward.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                borderRadius: '12px',
                background: unlocked
                  ? `linear-gradient(135deg, ${C.goldTint}, #FFFFFF)`
                  : '#FFFFFF',
                border: `1px solid ${unlocked ? C.goldBorder : 'rgba(0,0,0,0.08)'}`,
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                padding: '16px',
              }}
            >
              {/* Top row */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '14px' }}>
                <div style={{
                  width: '44px', height: '44px', borderRadius: '8px', flexShrink: 0,
                  background: C.goldTint, border: `1px solid ${C.goldBorder}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px',
                }}>
                  {reward.emoji}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: C.textPrimary, letterSpacing: '-0.02em' }}>
                    {reward.title}
                  </div>
                  <div style={{ fontSize: '12px', color: C.textMuted, marginTop: '2px', lineHeight: 1.4 }}>
                    {reward.description}
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: '22px', fontWeight: 900, color: C.gold, letterSpacing: '-0.04em' }}>
                    {reward.cost_points.toLocaleString()}
                  </div>
                </div>

              {/* Progress bar */}
              <div style={{ marginBottom: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '11px', color: C.textMuted }}>
                    {userPts.toLocaleString()} / {reward.cost_points.toLocaleString()} pts
                  </span>
                  <span style={{ fontSize: '11px', color: C.textMuted }}>{Math.round(pct)}%</span>
                </div>
                <div style={{ height: '6px', borderRadius: '999px', background: C.surface3, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: '999px',
                    background: `linear-gradient(90deg, ${C.gold}, #E8C04A)`,
                    width: `${pct}%`, transition: 'width 0.4s ease',
                  }} />
                </div>

              {/* Action — only show for self view */}
              {viewMode === 'self' && (
                isApproved ? (
                  <div style={{
                    padding: '10px 14px', borderRadius: '8px',
                    background: C.greenTint, border: `1px solid ${C.greenBorder}`,
                    textAlign: 'center', fontSize: '13px', fontWeight: 600, color: C.green,
                  }}>
                    ✅ Redeemed!{myReq?.approved_at ? ` on ${new Date(myReq.approved_at).toLocaleDateString()}` : ''}
                  </div>
                ) : isPending ? (
                  <div style={{
                    padding: '10px 14px', borderRadius: '999px',
                    background: C.warnTint, border: '1px solid rgba(212,133,74,0.35)',
                    textAlign: 'center', fontSize: '12px', fontWeight: 600, color: C.warn,
                  }}>
                    ⏳ Awaiting approval from {partnerUser.display_name}…
                  </div>
                ) : unlocked ? (
                  <button
                    onClick={() => onRequestReward(reward.id, reward.cost_points)}
                    style={{
                      width: '100%', height: '44px', borderRadius: '8px',
                      background: `linear-gradient(135deg, ${C.gold}, ${C.goldDark})`,
                      border: 'none', color: '#FFF', fontSize: '14px', fontWeight: 700,
                      cursor: 'pointer', boxShadow: `0 4px 12px rgba(212,168,67,0.35)`,
                    }}
                  >
                    Request this reward ✨
                  </button>
                ) : (
                  <button
                    disabled
                    style={{
                      width: '100%', height: '44px', borderRadius: '8px',
                      background: C.surface3, border: '1px solid rgba(0,0,0,0.08)',
                      color: C.textFaint, fontSize: '14px', fontWeight: 700,
                      cursor: 'not-allowed', opacity: 0.45,
                    }}
                  >
                    Need {(reward.cost_points - userPts).toLocaleString()} more pts
                  </button>
                )
              )}
            </motion.div>
          );
        })}

        {/* Partner approval card */}
        <AnimatePresence>
          {pendingApproval && viewMode === 'self' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
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
              <div style={{ fontSize: '16px', fontWeight: 800, color: C.textPrimary, display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={18} color={C.primary} />
                {partnerUser.displayName} needs your approval
              </div>
              <div style={{ fontSize: '13px', color: C.textMuted, marginBottom: '16px', lineHeight: 1.5 }}>
                <strong>{partnerUser.display_name}</strong> wants to redeem{' '}
                {pendingApproval.reward?.emoji}{' '}
                <strong>{pendingApproval.reward?.title}</strong> for{' '}
                {pendingApproval.points_deducted.toLocaleString()} pts. Enter your approval code to confirm.
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
                onClick={handleApprove}
                disabled={approving}
                style={{
                  width: '100%', height: '46px', borderRadius: '8px',
                  background: `linear-gradient(135deg, ${C.primary}, ${C.primaryDark})`,
                  border: 'none', color: '#FFF', fontSize: '14px', fontWeight: 700,
                  cursor: approving ? 'not-allowed' : 'pointer',
                  opacity: approving ? 0.7 : 1,
                  boxShadow: `0 4px 12px rgba(110,164,187,0.35)`,
                }}
              >
                {approving ? 'Approving…' : 'Approve & redeem ✨'}
              </button>
            </div>
          )}
        </div>
      )}

        {/* My pending summary */}
        {myPendingRequests.length > 0 && (
          <div style={{
            padding: '12px 14px', borderRadius: '8px',
            background: C.goldTint, border: `1px solid ${C.goldBorder}`,
            fontSize: '12px', color: C.goldDark,
          }}>
            ⏳ You have {myPendingRequests.length} pending reward request{myPendingRequests.length > 1 ? 's' : ''} awaiting {partnerUser.display_name}'s approval.
          </div>
        </div>
      )}
    </div>
  );
}
