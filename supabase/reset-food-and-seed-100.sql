-- Clear food-related data and recreate: 1 project food + 100 products (có project_type).
-- Run in Supabase SQL Editor. Requires: profiles with role 'merchant'.

alter table public.products add column if not exists project_type text not null default 'food';

do $$
declare
  pid uuid;
  mid uuid;
begin
  -- Get or create food project
  select id into pid
  from public.projects
  where project_type = 'food'
  order by created_at desc
  limit 1;

  if pid is null then
    select id into mid from public.profiles where role = 'merchant' limit 1;
    if mid is null then
      raise exception 'No merchant profile. Run seed.sql first (create merchant@demo.com).';
    end if;
    insert into public.projects (merchant_id, project_type, name, domain, endpoint, api_key)
    values (mid, 'food', 'Demo Food Store', 'localhost', 'http://localhost:3000/api/agent/chat', 'sk_demo_seed')
    returning id into pid;
    raise notice 'Created food project %', pid;
  else
    -- Clear data linked to this project (order: children first)
    delete from public.order_items where order_id in (select id from public.orders where project_id = pid);
    delete from public.orders where project_id = pid;
    delete from public.products where project_id = pid;
    raise notice 'Cleared orders and products for project %', pid;
  end if;

  -- Insert 100 food products (project_id + project_type = 'food')
  insert into public.products (project_id, project_type, name, price, category)
  select pid, 'food', v.name, v.price, v.category
  from (values
    ('Gà ta', 85000, 'Thịt'),
    ('Gạo nếp', 25000, 'Gạo & Bột'),
    ('Măng khô', 45000, 'Đồ khô'),
    ('Giò lụa', 120000, 'Đồ chế biến'),
    ('Xôi gấc', 35000, 'Đồ chế biến'),
    ('Gạo tẻ', 22000, 'Gạo & Bột'),
    ('Thịt ba chỉ', 95000, 'Thịt'),
    ('Cá chép', 75000, 'Hải sản'),
    ('Rau muống', 15000, 'Rau'),
    ('Cải bẹ xanh', 18000, 'Rau'),
    ('Hành lá', 12000, 'Rau'),
    ('Rau mùi', 10000, 'Rau'),
    ('Cà chua', 25000, 'Rau'),
    ('Khoai tây', 22000, 'Củ'),
    ('Cà rốt', 20000, 'Củ'),
    ('Củ cải trắng', 18000, 'Củ'),
    ('Nấm hương khô', 35000, 'Đồ khô'),
    ('Miến dong', 28000, 'Đồ khô'),
    ('Bún khô', 15000, 'Đồ khô'),
    ('Mộc nhĩ', 40000, 'Đồ khô'),
    ('Tôm khô', 180000, 'Đồ khô'),
    ('Nước mắm', 45000, 'Gia vị'),
    ('Muối', 8000, 'Gia vị'),
    ('Đường', 22000, 'Gia vị'),
    ('Tiêu', 35000, 'Gia vị'),
    ('Bột ngọt', 18000, 'Gia vị'),
    ('Dầu ăn', 55000, 'Gia vị'),
    ('Hành tím', 30000, 'Củ'),
    ('Tỏi', 35000, 'Củ'),
    ('Gừng', 40000, 'Củ'),
    ('Chanh', 15000, 'Trái cây'),
    ('Ớt tươi', 25000, 'Rau'),
    ('Rau răm', 8000, 'Rau'),
    ('Lá lốt', 12000, 'Rau'),
    ('Bánh tráng', 22000, 'Đồ khô'),
    ('Đậu phụ', 12000, 'Đậu'),
    ('Đậu xanh', 35000, 'Đậu'),
    ('Đậu đen', 28000, 'Đậu'),
    ('Trứng gà', 3500, 'Trứng'),
    ('Trứng vịt', 4500, 'Trứng'),
    ('Thịt gà công nghiệp', 55000, 'Thịt'),
    ('Sườn heo', 110000, 'Thịt'),
    ('Chân giò', 75000, 'Thịt'),
    ('Lạp xưởng', 95000, 'Đồ chế biến'),
    ('Chả cá', 85000, 'Đồ chế biến'),
    ('Nem rán', 70000, 'Đồ chế biến'),
    ('Bánh chưng', 45000, 'Đồ chế biến'),
    ('Bánh tét', 40000, 'Đồ chế biến'),
    ('Dưa hành', 25000, 'Đồ chế biến'),
    ('Củ kiệu', 35000, 'Đồ chế biến'),
    ('Cơm trắng', 10000, 'Đồ chế biến'),
    ('Canh măng', 30000, 'Đồ chế biến'),
    ('Thịt đông', 80000, 'Thịt'),
    ('Cá kho', 65000, 'Hải sản'),
    ('Tôm tươi', 180000, 'Hải sản'),
    ('Mực tươi', 220000, 'Hải sản'),
    ('Cua đồng', 120000, 'Hải sản'),
    ('Rau ngót', 20000, 'Rau'),
    ('Rau dền', 15000, 'Rau'),
    ('Bí xanh', 18000, 'Rau'),
    ('Bí đỏ', 22000, 'Rau'),
    ('Đậu cô ve', 35000, 'Rau'),
    ('Su hào', 15000, 'Củ'),
    ('Cải thảo', 20000, 'Rau'),
    ('Cải bắp', 18000, 'Rau'),
    ('Rau cần', 22000, 'Rau'),
    ('Rau má', 25000, 'Rau'),
    ('Rau diếp', 18000, 'Rau'),
    ('Xà lách', 20000, 'Rau'),
    ('Dưa chuột', 15000, 'Rau'),
    ('Ớt chuông', 45000, 'Rau'),
    ('Cà tím', 22000, 'Rau'),
    ('Đậu bắp', 28000, 'Rau'),
    ('Mướp', 18000, 'Rau'),
    ('Bầu', 15000, 'Rau'),
    ('Chuối xanh', 20000, 'Trái cây'),
    ('Dừa tươi', 25000, 'Trái cây'),
    ('Dứa', 25000, 'Trái cây'),
    ('Xoài', 35000, 'Trái cây'),
    ('Cam', 40000, 'Trái cây'),
    ('Bưởi', 35000, 'Trái cây'),
    ('Chanh dây', 45000, 'Trái cây'),
    ('Dâu tây', 120000, 'Trái cây'),
    ('Nho', 85000, 'Trái cây'),
    ('Táo', 55000, 'Trái cây'),
    ('Lê', 45000, 'Trái cây'),
    ('Sữa tươi', 28000, 'Sữa & Trứng'),
    ('Sữa đặc', 32000, 'Sữa & Trứng'),
    ('Bơ', 95000, 'Sữa & Trứng'),
    ('Phô mai', 65000, 'Sữa & Trứng'),
    ('Sữa chua', 12000, 'Sữa & Trứng'),
    ('Bột chiên giòn', 22000, 'Gạo & Bột'),
    ('Bột năng', 18000, 'Gạo & Bột'),
    ('Bột gạo', 20000, 'Gạo & Bột'),
    ('Bột mì', 25000, 'Gạo & Bột'),
    ('Bún tươi', 18000, 'Đồ tươi'),
    ('Phở tươi', 22000, 'Đồ tươi'),
    ('Bánh phở khô', 25000, 'Đồ khô'),
    ('Mì sợi', 15000, 'Đồ khô'),
    ('Bánh mì', 12000, 'Bánh'),
    ('Bánh bao', 15000, 'Bánh'),
    ('Bánh cuốn', 35000, 'Bánh'),
    ('Bột canh', 15000, 'Gia vị'),
    ('Mắm tôm', 55000, 'Gia vị'),
    ('Tương đen', 35000, 'Gia vị'),
    ('Tương ớt', 18000, 'Gia vị'),
    ('Tương cà', 22000, 'Gia vị'),
    ('Mật ong', 120000, 'Gia vị'),
    ('Mè rang', 40000, 'Gia vị'),
    ('Lạc', 45000, 'Đậu'),
    ('Vừng', 50000, 'Đậu'),
    ('Rượu nấu ăn', 25000, 'Gia vị'),
    ('Dấm', 15000, 'Gia vị'),
    ('Bột nghệ', 35000, 'Gia vị'),
    ('Lá chanh', 10000, 'Rau'),
    ('Sả', 15000, 'Rau'),
    ('Rau húng', 12000, 'Rau'),
    ('Ngò gai', 10000, 'Rau'),
    ('Cần tây', 22000, 'Rau'),
    ('Rau thơm', 15000, 'Rau')
  ) as v(name, price, category);

  raise notice 'Done: 1 food project + 100 products.';
end $$;
