alter table public.profiles enable row level security;

create policy "allow profile insert"
on public.profiles
for insert
with check (auth.uid() = id);


create policy "users can select own profile"
on public.profiles
for select
using (auth.uid() = id);


create policy "users can update own profile"
on public.profiles
for update
using (auth.uid() = id)
with check (auth.uid() = id);
