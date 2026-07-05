create table if not exists public.categories (
  user_id uuid not null references auth.users(id) on delete cascade,
  id text not null,
  name text not null,
  type text not null check (type in ('income', 'expense', 'both')),
  color text not null,
  icon text not null,
  custom boolean not null default true,
  created_at timestamptz not null default now(),
  primary key (user_id, id)
);

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  account_type text not null default 'personal' check (account_type in ('personal', 'startup')),
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('income', 'expense')),
  amount numeric(12, 2) not null check (amount > 0),
  category text not null,
  description text,
  date date not null,
  created_at timestamptz not null default now()
);

create table if not exists public.split_people (
  user_id uuid not null references auth.users(id) on delete cascade,
  id text not null,
  name text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, id)
);

create table if not exists public.split_expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  description text not null,
  amount numeric(12, 2) not null check (amount > 0),
  category text,
  paid_by text not null,
  participant_ids text[] not null,
  split_method text not null default 'equal' check (split_method in ('equal', 'percentage', 'custom')),
  shares jsonb not null default '{}'::jsonb,
  date date not null,
  created_at timestamptz not null default now()
);

alter table public.split_expenses
  add column if not exists category text,
  add column if not exists split_method text not null default 'equal',
  add column if not exists shares jsonb not null default '{}'::jsonb;

alter table public.split_expenses
  drop constraint if exists split_expenses_split_method_check;

alter table public.split_expenses
  add constraint split_expenses_split_method_check check (split_method in ('equal', 'percentage', 'custom'));

create index if not exists transactions_user_id_created_at_idx
  on public.transactions (user_id, created_at desc);

create index if not exists split_expenses_user_id_created_at_idx
  on public.split_expenses (user_id, created_at desc);

alter table public.categories enable row level security;
alter table public.profiles enable row level security;
alter table public.transactions enable row level security;
alter table public.split_people enable row level security;
alter table public.split_expenses enable row level security;

drop policy if exists "Users can read their own categories" on public.categories;
create policy "Users can read their own categories"
  on public.categories for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own categories" on public.categories;
create policy "Users can insert their own categories"
  on public.categories for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own categories" on public.categories;
create policy "Users can update their own categories"
  on public.categories for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own categories" on public.categories;
create policy "Users can delete their own categories"
  on public.categories for delete
  using (auth.uid() = user_id);

drop policy if exists "Users can read their own profile" on public.profiles;
create policy "Users can read their own profile"
  on public.profiles for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

insert into public.profiles (user_id, email, account_type)
select id, email, 'startup'
from auth.users
where lower(email) = 'tracking@viewlyt.com'
on conflict (user_id)
do update set
  email = excluded.email,
  account_type = 'startup',
  updated_at = now();

drop policy if exists "Users can read their own transactions" on public.transactions;
create policy "Users can read their own transactions"
  on public.transactions for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own transactions" on public.transactions;
create policy "Users can insert their own transactions"
  on public.transactions for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own transactions" on public.transactions;
create policy "Users can update their own transactions"
  on public.transactions for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own transactions" on public.transactions;
create policy "Users can delete their own transactions"
  on public.transactions for delete
  using (auth.uid() = user_id);

drop policy if exists "Users can read their own split people" on public.split_people;
create policy "Users can read their own split people"
  on public.split_people for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own split people" on public.split_people;
create policy "Users can insert their own split people"
  on public.split_people for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own split people" on public.split_people;
create policy "Users can update their own split people"
  on public.split_people for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own split people" on public.split_people;
create policy "Users can delete their own split people"
  on public.split_people for delete
  using (auth.uid() = user_id);

drop policy if exists "Users can read their own split expenses" on public.split_expenses;
create policy "Users can read their own split expenses"
  on public.split_expenses for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own split expenses" on public.split_expenses;
create policy "Users can insert their own split expenses"
  on public.split_expenses for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own split expenses" on public.split_expenses;
create policy "Users can update their own split expenses"
  on public.split_expenses for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own split expenses" on public.split_expenses;
create policy "Users can delete their own split expenses"
  on public.split_expenses for delete
  using (auth.uid() = user_id);

notify pgrst, 'reload schema';
