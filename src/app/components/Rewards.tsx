import { useMemo, useState } from 'react';
import { Clock3, Gift, PenLine, Sparkles, Star, TicketCheck, Utensils } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { RewardRequest, UserData } from '../types';

const C = {
  primary: '#6EA4BB',
  primaryDark: '#4E8BA3',
  primaryTint: 'rgba(110,164,187,0.12)',
  primaryBorder: 'rgba(110,164,187,0.35)',
  gold: '#D4A843',
  goldDark: '#B88E2F',
  goldTint: 'rgba(212,168,67,0.12)',
  goldTintStrong: 'rgba(212,168,67,0.18)',
  goldBorder: 'rgba(212,168,67,0.35)',
  green: '#5A9E6E',
  greenTint: 'rgba(90,158,110,0.12)',
  greenBorder: 'rgba(90,158,110,0.30)',
  warn: '#D4854A',
  warnTint: 'rgba(212,133,74,0.12)',
  surface3: '#ECEEF5',
  textPrimary: '#2A2D35',
  textMuted: '#6B7280',
  textFaint: '#B0B8C8',
};

type RewardItem = { id: string; icon: LucideIcon; iconColor: string; name: string; desc: string; cost: number };

const REWARDS: RewardItem[] = [
  { id: 'letter', icon: PenLine, iconColor: '#B88E2F', name: 'Handwritten letter', desc: 'A heartfelt letter or cute small surprise gift.', cost: 200 },
  { id: 'meal', icon: Utensils, iconColor: '#B88E2F', name: 'Home-cooked meal', desc: "Pick your favourite dish and I'll cook it just for you.", cost: 1000 },
  { id: 'wish', icon: Star, iconColor: '#B88E2F', name: 'Your custom wish', desc: 'Name literally anything you want as your reward.', cost: 2000 },
];

interface Props {
  currentUser: UserData;
  partnerUser: UserData;
  rewardRequests: RewardRequest[];
  onRequestReward: (id: string, name: string, cost: number) => void;
  onApproveReward: (requestId: string, approvalCode: string) => boolean;
  onUseCoupon: (requestId: string) => boolean;
}

