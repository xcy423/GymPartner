import { useEffect, useState, useCallback } from 'react'
import { supabase } from './supabase'

export interface Profile {
  id: string
  username: string
  display_name: string
  partner_id: string
  approval_code: string
  weekly_mode: 'fixed' | 'rolling'
  points: number
  multiplier: number
  streak_weeks: number
}

export interface GymSession {
  id: string
  user_id: string
  check_in_at: string
  check_out_at: string | null
  check_in_url: string | null
  check_out_url: string | null
  status: 'active' | 'complete'
  duration_mins: number | null
  created_at: string
}

export interface RewardCatalogItem {
  id: number
  emoji: string
  title: string
  description: string
  cost_points: number
  active: boolean
}

export interface RedemptionRequest {
  id: string
  requester_id: string
  approver_id: string
  reward_id: number
  status: 'pending' | 'approved'
  custom_text: string | null
  points_deducted: number
  approved_at: string | null
  created_at: string
  reward?: RewardCatalogItem
  requester?: Profile
}

export function useGymData(currentUserId: string | null) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [partnerProfile, setPartnerProfile] = useState<Profile | null>(null)
  const [sessions, setSessions] = useState<GymSession[]>([])
  const [rewardRequests, setRewardRequests] = useState<RedemptionRequest[]>([])
  const [catalog, setCatalog] = useState<RewardCatalogItem[]>([])

  const fetchProfiles = useCallback(async () => {
    if (!currentUserId) return
    const { data: me } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', currentUserId)
      .single()
    if (!me) return
    setProfile(me)

    if (me.partner_id) {
      const { data: partner } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', me.partner_id)
        .single()
      if (partner) setPartnerProfile(partner)
    }
  }, [currentUserId])

  const fetchSessions = useCallback(async () => {
    if (!currentUserId) return
    const { data: me } = await supabase
      .from('profiles')
      .select('partner_id')
      .eq('id', currentUserId)
      .single()
    const ids = [currentUserId, me?.partner_id].filter(Boolean)
    const { data } = await supabase
      .from('gym_sessions')
      .select('*')
      .in('user_id', ids)
      .order('check_in_at', { ascending: false })
    setSessions(data ?? [])
  }, [currentUserId])

  const fetchRequests = useCallback(async () => {
    if (!currentUserId) return
    const { data } = await supabase
      .from('redemption_requests')
      .select('*, reward:rewards_catalog(*), requester:profiles!requester_id(*)')
      .or(`requester_id.eq.${currentUserId},approver_id.eq.${currentUserId}`)
      .order('created_at', { ascending: false })
    setRewardRequests((data as RedemptionRequest[]) ?? [])
  }, [currentUserId])

  const fetchCatalog = useCallback(async () => {
    const { data } = await supabase
      .from('rewards_catalog')
      .select('*')
      .eq('active', true)
      .order('cost_points', { ascending: true })
    setCatalog(data ?? [])
  }, [])

  useEffect(() => { fetchProfiles() }, [fetchProfiles])
  useEffect(() => { fetchSessions() }, [fetchSessions])
  useEffect(() => { fetchRequests() }, [fetchRequests])
  useEffect(() => { fetchCatalog() }, [fetchCatalog])

  // Real-time subscriptions
  useEffect(() => {
    if (!currentUserId) return
    const channel = supabase
      .channel('gym-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'gym_sessions' }, fetchSessions)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'redemption_requests' }, fetchRequests)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, fetchProfiles)
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [currentUserId, fetchSessions, fetchRequests, fetchProfiles])

  const checkIn = async (photoUrl: string | null) => {
    if (!currentUserId) return
    await supabase.from('gym_sessions').insert({
      user_id: currentUserId,
      check_in_at: new Date().toISOString(),
      check_in_url: photoUrl,
      status: 'active',
    })
    await fetchSessions()
  }

  const checkOut = async (sessionId: string, photoUrl: string | null) => {
    const checkOutAt = new Date().toISOString()
    const session = sessions.find(s => s.id === sessionId)
    const durationMins = session
      ? Math.round((new Date(checkOutAt).getTime() - new Date(session.check_in_at).getTime()) / 60000)
      : null

    await supabase.from('gym_sessions').update({
      check_out_at: checkOutAt,
      check_out_url: photoUrl,
      status: 'complete',
      duration_mins: durationMins,
    }).eq('id', sessionId)

    // Award points based on weekly session count
    if (profile) {
      const weekStart = getWeekStart(profile.weekly_mode)
      const weekSessions = sessions.filter(
        s => s.user_id === currentUserId &&
          s.status === 'complete' &&
          s.check_in_at >= weekStart
      ).length + 1 // +1 for the session just completed

      let pts = 0
      if (weekSessions === 3) pts = Math.round(100 * profile.multiplier)
      else if (weekSessions === 5) pts = Math.round(150 * profile.multiplier)

      if (pts > 0) {
        await supabase.from('profiles').update({
          points: profile.points + pts
        }).eq('id', currentUserId)
      }
    }
    await fetchSessions()
    await fetchProfiles()
  }

  const requestReward = async (rewardId: number, costPoints: number) => {
    if (!currentUserId || !profile?.partner_id) return
    const exists = rewardRequests.find(
      r => r.requester_id === currentUserId && r.reward_id === rewardId && r.status === 'pending'
    )
    if (exists) return
    await supabase.from('redemption_requests').insert({
      requester_id: currentUserId,
      approver_id: profile.partner_id,
      reward_id: rewardId,
      status: 'pending',
      points_deducted: costPoints,
    })
    await fetchRequests()
  }

  const approveReward = async (requestId: string, approvalCode: string): Promise<boolean> => {
    if (!profile || profile.approval_code !== approvalCode) return false
    const req = rewardRequests.find(r => r.id === requestId)
    if (!req) return false

    const requesterProfile = req.requester
    if (!requesterProfile) return false

    await supabase.from('profiles').update({
      points: Math.max(0, requesterProfile.points - req.points_deducted)
    }).eq('id', req.requester_id)

    await supabase.from('redemption_requests').update({
      status: 'approved',
      approved_at: new Date().toISOString(),
    }).eq('id', requestId)

    await fetchRequests()
    await fetchProfiles()
    return true
  }

  const saveSettings = async (displayName: string, weekMode: 'fixed' | 'rolling', approvalCode: string) => {
    if (!currentUserId) return
    await supabase.from('profiles').update({
      display_name: displayName,
      weekly_mode: weekMode,
      approval_code: approvalCode,
    }).eq('id', currentUserId)
    await fetchProfiles()
  }

  return {
    profile,
    partnerProfile,
    sessions,
    rewardRequests,
    catalog,
    checkIn,
    checkOut,
    requestReward,
    approveReward,
    saveSettings,
    refetch: { fetchSessions, fetchRequests, fetchProfiles },
  }
}

function getWeekStart(mode: 'fixed' | 'rolling'): string {
  const today = new Date()
  if (mode === 'rolling') {
    const d = new Date(today)
    d.setDate(d.getDate() - 6)
    d.setHours(0, 0, 0, 0)
    return d.toISOString()
  }
  const d = new Date(today)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d.toISOString()
}
