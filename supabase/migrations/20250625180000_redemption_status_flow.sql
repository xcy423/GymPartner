-- Two-stage redemption flow: redeemed → pending_use → used
-- Points are deducted at redeem time; partner approval marks coupon as used.

-- Migrate legacy statuses before tightening the constraint
update redemption_requests set status = 'redeemed' where status = 'approved';
update redemption_requests set status = 'pending_use' where status = 'pending';

alter table redemption_requests drop constraint if exists redemption_requests_status_check;
alter table redemption_requests add constraint redemption_requests_status_check
  check (status in ('redeemed', 'pending_use', 'used'));

-- Replace old approve_redemption_request (pending → approved + deduct points)
-- with approve_coupon_use (pending_use → used, no point deduction).
drop function if exists approve_redemption_request(uuid, text);

create or replace function approve_coupon_use(
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
begin
  select * into v_request from redemption_requests where id = p_request_id;
  if not found then
    raise exception 'Request not found';
  end if;

  if v_request.status <> 'pending_use' then
    raise exception 'Request is not pending use approval';
  end if;

  if v_request.approver_id <> auth.uid() then
    raise exception 'Not authorized';
  end if;

  select * into v_approver from profiles where id = auth.uid();
  if v_approver.approval_code is distinct from p_approval_code then
    raise exception 'Invalid approval code';
  end if;

  update redemption_requests
    set status = 'used', approved_at = now()
    where id = p_request_id;
end;
$$;

grant execute on function approve_coupon_use(uuid, text) to authenticated;
