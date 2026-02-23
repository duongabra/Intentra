-- Cho phép user đã đăng nhập đọc đúng 1 row profile của mình (để lấy role, redirect sau login).
-- Chạy trong SQL Editor sau schema.sql.

alter table public.profiles enable row level security;

create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);
