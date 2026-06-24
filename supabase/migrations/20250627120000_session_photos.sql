-- Session photos bucket + earned_pts on gym_sessions

alter table gym_sessions add column if not exists earned_pts integer default 0;

insert into storage.buckets (id, name, public)
values ('session-photos', 'session-photos', true)
on conflict (id) do nothing;

drop policy if exists "Users upload own session photos" on storage.objects;
create policy "Users upload own session photos"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'session-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Users update own session photos" on storage.objects;
create policy "Users update own session photos"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'session-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'session-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Anyone can view session photos" on storage.objects;
create policy "Anyone can view session photos"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'session-photos');

drop policy if exists "Users update own gym session photos" on gym_sessions;
create policy "Users update own gym session photos"
  on gym_sessions for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
