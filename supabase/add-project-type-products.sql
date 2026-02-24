-- Add project_type to products (đồng bộ với projects, phân biệt food/travel cho 5 web demo).
-- Chạy trong Supabase SQL Editor nếu bảng products đã tồn tại.

alter table public.products
  add column if not exists project_type text not null default 'food';

alter table public.products
  drop constraint if exists products_project_type_check;

alter table public.products
  add constraint products_project_type_check check (project_type in ('food', 'travel'));

-- Đồng bộ: cập nhật project_type từ project cha
update public.products p
set project_type = pr.project_type
from public.projects pr
where p.project_id = pr.id and p.project_type is distinct from pr.project_type;
