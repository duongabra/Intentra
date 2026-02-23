-- Intentra – Seed Travel (vé máy bay). Chạy SAU schema-travel.sql và seed.sql.
-- Tạo 1 project travel + vài chuyến bay mẫu (HCM, HN, ...).

-- 1. Project travel cho merchant (skip nếu đã có)
insert into public.projects (merchant_id, project_type, name, domain, endpoint, api_key)
select p.id, 'travel', 'Demo Vé máy bay', 'localhost', 'http://localhost:3000/api/agent/chat', 'sk_demo_travel_seed'
from public.profiles p
where p.role = 'merchant'
  and not exists (select 1 from public.projects where merchant_id = p.id and name = 'Demo Vé máy bay')
limit 1;

-- 2. Chuyến bay mẫu (gắn với project travel vừa tạo)
insert into public.travel_listings (project_id, name, from_location, to_location, price, departure_at)
select
  (select id from public.projects where api_key = 'sk_demo_travel_seed' limit 1),
  v.name,
  v.from_loc,
  v.to_loc,
  v.price,
  v.dep_at
from (
  values
    ('Vietnam Airlines VN123', 'Hồ Chí Minh (SGN)', 'Hà Nội (HAN)', 1500000, '08:00 25/02'),
    ('Vietnam Airlines VN456', 'Hà Nội (HAN)', 'Hồ Chí Minh (SGN)', 1400000, '14:00 25/02'),
    ('Vietjet VJ101', 'Hồ Chí Minh (SGN)', 'Hà Nội (HAN)', 890000, '06:30 26/02'),
    ('Vietjet VJ202', 'Hà Nội (HAN)', 'Hồ Chí Minh (SGN)', 920000, '12:00 26/02'),
    ('Bamboo QH301', 'Hồ Chí Minh (SGN)', 'Hà Nội (HAN)', 1100000, '09:15 27/02'),
    ('Vietnam Airlines VN789', 'Hồ Chí Minh (SGN)', 'Đà Nẵng (DAD)', 650000, '10:30 25/02'),
    ('Vietjet VJ303', 'Hà Nội (HAN)', 'Đà Nẵng (DAD)', 700000, '16:00 26/02'),
    ('Vietnam Airlines VN321', 'Đà Nẵng (DAD)', 'Hồ Chí Minh (SGN)', 620000, '11:00 27/02')
) as v(name, from_loc, to_loc, price, dep_at)
where exists (select 1 from public.projects where api_key = 'sk_demo_travel_seed');
