🚀 IMPLEMENTATION PLAN
Project Name: Intentra (Demo Localhost)

📌 Phase 1: Chỉ làm web bán đồ ăn (food). Thiết kế DB + API + folder để sau này dễ thêm vertical khác (vd: web đặt vé du lịch).

**Implementation status**
| Phần | Nội dung | Status |
|------|----------|--------|
| 1 | Khởi tạo dự án (Next.js 14, TS, Tailwind, folder, .env.example) | ✅ Done |
| 2 | Database: schema.sql + seed.sql (Supabase), 2 user, 100 products, wallet 10M | ✅ Done |
| 3 | Lib + Types: supabase client, types, wallet (đơn giản: getBalance, deduct), grok skeleton | ✅ Done |
| 4 | Auth + Login, redirect theo role | ✅ Done |
| 5 | API: POST /api/projects/create, POST /api/agent/chat | ✅ Done |
| 6 | Merchant Dashboard | ✅ Done |
| 7 | User chat (food-demo / trang chung, intent tự chọn project) | ✅ Done |
| 8 | Widget nhúng script (popup chat cho web của khách, dùng API key) | TODO – làm khi thừa thời gian |

I. Tech Stack
Frontend + Backend

Next.js 14 (App Router)

TypeScript

TailwindCSS

API Routes (NextJS BE layer)

Database + Auth

Supabase (Auth + Postgres)

AI Provider

Grok API (key lưu trong .env.local)

II. Environment Variables (.env.local)
- Server (API, DB): SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
- Client (login): NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY (cùng giá trị với SUPABASE_*)
- Grok: GROK_API_KEY=sk_xxxxx
- **Chat chỉ ở trang của mình (Intentra):** User không chat trên trang của từng merchant. Trang mình là trung gian: user chat → backend **tự phân tích intent** (đồ ăn vs vé máy bay) → chọn project tương ứng → không cần client gửi API key. (Nếu có gửi x-api-key thì vẫn dùng key để chọn project – cho tích hợp bên ngoài sau này.)
- API key mỗi project: dùng khi tích hợp bên ngoài (vd merchant gọi API với key của họ) hoặc để xác định đơn thuộc merchant nào; **không bắt buộc** cho chat trên trang Intentra.

👉 Xem .env.local.example trong repo.
III. Database Schema (Supabase)
1️⃣ profiles
id uuid (PK, auth.users.id)
email text
role text -- 'user' | 'merchant'
created_at timestamp
2️⃣ projects
id uuid PK
merchant_id uuid
project_type text -- 'food' | 'travel' (sau này). Phase 1 chỉ dùng 'food'
name text
domain text
endpoint text
api_key text
created_at timestamp
3️⃣ products (mock 100 food items – dùng cho project_type = 'food')
id uuid
project_id uuid
name text
price integer
category text
created_at timestamp
4️⃣ wallets
id uuid
user_id uuid (unique)
balance integer
created_at, updated_at timestamptz

👉 Demo: user mặc định có 10,000,000 VND. Wallet đơn giản: chỉ lưu balance trong DB, mỗi lần mua thì update balance (trừ tiền), không logic phức tạp. Lib: getBalance(userId), deduct(userId, amount).

5️⃣ orders
id uuid
user_id uuid
project_id uuid
total_amount integer
status text
created_at timestamp
6️⃣ order_items
id uuid
order_id uuid
product_id uuid -- Phase 1: food. Sau có thể thêm ticket_id (nullable) cho travel
quantity integer
price integer
-- 💡 Mở rộng: sau có thể thêm item_type text ('product'|'ticket') hoặc bảng order_tickets riêng

IV. Account Setup (đã có trong supabase/)
1. Chạy supabase/schema.sql trong SQL Editor.
2. Tạo 2 user trong Supabase Auth: merchant@demo.com, user@demo.com.
3. Chạy supabase/seed.sql → tạo profiles (role merchant/user), 1 project "Demo Food Store" (api_key sk_demo_seed), 100 sản phẩm food, wallet 10M cho user.

👉 Chi tiết: supabase/README.md

