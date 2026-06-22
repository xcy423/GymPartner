export type TabName = 'home' | 'rewards' | 'calendar' | 'settings';

export interface Session {
  id: string;
  userId: string;
  date: string;
  checkInTime: string;
  checkOutTime: string | null;
  checkInPhoto: string | null;
  checkOutPhoto: string | null;
  complete: boolean;
}

export interface RewardRequest {
  id: string;
  requesterId: string;
  rewardId: string;
  rewardName: string;
  rewardCost: number;
  status: 'pending' | 'approved' | 'used';
  requestedAt?: string;
  approvedAt?: string;
  usedAt?: string;
}

export interface UserData {
  username: string;
  password: string;
  displayName: string;
  partner: string;
  approvalCode: string;
  points: number;
  multiplier: number;
  weekStreak: number;
  weekMode: 'fixed' | 'rolling';
}

export interface ActiveSession {
  checkInTime: string;
  checkInPhoto: string | null;
}
