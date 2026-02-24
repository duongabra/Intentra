-- Intentra Demo – Database Schema (Supabase)
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New query)

-- Enable UUID extension if not exists
create extension if not exists "uuid-ossp";

-- 1. profiles (id = auth.users.id)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role text not null check (role in ('user', 'merchant')),
  created_at timestamptz not null default now()
);

-- 2. projects
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  merchant_id uuid not null references public.profiles(id) on delete cascade,
  project_type text not null default 'food' check (project_type in ('food', 'travel')),
  name text not null,
  domain text,
  endpoint text,
  api_key text,
  is_hidden boolean not null default false,
  created_at timestamptz not null default now()
);

-- 3. products (food catalog; project_type đồng bộ với projects, dùng cho merchant demo)
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  project_type text not null default 'food' check (project_type in ('food', 'travel')),
  name text not null,
  price integer not null check (price >= 0),
  category text not null,
  created_at timestamptz not null default now()
);

-- 4. wallets
create table if not exists public.wallets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade unique,
  balance integer not null default 0 check (balance >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 5. orders
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  total_amount integer not null check (total_amount >= 0),
  status text not null default 'completed',
  created_at timestamptz not null default now()
);

-- 6. order_items
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  quantity integer not null check (quantity > 0),
  price integer not null check (price >= 0),
  created_at timestamptz not null default now()
);

-- Indexes for common queries
create index if not exists idx_projects_merchant_id on public.projects(merchant_id);
create index if not exists idx_products_project_id on public.products(project_id);
create index if not exists idx_wallets_user_id on public.wallets(user_id);
create index if not exists idx_orders_user_id on public.orders(user_id);
create index if not exists idx_orders_project_id on public.orders(project_id);
create index if not exists idx_order_items_order_id on public.order_items(order_id);

-- Optional: RLS (plan says keep simple; enable if you want)
-- alter table public.profiles enable row level security;
-- alter table public.projects enable row level security;
-- ...
