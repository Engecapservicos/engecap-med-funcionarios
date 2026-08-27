-- Engecap M.O. — rode no SQL Editor do Supabase
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  role text not null check (role in ('admin','engenheiro','apontador')),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.obras (
  id uuid primary key default gen_random_uuid(),
  codigo text,
  nome text not null,
  cliente text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.funcionarios (
  id uuid primary key default gen_random_uuid(),
  chapa text unique not null,
  nome text not null,
  funcao text not null,
  active boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists public.csv_uploads (
  id uuid primary key default gen_random_uuid(),
  uploaded_by uuid references public.profiles(id),
  filename text,
  rows_ok int default 0,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.obras enable row level security;
alter table public.funcionarios enable row level security;
alter table public.csv_uploads enable row level security;

create policy "profiles self" on public.profiles
  for select using (auth.uid() = id or exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
  ));

create policy "obras logged" on public.obras
  for select using (auth.role() = 'authenticated');

create policy "obras admin write" on public.obras
  for all using (exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
  ));

create policy "func logged" on public.funcionarios
  for select using (auth.role() = 'authenticated');

create policy "func admin write" on public.funcionarios
  for all using (exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','engenheiro')
  ));

create policy "csv admin" on public.csv_uploads
  for all using (exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','engenheiro')
  ));

-- Quando criar usuário no Auth, gera profile
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'role','apontador'))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
