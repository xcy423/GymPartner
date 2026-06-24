import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import type { ActiveSession, RewardRequest, UserData } from '../app/App';
import type { Session } from './sessionUtils';
import { getWeekSessions } from './sessionUtils';
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
  status: 'active' | 'complete';
  duration_mins: number | null;
}

export interface RewardCatalogItem {
  id: number;
  emoji: string;
  title: string;
  description: string;
  cost_points: number;
  active: boolean;
}

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
  } | null;
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

function localDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
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
    complete: row.status === 'complete',
  };
}

function mapRewardRequest(row: RedemptionRequestRow): RewardRequest {
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
    rewardName: row.rewards_catalog?.title ?? String(row.reward_id),
    rewardEmoji: row.rewards_catalog?.emoji ?? '🎁',
    rewardCost: row.rewards_catalog?.cost_points ?? row.points_deducted ?? 0,
    status,
    redeemedAt: row.created_at ?? undefined,
    usedAt: status === 'used' ? (row.approved_at ?? undefined) : undefined,
  };
}

async function uploadPhoto(userId: string, photo: string | null, kind: 'check-in' | 'check-out'): Promise<string | null> {
  if (!photo) return null;
  if (photo.startsWith('http://') || photo.startsWith('https://')) return photo;

  const blob = await fetch(photo).then((response) => response.blob());
  const path = `${userId}/${Date.now()}-${kind}.jpg`;
  const { error } = await supabase.storage.from('gym-proofs').upload(path, blob, {
    contentType: blob.type || 'image/jpeg',
    upsert: false,
  });

  if (error) throw error;

  const { data } = supabase.storage.from('gym-proofs').getPublicUrl(path);
  return data.publicUrl;
}