V. Frontend Screens (CHI TIẾT)
1️⃣ Login Page /login
UI gồm:

Email

Password

Button Login

Sau login:

Query profile.role

Nếu merchant → redirect /dashboard

Nếu user → redirect /home (trang chủ user: list stores + nút Let’s chat now)

2️⃣ Merchant Dashboard /dashboard

Chỉ hiển thị nếu role = merchant

A. Section: Create Website
Form gồm:

Website Name (input)

Domain (input)

API Endpoint (readonly: http://localhost:3000/api/agent/chat
)

Description (textarea)

Button: Create Project

B. Khi Submit

Frontend gọi:

POST /api/projects/create
C. Sau khi tạo thành công

Hiển thị:

Your API Key:
sk_demo_xxxxx

Nút Copy

D. Section: Project List

Hiển thị list project: Name, Domain, Type, API Key, Created At, nút **Xóa** (gọi DELETE /api/projects/[id]). GET /api/projects (Bearer token) để lấy danh sách.

3️⃣ User flow (sau login role = user)
- **/home:** Trang chủ – list các trang đã tạo (stores: bán đồ ăn, bán vé máy bay). Bấm vào store → /store/[id]. Nút **Let’s chat now** → /food-demo.
- **/store/[id]:** Trang bán hàng bình thường (catalog: products hoặc tickets). Chưa có widget chat; sau thêm widget thì popup chat góc phải. CTA "Đặt hàng qua chat" → /food-demo.
- **/food-demo:** Trang chat (ví + chat). Layout: left wallet balance, right chat + input + Gửi.

B. Chat Behavior

User nhập:

"Tôi cần nguyên liệu nấu mâm cơm cúng gia tiên ngày Tết"

Frontend gọi:

POST /api/agent/chat
Body: { "message": "...", "userId": "..." }
Headers: **Không cần** x-api-key khi chat trên trang Intentra – backend tự phân tích intent (đồ ăn / vé máy bay) và chọn project. (Gửi x-api-key nếu muốn cố định project, vd tích hợp bên ngoài.)
VI. Backend APIs (CHI TIẾT FLOW)
1️⃣ POST /api/projects/create
Flow:

Check user role = merchant

Nhận body: name, domain, description, project_type (mặc định 'food' – Phase 1 chỉ dùng food)

Generate API key:

const apiKey = "sk_demo_" + crypto.randomBytes(16).toString("hex")

Insert vào projects (gồm project_type để sau mở rộng travel)

Trả về apiKey

2️⃣ POST /api/agent/chat
(Flow dưới là cho project_type = 'food'. Sau thêm travel: cùng endpoint, phân nhánh theo project → load catalog + prompt tương ứng.)

Step 1 – Validate API Key (multi-merchant)
Lấy x-api-key từ header. Query: select * from projects where api_key = $key. Nếu không có → 401. Có thì lấy project.id và project_type. Mỗi key trong DB đều hợp lệ (không so với env).

Step 2 – Lấy products theo project (food)
Query: select * from products where project_id = $projectId limit 100. Mỗi merchant có catalog riêng.
Step 3 – Build Prompt gửi Grok

Prompt gồm:

User message

Danh sách sản phẩm

Yêu cầu trả JSON:

[
  { "product_id": "...", "quantity": 2 }
]
Step 4 – Gọi Grok
POST https://api.x.ai/v1/chat/completions (OpenAI-compatible). Lib: lib/grok.ts chatWithGrok(messages). Authorization: Bearer GROK_API_KEY. Model: grok-3-mini hoặc tương đương.
Step 5 – Parse AI Response

AI trả:

[
  { "product_id": "1", "quantity": 2 },
  { "product_id": "5", "quantity": 1 }
]
Step 6 – Tính tổng tiền

Loop products:

total = price * quantity
Step 7 – Trừ tiền Wallet
Dùng lib/wallet.ts: deduct(userId, total). Nếu đủ tiền thì update wallets (balance = balance - total), trả về remaining_balance; không đủ thì trả lỗi, không tạo order.
Step 8 – Tạo Order

