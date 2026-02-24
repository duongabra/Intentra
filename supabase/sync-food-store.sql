-- Đồng bộ router merchant/food-store với project food trong DB.
-- Chạy trong Supabase SQL Editor.
-- Yêu cầu: Có ít nhất 1 project với project_type = 'food'.

-- Bước 1: Gán tất cả sản phẩm vào project food (lấy project food mới nhất).
UPDATE public.products
SET project_id = sub.id
FROM (
  SELECT id FROM public.projects
  WHERE project_type = 'food'
  ORDER BY created_at DESC
  LIMIT 1
) AS sub
WHERE public.products.project_id IS DISTINCT FROM sub.id;

-- Bước 2 (tùy chọn): Nếu muốn đổi tên project thành "Demo Food Store" cho thống nhất:
-- UPDATE public.projects SET name = 'Demo Food Store' WHERE project_type = 'food' AND name <> 'Demo Food Store';

-- Kiểm tra nhanh: số sản phẩm thuộc project food
SELECT p.id AS project_id, p.name AS project_name, p.project_type, COUNT(pr.id) AS product_count
FROM public.projects p
LEFT JOIN public.products pr ON pr.project_id = p.id
WHERE p.project_type = 'food'
GROUP BY p.id, p.name, p.project_type;
