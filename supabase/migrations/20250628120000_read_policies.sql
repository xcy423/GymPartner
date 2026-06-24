-- Allow authenticated users to read rewards catalog and partner gym sessions

alter table rewards_catalog enable row level security;

drop policy if exists "Authenticated read active rewards" on rewards_catalog;
create policy "Authenticated read active rewards"
  on rewards_catalog for select to authenticated
  using (active = true);

alter table gym_sessions enable row level security;

drop policy if exists "Users read own and partner sessions" on gym_sessions;
create policy "Users read own and partner sessions"
  on gym_sessions for select to authenticated
  using (
    user_id = auth.uid()
    or user_id = (select partner_id from profiles where id = auth.uid())
    or user_id in (select id from profiles where partner_id = auth.uid())
  );