Insert vào:

orders

order_items

Step 9 – Trả Response
{
  "items": [...],
  "total": 250000,
  "remaining_balance": 9750000,
  "message": "Đã tạo đơn thành công"
}
VII. Demo Scenario (Full Flow)
Use case:

User nhập:

"Tôi cần nguyên liệu làm mâm cơm cúng gia tiên ngày Tết gồm gà luộc, xôi, canh măng, giò chả"

Flow:

User gửi chat

API validate key

Lấy 100 sản phẩm mock

Gửi sang Grok

Grok chọn:

Gà ta

Gạo nếp

Măng khô

Giò lụa

Backend tính tổng

Trừ tiền mock 10 triệu

Tạo order

Trả kết quả ra UI

UI hiển thị:

Danh sách nguyên liệu

Tổng tiền

Số dư còn lại

VIII. Folder Structure (đã tạo)
/app
  /login, /dashboard
  /home, /store/[id], /food-demo   ← User: home (list stores) → store (catalog) hoặc chat
  /api/projects, /api/projects/create, /api/projects/[id]   ← GET list, POST create, DELETE
  /api/agent/chat, /api/stores, /api/stores/[id], /api/wallet

/lib
  supabase.ts         ← supabase (anon, client + server), supabaseAdmin (service role, API only)
  grok.ts             ← getGrokApiKey(), chatWithGrok(messages)
  wallet.ts           ← getBalance(userId), deduct(userId, amount) – đơn giản, chỉ update DB
  /agent/prompts/food.ts, /agent/catalog/getFoodProducts.ts   ← Part 5 sẽ implement

/types
  index.ts            ← Profile, Project, Product, Wallet, Order, OrderItem, AgentChatItem, AgentChatResponse

/supabase
  schema.sql          ← Tạo bảng (profiles, projects, products, wallets, orders, order_items)
  seed.sql            ← Profiles từ auth.users, 1 project, 100 products, wallet 10M
  rls-profiles.sql    ← RLS: user đọc được profile của mình (để login lấy role) – chạy sau seed
  README.md           ← Hướng dẫn chạy schema + tạo user + seed + RLS
IX. Extensibility – Mở rộng cho vertical khác (vd: Đặt vé du lịch)
Mục tiêu: Phase 1 chỉ làm food; code và DB đặt nền để sau thêm web đặt vé du lịch (hoặc vertical khác) mà không đụng chạm nhiều.

1️⃣ Database
- projects.project_type: luôn lưu 'food' | 'travel'. Mọi query project nên filter theo type khi cần.
- products: chỉ dùng cho food. Khi thêm travel → tạo bảng mới (vd: travel_listings hoặc tickets) với project_id, thông tin vé/tour, giá, ngày, v.v.
- order_items: giữ product_id cho food. Khi có travel có thể:
  - Thêm cột ticket_id (nullable) + item_type ('product'|'ticket'), hoặc
  - Tạo bảng order_ticket_items riêng và giữ order_items chỉ cho product.
- wallets, orders: dùng chung cho mọi vertical (user trừ tiền, đơn chung).

2️⃣ Backend API
- POST /api/agent/chat: một endpoint duy nhất.
  - **Có x-api-key:** lấy project theo key (cho widget nhúng / tích hợp bên ngoài).
  - **Không có x-api-key (chat trên trang Intentra):** phân tích intent từ message (food/travel) → lấy project theo project_type.
  - Theo project_type:
    - food: lấy products, build prompt food, parse JSON [{ product_id, quantity }], tạo order + order_items.
    - travel (sau): lấy travel_listings/tickets, build prompt travel, parse JSON khác (vd: [{ ticket_id, quantity }]), tạo order + order_ticket_items hoặc mở rộng order_items.
  - Logic trừ wallet + tạo order chung; chỉ phần “lấy catalog” và “parse AI response” khác theo type.
- POST /api/projects/create: khi tạo project, gửi kèm project_type (mặc định 'food'). Sau form “Create Website” có thể thêm dropdown Loại: Đồ ăn / Du lịch.

