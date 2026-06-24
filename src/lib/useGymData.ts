import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import type { ActiveSession, GymCheckOutResult, RewardRequest, UserData } from '../app/App';
import type { Session } from './sessionUtils';
import { localDateString } from './sessionUtils';
import { MIN_SESSION_MINS, uploadSessionPhoto } from './sessionPhotos';
import { supabase } from './supabase';

interface ProfileRow {
  id: string;
  username: string;
  display_name: string;
  partner_id: string | null;
  approval_code: string | null;
  weekly_mode: string | null;
  points: number | null;
  multiplier: number | null;
  streak_weeks: number | null;
}

interface GymSessionRow {
  id: string;
  user_id: string;
  check_in_at: string;
  check_out_at: string | null;
  check_in_url: string | null;
  check_out_url: string | null;
  status: string;
  duration_mins: number | null;
  earned_pts: number | null;
}

function isSessionComplete(status: string): boolean {
  return status === 'complete' || status === 'completed';
}

function isSessionActive(status: string): boolean {
  return status === 'active' || status === 'in_progress';
}

export interface RewardCatalogItem {
  id: number;
  emoji: string;
  title: string;
  description: string;
  cost_points: number;
  active: boolean;
}

export const DEFAULT_REWARDS_CATALOG: RewardCatalogItem[] = [
  {
    id: 1,
    emoji: '💌',
    title: 'Handwritten letter',
    description: 'A heartfelt letter or cute small surprise gift.',
    cost_points: 200,
    active: true,
  },
  {
    id: 2,
    emoji: '🍳',
    title: 'Home-cooked meal',
    description: "Pick your favourite dish and I'll cook it just for you.",
    cost_points: 1000,
    active: true,
  },
  {
    id: 3,
    emoji: '⭐',
    title: 'Your custom wish',
    description: 'Name literally anything you want as your reward.',
    cost_points: 2000,
    active: true,
  },
];

interface RedemptionRequestRow {
  id: string;
  requester_id: string;
  approver_id: string;
  reward_id: number;
  status: string;
  custom_text: string | null;
  points_deducted: number | null;
  approved_at: string | null;
  created_at: string | null;
  rewards_catalog?: {
    emoji: string;
    title: string;
    cost_points: number;
  } | {
    emoji: string;
    title: string;
    cost_points: number;
  }[] | null;
}

function supabaseErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as { message: string }).message);
  }
  return 'Unknown error';
}

