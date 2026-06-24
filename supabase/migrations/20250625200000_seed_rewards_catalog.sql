-- Seed the 3 reward tiers (safe to re-run: skips if rows already exist).
insert into rewards_catalog (emoji, title, description, cost_points, active)
select '💌', 'Handwritten letter', 'A heartfelt letter or cute small surprise gift.', 200, true
where not exists (select 1 from rewards_catalog where cost_points = 200);

insert into rewards_catalog (emoji, title, description, cost_points, active)
select '🍳', 'Home-cooked meal', 'Pick your favourite dish and I''ll cook it just for you.', 1000, true
where not exists (select 1 from rewards_catalog where cost_points = 1000);

insert into rewards_catalog (emoji, title, description, cost_points, active)
select '⭐', 'Your custom wish', 'Name literally anything you want as your reward.', 2000, true
where not exists (select 1 from rewards_catalog where cost_points = 2000);
