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

interface RedemptionRequestRow {
  id: string;
  requester_id: string;
  approver_id: string;
  reward_id: string;
  status: 'pending' | 'approved' | 'used';
  custom_text: string | null;
  points_deducted: number | null;
  approved_at: string | null;
  rewards_catalog?: {
    emoji: string;
    title: string;
    cost_points: number;
  } | null;
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
    date: checkIn.toISOString().split('T')[0],
    checkInTime: formatTime(checkIn),
    checkOutTime: checkOut ? formatTime(checkOut) : null,
    checkInPhoto: row.check_in_url,
    checkOutPhoto: row.check_out_url,
    complete: row.status === 'complete',
  };
}

function mapRewardRequest(row: RedemptionRequestRow): RewardRequest {
  return {
    id: row.id,
    requesterId: row.requester_id,
    rewardId: row.reward_id,
    rewardName: row.rewards_catalog?.title ?? row.reward_id,
    rewardEmoji: row.rewards_catalog?.emoji ?? '🎁',
    rewardCost: row.rewards_catalog?.cost_points ?? row.points_deducted ?? 0,
    status: row.status,
    approvedAt: row.approved_at ?? undefined,
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
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(null);
  const [loading, setLoading] = useState(false);

  const loadData = useCallback(async () => {
    if (!userId) {
      setProfile(null);
      setPartnerProfile(null);
      setSessions([]);
      setRewardRequests([]);
      setActiveSession(null);
      return;
    }

    setLoading(true);

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
          rewards_catalog (emoji, title, cost_points)
        `)
        .or(`requester_id.eq.${userId},approver_id.eq.${userId}`)
        .order('approved_at', { ascending: false, nullsFirst: false });

      if (requestsError) throw requestsError;
      setRewardRequests((requestRows ?? []).map(mapRewardRequest));
    } catch (error) {
      console.error('Failed to load gym data', error);
      toast.error('Failed to load your data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const checkIn = useCallback(
    async (photo: string | null) => {
      if (!userId || !profile) return;

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
        await loadData();
      } catch (error) {
        console.error('Check-in failed', error);
        toast.error('Check-in failed. Please try again.');
      }
    },
    [userId, profile, loadData],
  );

  const checkOut = useCallback(
    async (photo: string | null) => {
      if (!userId || !profile || !activeSession) return;

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

        const nextSessions = [
          ...sessions,
          {
            id: activeRow.id,
            userId,
            date: now.toISOString().split('T')[0],
            checkInTime: formatTime(checkInAt),
            checkOutTime: formatTime(now),
            checkInPhoto: activeSession.checkInPhoto,
            checkOutPhoto: checkOutUrl,
            complete: true,
          },
        ];

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

        setActiveSession(null);
        toast.success(msg);
        await loadData();
      } catch (error) {
        console.error('Check-out failed', error);
        toast.error('Check-out failed. Please try again.');
      }
    },
    [userId, profile, activeSession, sessions, loadData],
  );

  const requestReward = useCallback(
    async (rewardId: string, rewardName: string, rewardEmoji: string, rewardCost: number) => {
      if (!userId || !profile || !profile.partner) return;

      const exists = rewardRequests.find(
        (request) =>
          request.requesterId === userId &&
          request.rewardId === rewardId &&
          request.status === 'pending',
      );

      if (exists) {
        toast.info('Already requested — waiting for approval!');
        return;
      }

      try {
        const { error } = await supabase.from('redemption_requests').insert({
          requester_id: userId,
          approver_id: profile.partner,
          reward_id: rewardId,
          status: 'pending',
          custom_text: null,
          points_deducted: rewardCost,
        });

        if (error) throw error;

        const partnerName = partnerProfile?.displayName ?? 'your partner';
        toast.success(`✨ Reward requested! Waiting for ${partnerName} to approve.`);
        await loadData();
      } catch (error) {
        console.error('Reward request failed', error);
        toast.error('Could not request reward. Please try again.');
      }
    },
    [userId, profile, partnerProfile, rewardRequests, loadData],
  );

  const approveReward = useCallback(
    async (requestId: string, approvalCode: string): Promise<boolean> => {
      if (!userId || !profile) return false;

      const request = rewardRequests.find((item) => item.id === requestId);
      if (!request) return false;

      if (profile.approvalCode !== approvalCode) {
        toast.error('❌ Wrong approval code. Try again.');
        return false;
      }

      try {
        const requesterProfile = request.requesterId === userId ? profile : partnerProfile;
        if (!requesterProfile) return false;

        const nextPoints = Math.max(0, requesterProfile.points - request.rewardCost);

        const { error: requesterError } = await supabase
          .from('profiles')
          .update({ points: nextPoints })
          .eq('id', request.requesterId);

        if (requesterError) throw requesterError;

        const { error: requestError } = await supabase
          .from('redemption_requests')
          .update({
            status: 'approved',
            approved_at: new Date().toISOString(),
            points_deducted: request.rewardCost,
          })
          .eq('id', requestId);

        if (requestError) throw requestError;

        toast.success(`✅ ${request.rewardEmoji} ${request.rewardName} approved and redeemed!`);
        await loadData();
        return true;
      } catch (error) {
        console.error('Reward approval failed', error);
        toast.error('Approval failed. Please try again.');
        return false;
      }
    },
    [userId, profile, partnerProfile, rewardRequests, loadData],
  );

  const useCoupon = useCallback(
    async (requestId: string): Promise<boolean> => {
      if (!userId) return false;

      const request = rewardRequests.find((item) => item.id === requestId);
      if (!request || request.requesterId !== userId || request.status !== 'approved') {
        return false;
      }

      try {
        const { error } = await supabase
          .from('redemption_requests')
          .update({ status: 'used' })
          .eq('id', requestId);

        if (error) throw error;

        toast.success('Coupon marked as used!');
        await loadData();
        return true;
      } catch (error) {
        console.error('Use coupon failed', error);
        toast.error('Could not mark coupon as used.');
        return false;
      }
    },
    [userId, rewardRequests, loadData],
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
    activeSession,
    loading,
    checkIn,
    checkOut,
    requestReward,
    approveReward,
    useCoupon,
    saveSettings,
    refresh: loadData,
  };
}