function formatTime(date: Date): string {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

function mapProfile(row: ProfileRow): UserData {
  return {
    id: row.id,
    username: row.username,
    password: '',
    displayName: row.display_name,
    partner: row.partner_id ?? '',
    approvalCode: row.approval_code ?? '',
    points: row.points ?? 0,
    multiplier: row.multiplier ?? 1,
    weekStreak: row.streak_weeks ?? 0,
    weekMode: (row.weekly_mode === 'rolling' ? 'rolling' : 'fixed') as 'fixed' | 'rolling',
  };
}

function mapSession(row: GymSessionRow): Session {
  const checkIn = new Date(row.check_in_at);
  const checkOut = row.check_out_at ? new Date(row.check_out_at) : null;

  return {
    id: row.id,
    userId: row.user_id,
    date: localDateString(checkIn),
    checkInTime: formatTime(checkIn),
    checkOutTime: checkOut ? formatTime(checkOut) : null,
    checkInPhoto: row.check_in_url,
    checkOutPhoto: row.check_out_url,
    complete: isSessionComplete(row.status) || !!row.check_out_at,
    durationMins: row.duration_mins,
    earnedPts: row.earned_pts ?? 0,
  };
}

function mapRewardRequest(row: RedemptionRequestRow): RewardRequest {
  const catalog = Array.isArray(row.rewards_catalog)
    ? row.rewards_catalog[0]
    : row.rewards_catalog;

  const status =
    row.status === 'redeemed' || row.status === 'pending_use' || row.status === 'used'
      ? row.status
      : row.status === 'approved'
        ? 'redeemed'
        : row.status === 'pending'
          ? 'pending_use'
          : 'redeemed';

  return {
    id: row.id,
    requesterId: row.requester_id,
    rewardId: String(row.reward_id),
    rewardName: catalog?.title ?? String(row.reward_id),
    rewardEmoji: catalog?.emoji ?? '🎁',
    rewardCost: catalog?.cost_points ?? row.points_deducted ?? 0,
    status,
    redeemedAt: row.created_at ?? undefined,
    usedAt: status === 'used' ? (row.approved_at ?? undefined) : undefined,
  };
}

function checkoutToastMessage(result: GymCheckOutResult): string {
  if (result.earned_pts > 0 && result.week_count === 3) {
    return `Weekly goal hit! +${result.earned_pts} pts 🎉`;
  }
  if (result.earned_pts > 0 && result.week_count === 5) {
    return `Bonus session! +${result.earned_pts} pts 🔥`;
  }
  if (result.earned_pts > 0) {
    return `+${result.earned_pts} pts earned! (${result.week_count} sessions · ${result.multiplier}x)`;
  }
  if (result.week_count < 3) {
    return `✅ Session complete! ${3 - result.week_count} more this week to earn points.`;
  }
  return '✅ Session complete!';
}

const SESSION_SELECT_FULL =
  'id, user_id, check_in_at, check_out_at, check_in_url, check_out_url, status, duration_mins, earned_pts';
const SESSION_SELECT_MINIMAL =
  'id, user_id, check_in_at, check_out_at, status, duration_mins';

async function fetchGymSessionsForUsers(
  userId: string,
  partnerId: string | null,
): Promise<GymSessionRow[]> {
  async function querySessions(select: string): Promise<GymSessionRow[]> {
    const { data: selfRows, error: selfError } = await supabase
      .from('gym_sessions')
      .select(select)
      .eq('user_id', userId)
      .order('check_in_at', { ascending: false });

    if (selfError) throw selfError;

    let partnerRows: GymSessionRow[] = [];
    if (partnerId) {
      const { data, error: partnerError } = await supabase
        .from('gym_sessions')
        .select(select)
        .eq('user_id', partnerId)
        .order('check_in_at', { ascending: false });

      if (partnerError) throw partnerError;
      partnerRows = (data ?? []) as unknown as GymSessionRow[];
    }

    return [...((selfRows ?? []) as unknown as GymSessionRow[]), ...partnerRows];
  }

  try {
    return await querySessions(SESSION_SELECT_FULL);
  } catch (fullError) {
    console.warn('Full gym_sessions select failed, retrying minimal columns', fullError);
    const rows = await querySessions(SESSION_SELECT_MINIMAL);
    return rows.map((row) => ({
      ...row,
      check_in_url: row.check_in_url ?? null,
      check_out_url: row.check_out_url ?? null,
      earned_pts: row.earned_pts ?? null,
    }));
  }
}

export function useGymData(userId: string | null) {
  const [profile, setProfile] = useState<UserData | null>(null);
  const [partnerProfile, setPartnerProfile] = useState<UserData | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [rewardRequests, setRewardRequests] = useState<RewardRequest[]>([]);
  const [catalog, setCatalog] = useState<RewardCatalogItem[]>([]);
  const [catalogUsingFallback, setCatalogUsingFallback] = useState(false);
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(null);
  const [loading, setLoading] = useState(false);

  const loadData = useCallback(async (options?: { background?: boolean }) => {
    if (!userId) {
      setProfile(null);
      setPartnerProfile(null);
      setSessions([]);
      setRewardRequests([]);
      setCatalog([]);
      setCatalogUsingFallback(false);
      setActiveSession(null);
      return;
    }

    if (!options?.background) {
      setLoading(true);
    }

    try {
      const { data: profileRow, error: profileError } = await supabase
        .from('profiles')
        .select('id, username, display_name, partner_id, approval_code, weekly_mode, points, multiplier, streak_weeks')
        .eq('id', userId)
        .single<ProfileRow>();

      if (profileError) throw profileError;

      const mappedProfile = mapProfile(profileRow);
      setProfile(mappedProfile);

      let partnerId = profileRow.partner_id;
      if (partnerId) {
        const { data: partnerRow, error: partnerError } = await supabase
          .from('profiles')
          .select('id, username, display_name, partner_id, approval_code, weekly_mode, points, multiplier, streak_weeks')
          .eq('id', partnerId)
          .single<ProfileRow>();

        if (partnerError) throw partnerError;
        setPartnerProfile(mapProfile(partnerRow));
      } else {
        setPartnerProfile(null);
      }

      const { data: catalogRows, error: catalogError } = await supabase
        .from('rewards_catalog')
        .select('id, emoji, title, description, cost_points, active')
        .eq('active', true)
        .order('cost_points', { ascending: true });

      if (catalogError) {
        console.error('Failed to load rewards catalog', catalogError);
        toast.error(`Could not load rewards: ${supabaseErrorMessage(catalogError)}`);
        setCatalog(DEFAULT_REWARDS_CATALOG);
        setCatalogUsingFallback(true);
      } else if (!catalogRows?.length) {
        console.warn('rewards_catalog empty — using default catalog');
        setCatalog(DEFAULT_REWARDS_CATALOG);
        setCatalogUsingFallback(true);
      } else {
        setCatalog(catalogRows);
        setCatalogUsingFallback(false);
      }

      try {
        const sessionRows = await fetchGymSessionsForUsers(userId, partnerId);
        const mappedSessions = sessionRows.map(mapSession);
        setSessions(mappedSessions);

        const activeRow = sessionRows.find(
          (row) => row.user_id === userId && isSessionActive(row.status),
        );

        setActiveSession((prev) => {
          if (!activeRow) return null;
          const sameSession = prev?.id === activeRow.id;
          const checkInPhoto =
            activeRow.check_in_url ??
            (sameSession ? prev?.checkInPhoto ?? null : null);
          return {
            id: activeRow.id,
            checkInTime: activeRow.check_in_at,
            checkInPhoto,
          };
        });
      } catch (sessionsError) {
        console.error('Failed to load gym sessions', sessionsError);
        toast.error(`Could not load session history: ${supabaseErrorMessage(sessionsError)}`);
        setSessions([]);
        setActiveSession(null);
      }

      const { data: requestRows, error: requestsError } = await supabase
        .from('redemption_requests')
        .select(`
          id,
          requester_id,
          approver_id,
          reward_id,
          status,
          custom_text,
          points_deducted,
          approved_at,
          created_at,
          rewards_catalog (emoji, title, cost_points)
        `)
        .or(`requester_id.eq.${userId},approver_id.eq.${userId}`)
        .order('approved_at', { ascending: false, nullsFirst: false });

      if (requestsError) {
        console.error('Failed to load redemption requests', requestsError);
        setRewardRequests([]);
      } else {
        setRewardRequests((requestRows ?? []).map(mapRewardRequest));
      }
    } catch (error) {
      console.error('Failed to load gym data', error);
      toast.error(`Failed to load your data: ${supabaseErrorMessage(error)}`);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const checkIn = useCallback(
    async (photo: string | null): Promise<boolean> => {
      if (!userId || !profile) return false;

      if (!photo) {
        toast.error('Please add a check-in photo before starting your session.');
        return false;
      }

      try {
        const date = localDateString(new Date());
        const checkInUrl = await uploadSessionPhoto(userId, date, 'checkin', photo);

        const { data: sessionId, error } = await supabase.rpc('gym_check_in');

        if (error) throw error;
        if (!sessionId || typeof sessionId !== 'string') {
          throw new Error('Check-in did not return a session id');
        }

        const { error: photoError } = await supabase
          .from('gym_sessions')
          .update({ check_in_url: checkInUrl })
          .eq('id', sessionId)
          .eq('user_id', userId);

        if (photoError) throw photoError;

        setActiveSession({
          id: sessionId,
          checkInTime: new Date().toISOString(),
          checkInPhoto: checkInUrl,
        });
        toast.success("📸 Checked in! Let's go 💪");
        await loadData({ background: true });
        return true;
      } catch (error) {
        console.error('Check-in failed', error);
        toast.error(`Check-in failed: ${supabaseErrorMessage(error)}`);
        return false;
      }
    },
    [userId, profile, loadData],
  );

  const checkOut = useCallback(
    async (photo: string | null): Promise<boolean> => {
      if (!userId || !profile || !activeSession) {
        toast.error('No active session found. Please check in first.');
        return false;
      }

      if (!photo) {
        toast.error('Please upload a check-out photo before completing your session.');
        return false;
      }

      if (!activeSession.checkInPhoto) {
        toast.error('Check-in photo missing. Please check in again.');
        return false;
      }

      const elapsedMin = Math.floor(
        (Date.now() - new Date(activeSession.checkInTime).getTime()) / 60000,
      );
      if (elapsedMin < MIN_SESSION_MINS) {
        toast.error(`Keep going! ${MIN_SESSION_MINS - elapsedMin} more minute(s) before you can check out.`);
        return false;
      }

      try {
        const date = localDateString(new Date(activeSession.checkInTime));
        const checkOutUrl = await uploadSessionPhoto(userId, date, 'checkout', photo);

        const { data: result, error } = await supabase.rpc('gym_check_out', {
          p_session_id: activeSession.id,
        });

        if (error) throw error;
        if (!result || typeof result !== 'object') {
          throw new Error('Check-out did not return session details');
        }

        const checkout = result as GymCheckOutResult;

        const { error: photoError } = await supabase
          .from('gym_sessions')
          .update({
            check_in_url: activeSession.checkInPhoto,
            check_out_url: checkOutUrl,
            earned_pts: checkout.earned_pts,
          })
          .eq('id', activeSession.id);

        if (photoError) throw photoError;

        setActiveSession(null);
        toast.success(checkoutToastMessage(checkout));
        await loadData({ background: true });
        return true;
      } catch (error) {
        console.error('Check-out failed', error);
        toast.error(`Check-out failed: ${supabaseErrorMessage(error)}`);
        return false;
      }
    },
    [userId, profile, activeSession, loadData],
  );

  const redeemReward = useCallback(
    async (rewardId: number, costPoints: number): Promise<boolean> => {
      if (!userId || !profile || !profile.partner) return false;

      if (profile.points < costPoints) {
        toast.error('Not enough points to redeem this reward.');
        return false;
      }

      try {
        const { error } = await supabase.rpc('redeem_reward', {
          p_reward_id: rewardId,
          p_points_cost: costPoints,
        });

        if (error) throw error;

        toast.success('Redeemed! 🎉');
        await loadData({ background: true });
        return true;
      } catch (error) {
        console.error('Reward redemption failed', error);
        const message = supabaseErrorMessage(error);
        if (message.toLowerCase().includes('not enough points')) {
          toast.error('Not enough points to redeem this reward.');
        } else {
          toast.error(`Could not redeem reward: ${message}`);
        }
        return false;
      }
    },
    [userId, profile, loadData],
  );

  const approveCouponUse = useCallback(
    async (requestId: string, approvalCode: string): Promise<boolean> => {
      if (!userId || !profile) return false;

      const request = rewardRequests.find((item) => item.id === requestId);
      if (!request || request.status !== 'pending_use') return false;

      try {
        const { error } = await supabase.rpc('approve_redemption_request', {
          p_request_id: requestId,
          p_approval_code: approvalCode,
        });

        if (error) {
          const message = supabaseErrorMessage(error);
          if (message.toLowerCase().includes('invalid approval code')) {
            toast.error('❌ Wrong approval code. Try again.');
          } else {
            toast.error(`Approval failed: ${message}`);
          }
          return false;
        }

        toast.success(`✅ ${request.rewardEmoji} ${request.rewardName} marked as used!`);
        await loadData();
        return true;
      } catch (error) {
        console.error('Coupon approval failed', error);
        toast.error(`Approval failed: ${supabaseErrorMessage(error)}`);
        return false;
      }
    },
    [userId, profile, rewardRequests, loadData],
  );

  const requestCouponUse = useCallback(
    async (requestId: string): Promise<boolean> => {
      if (!userId) return false;

      const request = rewardRequests.find((item) => item.id === requestId);
      if (!request) {
        toast.error('Coupon not found. Please refresh and try again.');
        return false;
      }
      if (request.requesterId !== userId) {
        toast.error('You can only use your own coupons.');
        return false;
      }
      if (request.status !== 'redeemed') {
        toast.error(`This coupon is already ${request.status === 'pending_use' ? 'waiting for approval' : 'used'}.`);
        return false;
      }

      try {
        const { error } = await supabase.rpc('request_coupon_use', {
          p_request_id: requestId,
        });

        if (error) throw error;

        const partnerName = partnerProfile?.displayName ?? 'your partner';
        toast.success(`Waiting for ${partnerName} to approve your coupon use.`);
        await loadData();
        return true;
      } catch (error) {
        console.error('Request coupon use failed', error);
        toast.error(`Could not request coupon use: ${supabaseErrorMessage(error)}`);
        return false;
      }
    },
    [userId, partnerProfile, rewardRequests, loadData],
  );

  const saveSettings = useCallback(
    async (displayName: string, weekMode: 'fixed' | 'rolling', approvalCode: string) => {
      if (!userId) return;

      try {
        const { error } = await supabase
          .from('profiles')
          .update({
            display_name: displayName,
            weekly_mode: weekMode,
            approval_code: approvalCode,
          })
          .eq('id', userId);

        if (error) throw error;

        toast.success('✅ Settings saved!');
        await loadData();
      } catch (error) {
        console.error('Save settings failed', error);
        toast.error('Could not save settings. Please try again.');
      }
    },
    [userId, loadData],
  );

  return {
    profile,
    partnerProfile,
    sessions,
    rewardRequests,
    catalog,
    catalogUsingFallback,
    activeSession,
    loading,
    checkIn,
    checkOut,
    redeemReward,
    approveCouponUse,
    requestCouponUse,
    saveSettings,
    refresh: loadData,
  };
}
