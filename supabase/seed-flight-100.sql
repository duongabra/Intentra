-- 100 chuyến bay: thời gian random đầu tháng 3 → cuối tháng 3, địa điểm random trên lãnh thổ VN.
-- Tự tạo bảng travel_listings nếu chưa có. Cần đã chạy schema.sql (projects, profiles). Có thể chạy độc lập.

-- Ensure travel_listings exists (from schema-travel.sql)
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

do $$
declare
  pid uuid;
  mid uuid;
  i int;
  from_loc text;
  to_loc text;
  locs text[] := array[
    'Hồ Chí Minh (SGN)', 'Hà Nội (HAN)', 'Đà Nẵng (DAD)', 'Nha Trang (CXR)',
    'Cần Thơ (VCA)', 'Huế (HUI)', 'Phú Quốc (PQC)', 'Hải Phòng (HPH)',
    'Đà Lạt (DLI)', 'Vinh (VII)', 'Chu Lai (VCL)', 'Cà Mau (CAH)'
  ];
  d date;
  dep_at text;
  price int;
  airline text;
  airlines text[] := array['Vietnam Airlines', 'Vietjet', 'Bamboo', 'Vietravel'];
begin
  select id into pid from public.projects where project_type = 'travel' order by created_at desc limit 1;
  if pid is null then
    select id into mid from public.profiles where role = 'merchant' limit 1;
    if mid is null then raise exception 'No merchant profile. Run seed.sql first.'; end if;
    insert into public.projects (merchant_id, project_type, name, domain, endpoint, api_key)
    values (mid, 'travel', 'Demo Vé máy bay', 'localhost', 'http://localhost:3000/api/agent/chat', 'sk_demo_travel_seed')
    returning id into pid;
  end if;

  delete from public.travel_listings where project_id = pid;

  for i in 1..100 loop
    from_loc := locs[1 + floor(random()*array_length(locs,1))::int];
    loop
      to_loc := locs[1 + floor(random()*array_length(locs,1))::int];
      exit when to_loc <> from_loc;
    end loop;
    d := date '2026-03-01' + (floor(random()*31)::int);
    dep_at := to_char(d, 'DD/MM/YYYY') || ' ' || lpad((6+floor(random()*16))::text,2,'0') || ':' || lpad(floor(random()*60)::text,2,'0');
    price := 450000 + floor(random()*2100000)::int;
    airline := airlines[1 + floor(random()*array_length(airlines,1))::int];
    insert into public.travel_listings (project_id, name, from_location, to_location, price, departure_at)
    values (pid, airline || ' ' || from_loc || ' → ' || to_loc, from_loc, to_loc, price, dep_at);
  end loop;

  raise notice 'Inserted 100 flights for project %', pid;
end $$;
