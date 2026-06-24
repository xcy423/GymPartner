-- Full two-stage redemption RPCs + RLS for GymPartner
-- Run in Supabase SQL Editor if coupon "Use it" does not reach partner.

-- ---------------------------------------------------------------------------
-- 1. Status constraint (all valid values)
-- ---------------------------------------------------------------------------
alter table redemption_requests drop constraint if exists redemption_requests_status_check;
alter table redemption_requests add constraint redemption_requests_status_check
  check (status in ('pending', 'redeemed', 'pending_use', 'used', 'approved'));

-- Normalize legacy rows
update redemption_requests set status = 'redeemed' where status = 'approved';

-- ---------------------------------------------------------------------------
-- 2. redeem_reward — instant redeem (Stage 1)
--    Must insert status = 'redeemed' and approver_id = partner
-- ---------------------------------------------------------------------------
create or replace function redeem_reward(
  p_reward_id bigint,
  p_points_cost integer
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user profiles%rowtype;
  v_request_id uuid;
begin
  select * into v_user from profiles where id = auth.uid();
  if not found then
    raise exception 'Profile not found';
  end if;

  if v_user.partner_id is null then
    raise exception 'No partner linked';
  end if;

  if coalesce(v_user.points, 0) < p_points_cost then
    raise exception 'Not enough points';
  end if;

  update profiles
    set points = greatest(0, coalesce(v_user.points, 0) - p_points_cost)
    where id = auth.uid();

  insert into redemption_requests (
    requester_id,
    approver_id,
    reward_id,
    status,
    points_deducted,
    custom_text
  ) values (
    auth.uid(),
    v_user.partner_id,
    p_reward_id,
    'redeemed',
    p_points_cost,
    null
  )
  returning id into v_request_id;

  return v_request_id;
end;
$$;

grant execute on function redeem_reward(bigint, integer) to authenticated;

-- ---------------------------------------------------------------------------
-- 3. request_coupon_use — user confirms "Use it" (Stage 2)
--    Accepts 'redeemed' OR legacy 'approved' in DB
-- ---------------------------------------------------------------------------
create or replace function request_coupon_use(
  p_request_id uuid
) returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_request redemption_requests%rowtype;
begin
  select * into v_request from redemption_requests where id = p_request_id;
  if not found then
    raise exception 'Request not found';
  end if;

  if v_request.requester_id <> auth.uid() then
    raise exception 'Not authorized';
  end if;

  if v_request.status not in ('redeemed', 'approved') then
    raise exception 'Coupon is not available to use (status: %)', v_request.status;
  end if;

  if v_request.approver_id is null then
    raise exception 'No approver linked on this coupon';
  end if;

  update redemption_requests
    set status = 'pending_use'
    where id = p_request_id;
end;
$$;

grant execute on function request_coupon_use(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- 4. approve_redemption_request — partner approves (Stage 3)
--    pending_use → used (no point deduction; points already taken at redeem)
--    pending → approved + deduct points (legacy flow)
-- ---------------------------------------------------------------------------
create or replace function approve_redemption_request(
  p_request_id uuid,
  p_approval_code text
) returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_request redemption_requests%rowtype;
  v_approver profiles%rowtype;
  v_requester profiles%rowtype;
begin
  select * into v_request from redemption_requests where id = p_request_id;
  if not found then
    raise exception 'Request not found';
  end if;

  if v_request.approver_id <> auth.uid() then
    raise exception 'Not authorized';
  end if;

  if v_request.status not in ('pending', 'pending_use') then
    raise exception 'Request is not pending approval (status: %)', v_request.status;
  end if;

  select * into v_approver from profiles where id = auth.uid();
  if v_approver.approval_code is distinct from p_approval_code then
    raise exception 'Invalid approval code';
  end if;

  if v_request.status = 'pending_use' then
    update redemption_requests
      set status = 'used', approved_at = now()
      where id = p_request_id;
    return;
  end if;

  -- Legacy: pending → approved + deduct points
  select * into v_requester from profiles where id = v_request.requester_id;

  update profiles
    set points = greatest(0, coalesce(v_requester.points, 0) - coalesce(v_request.points_deducted, 0))
    where id = v_request.requester_id;

  update redemption_requests
    set status = 'approved', approved_at = now()
    where id = p_request_id;
end;
$$;

grant execute on function approve_redemption_request(uuid, text) to authenticated;

-- ---------------------------------------------------------------------------
-- 5. RLS — both partners must READ rows; RPCs handle writes
-- ---------------------------------------------------------------------------
alter table redemption_requests enable row level security;

drop policy if exists "Users read own redemption requests" on redemption_requests;
drop policy if exists "Users read partner redemption requests" on redemption_requests;
drop policy if exists "Users see own and partner redemption requests" on redemption_requests;

create policy "Users see own and partner redemption requests"
  on redemption_requests
  for select
  to authenticated
  using (
    requester_id = auth.uid()
    or approver_id = auth.uid()
  );