3️⃣ Frontend
- **User:** Login → /home. Trang home: list stores (GET /api/stores), link /store/[id]; nút “Let’s chat now” → /food-demo. Trang /store/[id]: catalog (products hoặc tickets từ GET /api/stores/[id]), CTA “Đặt hàng qua chat” → /food-demo. Trang /food-demo: ví + chat.
- **Dashboard:** Project list có cột “Loại” (Food / Travel) và nút **Xóa** (DELETE /api/projects/[id]). Form tạo project có field project_type.
- Component: tách phần “Chat + kết quả đơn” thành component dùng chung (message, items, total, remaining_balance); mỗi vertical chỉ khác cách hiển thị danh sách (sản phẩm vs vé/tour).

4️⃣ AI / Grok
- Mỗi vertical một prompt template (và format JSON output) riêng:
  - food: input = user message + list products → output [{ product_id, quantity }].
  - travel (sau): input = user message + list tickets/tours → output format phù hợp (vd: [{ ticket_id, quantity }] hoặc [{ listing_id, passengers }]).
- Lưu template trong /lib/agent/prompts/food.ts (và sau travel.ts), không hardcode trong route.

5️⃣ Tóm tắt checklist khi thêm Travel sau này
- [ ] Thêm bảng travel_listings (hoặc tickets) với project_id.
- [ ] projects: đảm bảo project_type đã có, seed/migration set đúng.
- [ ] POST /api/projects/create: nhận project_type (frontend gửi).
- [ ] /lib/agent: thêm getTravelListings(), prompts/travel.ts, format response travel.
- [ ] POST /api/agent/chat: nhánh if project_type === 'travel' (load catalog travel, prompt travel, parse + tạo đơn vé).
- [ ] order_items mở rộng hoặc thêm bảng order_ticket_items.
- [ ] Frontend: trang /travel-demo, dashboard hiển thị loại project, form tạo project có Loại.

X. Important Demo Notes
- Không cần deploy; chạy localhost.
- Không cần RLS phức tạp; API dùng supabaseAdmin (service role) khi cần.
- Phân quyền FE: check profile.role sau login, redirect merchant → /dashboard, user → /home. User từ /home vào từng store (/store/[id]) hoặc bấm Let’s chat now → /food-demo.
- Merchant API key: generate thật khi tạo project (sk_demo_ + hex). Demo có thể dùng sk_demo_seed (từ seed).
- Grok API key: lấy từ .env GROK_API_KEY; endpoint api.x.ai/v1/chat/completions.
- Mock 100 sản phẩm: đã seed trong supabase/seed.sql.
- Wallet: mock 10 triệu trong DB (wallets.balance); mỗi lần mua chỉ trừ DB, đơn giản.

XI. Final Result Khi Demo Cho Sếp
- Login merchant → Dashboard → Tạo project (Đồ ăn / Vé máy bay) → Hệ thống generate API key (merchant copy để sau nhúng widget).
- Login user → Chat trên trang Intentra → Backend **tự phân intent** (đồ ăn vs vé máy bay) → chọn project → AI chọn sản phẩm/vé → Trừ ví → Tạo order.
- **Không cần** điền API key vào env cho chat trên trang mình. API key dùng khi merchant nhúng widget vào web của họ (Step 8).

XII. Widget nhúng script (Step 8 – làm khi thừa thời gian)
- Mục đích: Merchant lấy **một đoạn script** (từ Dashboard) nhúng vào website của họ → hiện **popup chat**. User chat trên site của merchant → đơn về đúng project của merchant.
- **Cần API key:** Script được cấu hình với **API key** của project (vd `data-api-key="sk_demo_xxx"` hoặc `IntentraChat.init({ apiKey: '...' })`). Mỗi request từ widget gửi header `x-api-key` → backend biết project.
- Deliverable: File script (vd `/public/embed/chat.js` hoặc route `/embed/chat.js`) + snippet copy trong Dashboard. Khi có thời gian thì implement.

---
**Hiện trạng:** Part 1–7 ✅. Part 8 (widget nhúng) TODO – làm khi thừa thời gian.