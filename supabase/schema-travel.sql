-- Intentra – Travel vertical (vé máy bay). Chạy SAU schema.sql trong SQL Editor.

-- 7. travel_listings (vé/chuyến bay theo project)
create table if not exists public.travel_listings (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  name text not null,
  from_location text not null,
  to_location text not null,
  price integer not null check (price >= 0),
  departure_at text,
  created_at timestamptz not null default now()
);

create index if not exists idx_travel_listings_project_id on public.travel_listings(project_id);

-- 8. order_ticket_items (đơn vé – travel)
create table if not exists public.order_ticket_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  listing_id uuid not null references public.travel_listings(id) on delete cascade,
  quantity integer not null check (quantity > 0),
  price integer not null check (price >= 0),
  created_at timestamptz not null default now()
);

create index if not exists idx_order_ticket_items_order_id on public.order_ticket_items(order_id);
