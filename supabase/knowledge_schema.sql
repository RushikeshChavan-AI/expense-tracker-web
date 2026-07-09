create table if not exists public.knowledge_spaces (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text not null default '',
  color text not null default 'gold' check (color in ('gold', 'emerald', 'violet', 'coral')),
  sort_order integer not null default 0,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.knowledge_documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  space_id uuid references public.knowledge_spaces(id) on delete set null,
  title text not null default 'Untitled document',
  content text not null default '',
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  tags text[] not null default '{}'::text[],
  attachment_names text[] not null default '{}'::text[],
  pinned boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists knowledge_spaces_user_id_archived_at_idx
  on public.knowledge_spaces (user_id, archived_at, sort_order, created_at);

create index if not exists knowledge_documents_user_id_updated_at_idx
  on public.knowledge_documents (user_id, updated_at desc);

create index if not exists knowledge_documents_space_id_updated_at_idx
  on public.knowledge_documents (space_id, updated_at desc);

create index if not exists knowledge_documents_tags_idx
  on public.knowledge_documents using gin (tags);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_knowledge_spaces_updated_at on public.knowledge_spaces;
create trigger set_knowledge_spaces_updated_at
  before update on public.knowledge_spaces
  for each row
  execute function public.set_updated_at();

drop trigger if exists set_knowledge_documents_updated_at on public.knowledge_documents;
create trigger set_knowledge_documents_updated_at
  before update on public.knowledge_documents
  for each row
  execute function public.set_updated_at();

alter table public.knowledge_spaces enable row level security;
alter table public.knowledge_documents enable row level security;

drop policy if exists "Users can read their own knowledge spaces" on public.knowledge_spaces;
create policy "Users can read their own knowledge spaces"
  on public.knowledge_spaces for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own knowledge spaces" on public.knowledge_spaces;
create policy "Users can insert their own knowledge spaces"
  on public.knowledge_spaces for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own knowledge spaces" on public.knowledge_spaces;
create policy "Users can update their own knowledge spaces"
  on public.knowledge_spaces for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own knowledge spaces" on public.knowledge_spaces;
create policy "Users can delete their own knowledge spaces"
  on public.knowledge_spaces for delete
  using (auth.uid() = user_id);

drop policy if exists "Users can read their own knowledge documents" on public.knowledge_documents;
create policy "Users can read their own knowledge documents"
  on public.knowledge_documents for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own knowledge documents" on public.knowledge_documents;
create policy "Users can insert their own knowledge documents"
  on public.knowledge_documents for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own knowledge documents" on public.knowledge_documents;
create policy "Users can update their own knowledge documents"
  on public.knowledge_documents for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own knowledge documents" on public.knowledge_documents;
create policy "Users can delete their own knowledge documents"
  on public.knowledge_documents for delete
  using (auth.uid() = user_id);

notify pgrst, 'reload schema';
