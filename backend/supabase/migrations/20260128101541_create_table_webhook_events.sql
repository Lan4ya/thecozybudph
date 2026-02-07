create table webhook_events (
  id uuid default gen_random_uuid() primary key,
  provider_event_id text not null unique,
  provider text not null,
  payload jsonb not null,
  created_at timestamptz default now()
);