export function useGymData(userId: string | null) {
  const [profile, setProfile] = useState<UserData | null>(null);
  const [partnerProfile, setPartnerProfile] = useState<UserData | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [rewardRequests, setRewardRequests] = useState<RewardRequest[]>([]);
  const [catalog, setCatalog] = useState<RewardCatalogItem[]>([]);
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(null);
  const [loading, setLoading] = useState(false);

  const loadData = useCallback(async (options?: { background?: boolean }) => {
    if (!userId) {
      setProfile(null);
      setPartnerProfile(null);
      setSessions([]);
      setRewardRequests([]);
      setCatalog([]);
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

      const userIds = partnerId ? [userId, partnerId] : [userId];

      const { data: sessionRows, error: sessionsError } = await supabase
        .from('gym_sessions')
        .select('id, user_id, check_in_at, check_out_at, check_in_url, check_out_url, status, duration_mins')
        .in('user_id', userIds)
        .order('check_in_at', { ascending: false });

      if (sessionsError) throw sessionsError;

      const mappedSessions = (sessionRows ?? []).map(mapSession);
      setSessions(mappedSessions);

      const activeRow = (sessionRows ?? []).find(
        (row) => row.user_id === userId && row.status === 'active',
      );

      setActiveSession(
        activeRow
          ? {
              checkInTime: activeRow.check_in_at,
              checkInPhoto: activeRow.check_in_url,
            }
          : null,
      );

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

      if (requestsError) throw requestsError;
      setRewardRequests((requestRows ?? []).map(mapRewardRequest));

      const { data: catalogRows, error: catalogError } = await supabase
        .from('rewards_catalog')
        .select('id, emoji, title, description, cost_points, active')
        .eq('active', true)
        .order('cost_points', { ascending: true });

      if (catalogError) throw catalogError;
      setCatalog(catalogRows ?? []);
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

      try {
        const checkInUrl = await uploadPhoto(userId, photo, 'check-in');
        const now = new Date().toISOString();

        const { error } = await supabase.from('gym_sessions').insert({
          user_id: userId,
          check_in_at: now,
          check_in_url: checkInUrl,
          status: 'active',
        });

        if (error) throw error;

        setActiveSession({ checkInTime: now, checkInPhoto: checkInUrl });
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

      const elapsedMin = Math.floor(
        (Date.now() - new Date(activeSession.checkInTime).getTime()) / 60000,
      );
      if (elapsedMin < 60) {
        toast.error(`Keep going! ${60 - elapsedMin} more minute(s) before you can check out.`);
        return false;
      }

      try {
        const { data: activeRow, error: activeError } = await supabase
          .from('gym_sessions')
          .select('id, check_in_at')
          .eq('user_id', userId)
          .eq('status', 'active')
          .maybeSingle<{ id: string; check_in_at: string }>();

        if (activeError) throw activeError;
        if (!activeRow) throw new Error('No active session found');

        const checkOutUrl = await uploadPhoto(userId, photo, 'check-out');
        const now = new Date();
        const checkInAt = new Date(activeRow.check_in_at);
        const durationMins = Math.floor((now.getTime() - checkInAt.getTime()) / 60000);

        const { error: updateError } = await supabase
          .from('gym_sessions')
          .update({
            check_out_at: now.toISOString(),
            check_out_url: checkOutUrl,
            status: 'complete',
            duration_mins: durationMins,
          })
          .eq('id', activeRow.id);

        if (updateError) throw updateError;

        const completedSession: Session = {
          id: activeRow.id,
          userId,
          date: localDateString(checkInAt),
          checkInTime: formatTime(checkInAt),
          checkOutTime: formatTime(now),
          checkInPhoto: activeSession.checkInPhoto,
          checkOutPhoto: checkOutUrl,
          complete: true,
        };

        const nextSessions = [...sessions.filter((s) => s.id !== activeRow.id), completedSession];

        const weekCount = getWeekSessions(nextSessions, userId, profile.weekMode);
        let pts = 0;
        let msg = '✅ Session complete!';

        if (weekCount === 3) {
          pts = Math.round(100 * profile.multiplier);
          msg = `🎯 3 sessions this week! +${pts} pts earned!`;
        } else if (weekCount === 5) {
          pts = Math.round(150 * profile.multiplier);
          msg = `⭐ 5 sessions this week! Bonus +${pts} pts!`;
        } else if (weekCount < 3) {
          msg = `✅ Session done! ${3 - weekCount} more to earn points this week!`;
        }

        if (pts > 0) {
          const { error: pointsError } = await supabase
            .from('profiles')
            .update({ points: profile.points + pts })
            .eq('id', userId);

          if (pointsError) throw pointsError;
        }

        setSessions(nextSessions);
        setActiveSession(null);
        toast.success(msg);
        await loadData({ background: true });
        return true;
      } catch (error) {
        console.error('Check-out failed', error);
        toast.error(`Check-out failed: ${supabaseErrorMessage(error)}`);
        return false;
      }
    },
    [userId, profile, activeSession, sessions, loadData],
  );

  const redeemReward = useCallback(
    async (rewardId: number, costPoints: number) => {
      if (!userId || !profile || !profile.partner) return;

      const catalogItem = catalog.find((item) => item.id === rewardId);
      if (!catalogItem) {
        toast.error('Reward not found.');
        return;
      }

      if (profile.points < costPoints) {
        toast.error('Not enough points to redeem this reward.');
        return;
      }

      try {
        const { error } = await supabase.rpc('redeem_reward', {
          p_reward_id: rewardId,
          p_points_cost: costPoints,
        });

        if (error) throw error;

        toast.success(`🎟️ ${catalogItem.emoji} ${catalogItem.title} redeemed! Check your Tickets tab.`);
        await loadData();
      } catch (error) {
        console.error('Reward redemption failed', error);
        const message = supabaseErrorMessage(error);
        if (message.toLowerCase().includes('not enough points')) {
          toast.error('Not enough points to redeem this reward.');
        } else {
          toast.error(`Could not redeem reward: ${message}`);
        }
      }
    },
    [userId, profile, catalog, loadData],
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
