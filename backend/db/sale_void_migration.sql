alter table sales
  add column if not exists voided_at timestamptz,
  add column if not exists voided_by bigint references app_users(id) on delete set null,
  add column if not exists void_reason text;

-- Voided sales remain in transaction history and reports as audit records.
-- Their sold quantities are restored through positive "return" stock movements.
select
  s.receipt_no,
  s.status,
  s.voided_at,
  u.name as voided_by,
  s.void_reason
from sales s
left join app_users u on u.id = s.voided_by
where s.status = 'voided'
order by s.voided_at desc;
