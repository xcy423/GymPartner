import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { UserData, RewardRequest } from '../App';

const C = {
  primary: '#6EA4BB',
  primaryDark: '#4E8BA3',
  primaryTint: 'rgba(110,164,187,0.12)',
  primaryBorder: 'rgba(110,164,187,0.35)',
  gold: '#D4A843',
  goldDark: '#B88E2F',
  goldTint: 'rgba(212,168,67,0.12)',
  goldBorder: 'rgba(212,168,67,0.35)',
  green: '#5A9E6E',
  greenTint: 'rgba(90,158,110,0.12)',
  greenBorder: 'rgba(90,158,110,0.30)',
  warn: '#D4854A',
  warnTint: 'rgba(212,133,74,0.12)',
  surface2: '#F3F4F8',
  surface3: '#ECEEF5',
  textPrimary: '#2A2D35',
  textMuted: '#6B7280',
  textFaint: '#B0B8C8',
};

const REWARDS = [
  { id: 'letter', emoji: '≡ƒÆî', name: 'Handwritten letter', desc: 'A heartfelt letter or cute small surprise gift.', cost: 200 },
  { id: 'meal', emoji: '≡ƒì│', name: 'Home-cooked meal', desc: "Pick your favourite dish and I'll cook it just for you.", cost: 1000 },
  { id: 'wish', emoji: 'Γ¡É', name: 'Your custom wish', desc: 'Name literally anything you want as your reward.', cost: 2000 },
];

interface Props {
  currentUser: UserData;
  partnerUser: UserData;
  rewardRequests: RewardRequest[];
  viewMode: 'self' | 'partner';
  onRequestReward: (id: string, name: string, emoji: string, cost: number) => void;
  onApproveReward: (requestId: string, approvalCode: string) => boolean | Promise<boolean>;
}

