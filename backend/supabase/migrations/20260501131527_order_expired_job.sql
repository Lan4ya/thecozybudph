create extension if not exists pg_cron;

-- run every minute
select cron.schedule(
  'expire-orders-job',
  '* * * * *',
  $$
    update orders
    set status = 'expired'
    where status = 'to_pay'
    and expires_at < now();
  $$
);
