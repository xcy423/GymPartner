import type { Session, UserData } from './types';

const now = new Date();
const demoYear = now.getFullYear();
const demoMonth = String(now.getMonth() + 1).padStart(2, '0');
const makeDemoDate = (day: number) => `${demoYear}-${demoMonth}-${String(day).padStart(2, '0')}`;

export const INITIAL_USERS: Record<string, UserData> = {
  codee: {
    username: 'codee',
    password: '050328',
    displayName: 'Codee',
    partner: 'owen',
    approvalCode: 'love2026',
    points: 240,
    multiplier: 1.4,
    weekStreak: 2,
    weekMode: 'fixed',
  },
  owen: {
    username: 'owen',
    password: '041225',
    displayName: 'Owen',
    partner: 'codee',
    approvalCode: 'pact2026',
    points: 180,
    multiplier: 1.2,
    weekStreak: 1,
    weekMode: 'fixed',
  },
};

export const DEMO_SESSIONS: Session[] = [
  // codee - Week 2 (June 8-14): 3 sessions -> streak 1, multiplier -> 1.2
  { id: 's1', userId: 'codee', date: makeDemoDate(9), checkInTime: '09:00', checkOutTime: '10:30', checkInPhoto: null, checkOutPhoto: null, complete: true },
  { id: 's2', userId: 'codee', date: makeDemoDate(11), checkInTime: '08:30', checkOutTime: '10:00', checkInPhoto: null, checkOutPhoto: null, complete: true },
  { id: 's3', userId: 'codee', date: makeDemoDate(13), checkInTime: '07:00', checkOutTime: '08:45', checkInPhoto: null, checkOutPhoto: null, complete: true },
  // codee - Week 3 (June 15-21): requested calendar showcase dates
  { id: 's4', userId: 'codee', date: makeDemoDate(16), checkInTime: '09:00', checkOutTime: '10:30', checkInPhoto: null, checkOutPhoto: null, complete: true },
  { id: 's5', userId: 'codee', date: makeDemoDate(17), checkInTime: '18:00', checkOutTime: '19:10', checkInPhoto: null, checkOutPhoto: null, complete: true },
  { id: 's6', userId: 'codee', date: makeDemoDate(19), checkInTime: '08:00', checkOutTime: '09:30', checkInPhoto: null, checkOutPhoto: null, complete: true },
  // owen - Week 2 (June 8-14): 3 sessions -> streak 1, multiplier -> 1.2
  { id: 's7', userId: 'owen', date: makeDemoDate(10), checkInTime: '10:00', checkOutTime: '11:30', checkInPhoto: null, checkOutPhoto: null, complete: true },
  { id: 's8', userId: 'owen', date: makeDemoDate(12), checkInTime: '09:00', checkOutTime: '10:15', checkInPhoto: null, checkOutPhoto: null, complete: true },
  { id: 's9', userId: 'owen', date: makeDemoDate(14), checkInTime: '08:30', checkOutTime: '10:00', checkInPhoto: null, checkOutPhoto: null, complete: true },
  // owen - Week 3 (June 15-21): requested calendar showcase dates
  { id: 's10', userId: 'owen', date: makeDemoDate(18), checkInTime: '07:30', checkOutTime: '09:00', checkInPhoto: null, checkOutPhoto: null, complete: true },
  { id: 's11', userId: 'owen', date: makeDemoDate(19), checkInTime: '18:10', checkOutTime: '19:20', checkInPhoto: null, checkOutPhoto: null, complete: true },
];
