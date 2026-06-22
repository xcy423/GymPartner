import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL ??
  'https://drxdhdevplhoiesqkzhy.supabase.co';

const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_KEY ??
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRyeGRoZGV2cGxob2llc3Fremh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIxMzAwMjYsImV4cCI6MjA5NzcwNjAyNn0.9IfClnX7ZiAhXblOXkYvF4wph7KsD9SlE3gy_6HwaXA';

export const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const EMAIL_MAP: Record<string, string> = {
  codee: 'codee@gympact.app',
  owen: 'owen@gympact.app',
};