export function Rewards({ currentUser, partnerUser, rewardRequests, viewMode, onRequestReward, onApproveReward }: Props) {
  const [approvalCode, setApprovalCode] = useState('');
  const [approveFocus, setApproveFocus] = useState(false);

  const myPendingRequests = rewardRequests.filter(
    (r) => r.requesterId === currentUser.id && r.status === 'pending'
  );

  const partnerPendingRequests = rewardRequests.filter(
    (r) => r.requesterId === partnerUser.id && r.status === 'pending'
  );

  const getMyRequest = (rewardId: string) =>
    rewardRequests.find((r) => r.requesterId === currentUser.id && r.rewardId === rewardId);

  const pendingApproval = partnerPendingRequests[0];

  const handleApprove = async () => {
    if (!pendingApproval) return;
    const ok = await onApproveReward(pendingApproval.id, approvalCode);
    if (ok) setApprovalCode('');
  };

  return (
    <div style={{ padding: '0 16px 96px', paddingTop: '0' }}>
      {/* Topbar */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        borderBottom: '1px solid rgba(0,0,0,0.07)',
        padding: '12px 16px', margin: '0 -16px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ fontSize: '28px', fontWeight: 900, color: C.textPrimary, letterSpacing: '-0.05em' }}>
            Rewards ≡ƒÄü
          </div>
          <div style={{ fontSize: '13px', color: C.textMuted }}>Earn points by hitting your weekly gym goals.</div>
        </div>
        <div style={{
          padding: '4px 10px', borderRadius: '999px',
          background: C.goldTint, border: `1px solid ${C.goldBorder}`,
          color: C.gold, fontSize: '13px', fontWeight: 700,
        }}>
          {currentUser.points} pts
        </div>
      </div>

      <div style={{ paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* Reward cards */}
        {REWARDS.map((reward) => {
          const userPts = currentUser.points;
          const unlocked = userPts >= reward.cost;
          const pct = Math.min((userPts / reward.cost) * 100, 100);
          const myReq = getMyRequest(reward.id);
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
                    {reward.name}
                  </div>
                  <div style={{ fontSize: '12px', color: C.textMuted, marginTop: '2px', lineHeight: 1.4 }}>
                    {reward.desc}
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: '22px', fontWeight: 900, color: C.gold, letterSpacing: '-0.04em' }}>
                    {reward.cost.toLocaleString()}
                  </div>
                  <div style={{ fontSize: '11px', color: C.textMuted }}>pts</div>
                </div>
              </div>

              {/* Progress row */}
              <div style={{ marginBottom: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '11px', color: C.textMuted }}>
                    {userPts.toLocaleString()} / {reward.cost.toLocaleString()} pts
                  </span>
                  <span style={{ fontSize: '11px', color: C.textMuted }}>
                    {Math.round(pct)}%
                  </span>
                </div>
                <div style={{ height: '6px', borderRadius: '999px', background: C.surface3, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: '999px',
                    background: `linear-gradient(90deg, ${C.gold}, #E8C04A)`,
                    width: `${pct}%`, transition: 'width 0.4s ease',
                  }} />
                </div>
              </div>

              {/* Action footer */}
              {isApproved ? (
                <div style={{
                  padding: '10px 14px', borderRadius: '8px',
                  background: C.greenTint, border: `1px solid ${C.greenBorder}`,
                  textAlign: 'center', fontSize: '13px', fontWeight: 600, color: C.green,
                }}>
                  Γ£à Redeemed! {myReq?.approvedAt ? `on ${new Date(myReq.approvedAt).toLocaleDateString()}` : ''}
                </div>
              ) : isPending ? (
                <div style={{
                  padding: '10px 14px', borderRadius: '999px',
                  background: C.warnTint, border: '1px solid rgba(212,133,74,0.35)',
                  textAlign: 'center', fontSize: '12px', fontWeight: 600, color: C.warn,
                }}>
                  ΓÅ│ Awaiting approval from {partnerUser.displayName}ΓÇª
                </div>
              ) : unlocked ? (
                <button
                  onClick={() => onRequestReward(reward.id, reward.name, reward.emoji, reward.cost)}
                  style={{
                    width: '100%', height: '44px', borderRadius: '8px',
                    background: `linear-gradient(135deg, ${C.gold}, ${C.goldDark})`,
                    border: 'none', color: '#FFF', fontSize: '14px', fontWeight: 700,
                    cursor: 'pointer', boxShadow: `0 4px 12px rgba(212,168,67,0.35)`,
                  }}
                >
                  Request this reward Γ£¿
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
                  Need {(reward.cost - userPts).toLocaleString()} more pts
                </button>
              )}
            </motion.div>
          );
        })}

        {/* Approval card ΓÇö shown when partner has pending request */}
        <AnimatePresence>
          {pendingApproval && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              style={{
                borderRadius: '16px',
                background: `linear-gradient(135deg, ${C.primaryTint}, #FFFFFF)`,
                border: `1.5px solid ${C.primaryBorder}`,
                padding: '20px',
                boxShadow: '0 4px 16px rgba(110,164,187,0.15)',
              }}
            >
              <div style={{ fontSize: '15px', fontWeight: 800, color: C.textPrimary, marginBottom: '8px' }}>
                Γ£à Approve partner reward
              </div>
              <div style={{ fontSize: '13px', color: C.textMuted, marginBottom: '16px', lineHeight: 1.5 }}>
                <strong>{partnerUser.displayName}</strong> wants to redeem{' '}
                {pendingApproval.rewardEmoji} <strong>{pendingApproval.rewardName}</strong> for{' '}
                {pendingApproval.rewardCost.toLocaleString()} pts. Enter your approval code to confirm.
              </div>

              <label style={{
                display: 'block', fontSize: '11px', fontWeight: 700,
                letterSpacing: '0.05em', color: C.textMuted, textTransform: 'uppercase', marginBottom: '6px',
              }}>
                Your Approval Code
              </label>
              <input
                type="password"
                value={approvalCode}
                onChange={(e) => setApprovalCode(e.target.value)}
                placeholder="Enter your code"
                onFocus={() => setApproveFocus(true)}
                onBlur={() => setApproveFocus(false)}
                style={{
                  width: '100%', height: '46px', borderRadius: '6px',
                  background: C.surface2,
                  border: `1.5px solid ${approveFocus ? C.primary : 'rgba(110,164,187,0.20)'}`,
                  boxShadow: approveFocus ? `0 0 0 4px ${C.primaryTint}` : 'none',
                  padding: '0 14px', fontSize: '15px', color: C.textPrimary,
                  outline: 'none', transition: 'border-color 0.15s, box-shadow 0.15s',
                  boxSizing: 'border-box', marginBottom: '12px',
                }}
              />
              <button
                onClick={handleApprove}
                style={{
                  width: '100%', height: '46px', borderRadius: '8px',
                  background: `linear-gradient(135deg, ${C.primary}, ${C.primaryDark})`,
                  border: 'none', color: '#FFF', fontSize: '14px', fontWeight: 700,
                  cursor: 'pointer', boxShadow: `0 4px 12px rgba(110,164,187,0.35)`,
                }}
              >
                Approve & redeem Γ£¿
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* My pending requests summary */}
        {myPendingRequests.length > 0 && (
          <div style={{
            padding: '12px 14px', borderRadius: '8px',
            background: C.goldTint, border: `1px solid ${C.goldBorder}`,
            fontSize: '12px', color: C.goldDark,
          }}>
            ΓÅ│ You have {myPendingRequests.length} pending reward request{myPendingRequests.length > 1 ? 's' : ''} awaiting {partnerUser.displayName}'s approval.
          </div>
        )}
      </div>
    </div>
  );
}