export function Rewards({ currentUser, partnerUser, rewardRequests, onRequestReward, onApproveReward, onUseCoupon }: Props) {
  const [approvalCode, setApprovalCode] = useState('');
  const [showPending, setShowPending] = useState(false);

  const myRequests = rewardRequests.filter((r) => r.requesterId === currentUser.username);
  const partnerPendingRequests = rewardRequests.filter((r) => r.requesterId === partnerUser.username && r.status === 'pending');

  const pendingApproval = partnerPendingRequests[0] ?? null;

  const requestByRewardId = useMemo(() => {
    const m = new Map<string, RewardRequest>();
    for (const req of myRequests) {
      if (!m.has(req.rewardId) || req.status === 'pending' || req.status === 'approved') {
        m.set(req.rewardId, req);
      }
    }
    return m;
  }, [myRequests]);

  return (
    <div style={{ padding: '0 16px 96px' }}>
      <div
        style={{
          margin: '0 -16px',
          padding: '12px 16px 13px',
          borderBottom: '1px solid rgba(0,0,0,0.07)',
          background: 'rgba(255,255,255,0.88)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <div style={{ height: '30px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Gift size={22} color={C.textPrimary} />
            <div style={{ fontSize: '20px', lineHeight: '30px', fontWeight: 900, letterSpacing: '-0.05em', color: C.textPrimary }}>
              Rewards
            </div>
            <div style={{ borderRadius: '999px', border: `1px solid ${C.goldBorder}`, background: C.goldTint, padding: '5px 11px' }}>
              <div style={{ fontSize: '13px', lineHeight: '19.5px', fontWeight: 700, color: C.gold }}>
                {currentUser.points} pts
              </div>
            </div>
          </div>
          <div style={{ marginTop: '1px', fontSize: '13px', lineHeight: '19.5px', color: C.textMuted }}>
            Earn points by hitting your weekly gym goals.
          </div>
        </div>

        <div
          style={{
            height: '32px',
            borderRadius: '8px',
            border: `1px solid ${C.primaryBorder}`,
            background: C.primaryTint,
            padding: '5px 10px',
            color: C.primary,
            fontSize: '12px',
            lineHeight: '24px',
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            flexShrink: 0,
          }}
        >
          All Tickets
          <TicketCheck size={16} />
        </div>
      </div>

      <div style={{ paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <button
          onClick={() => setShowPending((v) => !v)}
          style={{
            width: '100%',
            height: '52px',
            borderRadius: '12px',
            border: `1px solid ${C.primaryBorder}`,
            background: `linear-gradient(135deg, ${C.primaryTint}, #FFF)`,
            color: C.primary,
            fontWeight: 800,
            fontSize: '14px',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}
        >
          <TicketCheck size={16} />
          Reward Pending Requests ({partnerPendingRequests.length})
        </button>

        {showPending && (
          <div style={{ borderRadius: '12px', border: `1px solid ${C.primaryBorder}`, background: '#FFF', padding: '14px' }}>
            {!pendingApproval && <div style={{ fontSize: '13px', color: C.textMuted }}>No pending requests from {partnerUser.displayName}.</div>}
            {pendingApproval && (
              <>
                <div style={{ fontSize: '14px', fontWeight: 800, color: C.textPrimary, marginBottom: '6px' }}>{partnerUser.displayName} requested {pendingApproval.rewardName}</div>
                <div style={{ fontSize: '12px', color: C.textMuted, marginBottom: '10px' }}>Cost: {pendingApproval.rewardCost} pts</div>
                <input
                  type="password"
                  value={approvalCode}
                  onChange={(e) => setApprovalCode(e.target.value)}
                  placeholder="Enter approval code"
                  style={{ width: '100%', height: '42px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.1)', padding: '0 12px', marginBottom: '10px' }}
                />
                <button
                  onClick={() => {
                    const ok = onApproveReward(pendingApproval.id, approvalCode);
                    if (ok) setApprovalCode('');
                  }}
                  style={{ width: '100%', height: '42px', borderRadius: '8px', border: 'none', background: `linear-gradient(135deg, ${C.gold}, ${C.goldDark})`, color: '#FFF', fontWeight: 700, cursor: 'pointer' }}
                >
                  Approve and redeem
                </button>
              </>
            )}
          </div>
        )}

        {REWARDS.map((reward) => {
          const RewardIcon = reward.icon;
          const req = requestByRewardId.get(reward.id);
          const userPts = currentUser.points;
          const unlocked = userPts >= reward.cost;
          const progress = Math.min((userPts / reward.cost) * 100, 100);
          const isPending = req?.status === 'pending';
          const isApproved = req?.status === 'approved';
          const isUsed = req?.status === 'used';

          return (
            <div key={reward.id} style={{ borderRadius: '12px', background: unlocked ? `linear-gradient(135deg, ${C.goldTint}, #FFFFFF)` : '#FFFFFF', border: `1px solid ${unlocked ? C.goldBorder : 'rgba(0,0,0,0.08)'}`, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '12px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '8px', background: C.goldTint, border: `1px solid ${C.goldBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><RewardIcon size={20} color={reward.iconColor} /></div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: C.textPrimary }}>{reward.name}</div>
                  <div style={{ fontSize: '12px', color: C.textMuted, marginTop: '2px' }}>{reward.desc}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '22px', fontWeight: 900, color: C.gold }}>{reward.cost.toLocaleString()}</div>
                  <div style={{ fontSize: '11px', color: C.textMuted }}>pts</div>
                </div>
              </div>

              <div style={{ marginBottom: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '11px', color: C.textMuted }}>{userPts.toLocaleString()} / {reward.cost.toLocaleString()} pts</span>
                  <span style={{ fontSize: '11px', color: C.textMuted }}>{Math.round(progress)}%</span>
                </div>
                <div style={{ height: '6px', borderRadius: '999px', background: C.surface3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', borderRadius: '999px', width: `${progress}%`, background: `linear-gradient(90deg, ${C.gold}, #E8C04A)` }} />
                </div>
              </div>

              {isApproved ? (
                <button onClick={() => onUseCoupon(req.id)} style={{ width: '100%', height: '42px', borderRadius: '8px', border: 'none', background: `linear-gradient(135deg, ${C.green}, #3d8055)`, color: '#FFF', fontWeight: 700, cursor: 'pointer' }}>
                  Use Coupon
                </button>
              ) : isPending ? (
                <div style={{ padding: '10px 12px', borderRadius: '999px', background: C.warnTint, border: `1px solid rgba(212,133,74,0.35)`, color: C.warn, fontSize: '12px', fontWeight: 700, textAlign: 'center', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', width: '100%', boxSizing: 'border-box' }}>
                  <Clock3 size={14} /> Awaiting approval from {partnerUser.displayName}
                </div>
              ) : isUsed ? (
                <div style={{ padding: '10px 12px', borderRadius: '8px', background: 'rgba(90,158,110,0.10)', border: `1px solid ${C.greenBorder}`, color: C.green, fontSize: '12px', fontWeight: 700, textAlign: 'center' }}>Coupon used</div>
              ) : unlocked ? (
                <button onClick={() => onRequestReward(reward.id, reward.name, reward.cost)} style={{ width: '100%', height: '42px', borderRadius: '8px', border: 'none', background: `linear-gradient(135deg, ${C.gold}, ${C.goldDark})`, color: '#FFF', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                  Request this reward <Sparkles size={14} />
                </button>
              ) : (
                <button disabled style={{ width: '100%', height: '42px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.08)', background: C.surface3, color: C.textFaint, fontWeight: 700, cursor: 'not-allowed', opacity: 0.8 }}>
                  Need {(reward.cost - userPts).toLocaleString()} more pts
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
