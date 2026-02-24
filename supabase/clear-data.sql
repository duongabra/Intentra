-- Clear all app data (keep auth.users). Run in Supabase SQL Editor.
-- After running: create 2 users in Auth (merchant@demo.com, user@demo.com), then run seed.sql, then seed-food-100.sql.

do $$
begin
  delete from public.order_items;
  delete from public.order_ticket_items;
exception when undefined_table then null;
end $$;
do $$
begin
  delete from public.orders;
  delete from public.products;
  delete from public.travel_listings;
exception when undefined_table then null;
end $$;
delete from public.wallets;
delete from public.projects;
delete from public.profiles;
