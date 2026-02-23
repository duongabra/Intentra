# Intentra Demo – Supabase Setup

## Bước 1: Tạo bảng (Schema)

1. Vào [Supabase Dashboard](https://supabase.com/dashboard) → chọn project (hoặc tạo mới).
2. Vào **SQL Editor** → **New query**.
3. Copy toàn bộ nội dung file `schema.sql` và paste vào, rồi bấm **Run**.

## Bước 2: Tạo 2 tài khoản Auth

1. Vào **Authentication** → **Users** → **Add user** → **Create new user**.
2. Tạo user 1:
   - Email: `merchant@demo.com`
   - Password: (đặt mật khẩu, nhớ để login)
   - Create user
3. Tạo user 2:
   - Email: `user@demo.com`
   - Password: (đặt mật khẩu, nhớ để login)
   - Create user

## Bước 3: Chạy Seed

1. Vào **SQL Editor** → **New query**.
2. Copy toàn bộ nội dung file `seed.sql` và paste vào, rồi bấm **Run**.

Seed sẽ:

- Gắn `profiles` cho 2 user (role `merchant` / `user`) từ `auth.users`.
- Tạo 1 project **Demo Food Store** (type `food`) cho merchant.
- Thêm **100 sản phẩm đồ ăn** vào project đó.
- Tạo **wallet** cho user với số dư **10,000,000 VND**.

## Bước 3b (tuỳ chọn): Travel – Vé máy bay

Để mai chạy trang mua vé máy bay:

1. **SQL Editor** → chạy `schema-travel.sql` (tạo bảng `travel_listings`, `order_ticket_items`).
2. **SQL Editor** → chạy `seed-travel.sql` (tạo project **Demo Vé máy bay** với key `sk_demo_travel_seed` + vài chuyến bay mẫu).

Sau đó trong `.env.local` thêm (để trang travel-demo gửi đúng key):

```env
NEXT_PUBLIC_DEMO_MERCHANT_API_KEY_FLIGHT=sk_demo_travel_seed
```

## Bước 4: RLS cho profiles (để login đọc được role)

1. **SQL Editor** → **New query**.
2. Copy nội dung file `rls-profiles.sql` và chạy.

Sau bước này, client sau khi đăng nhập mới đọc được bảng `profiles` (chỉ row của chính user đó).

## Bước 5: API key cho từng loại project (mỗi project 1 key)

Đặt trong `.env.local`, mở rộng sau này thêm _FLIGHT, _HOTEL, _TOUR, ...

- **Đồ ăn:** `NEXT_PUBLIC_DEMO_MERCHANT_API_KEY_FOOD=sk_demo_seed` (hoặc key do merchant tạo từ Dashboard).
- **Vé máy bay:** `NEXT_PUBLIC_DEMO_MERCHANT_API_KEY_FLIGHT=sk_demo_travel_seed` (sau khi chạy seed-travel.sql).

Merchant tạo project mới từ Dashboard → nhận **một API key riêng** → copy vào biến tương ứng (FOOD / FLIGHT / ...) rồi restart server.

## Lưu ý

- Nếu đã chạy seed rồi chạy lại, một số câu lệnh dùng `on conflict do update` nên không bị lỗi trùng; products có thể bị thêm trùng nếu chạy seed nhiều lần (nên xóa data hoặc bỏ qua bước insert products khi đã có đủ 100 sản phẩm).
- Email trong seed **phải đúng** `merchant@demo.com` và `user@demo.com`; nếu dùng email khác thì sửa trong `seed.sql` cho khớp.
