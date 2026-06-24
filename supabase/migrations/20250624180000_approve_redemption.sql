-- Approve a pending redemption request, deduct points, and mark approved.
-- Runs as SECURITY DEFINER so the approver can deduct the requester's points
-- without needing direct UPDATE access to the partner's profile row.

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

  if v_request.status <> 'pending' then
    raise exception 'Request is not pending';
  end if;

  if v_request.approver_id <> auth.uid() then
    raise exception 'Not authorized';
  end if;

  select * into v_approver from profiles where id = auth.uid();
  if v_approver.approval_code is distinct from p_approval_code then
    raise exception 'Invalid approval code';
  end if;

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

-- Ensure 'used' is a valid redemption status for coupon flow
alter table redemption_requests drop constraint if exists redemption_requests_status_check;
alter table redemption_requests add constraint redemption_requests_status_check
  check (status in ('pending', 'approved', 'used'));
