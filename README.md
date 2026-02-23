# Intentra

AI Agent Commerce Platform – Product Specification (MVP Demo)

## Implementation status (MVP)

- **Done:** Next.js 14, Supabase (auth, DB), Login, Merchant Dashboard (tạo project, list project, copy API key, **xóa project**), API agent chat (food + travel), intent-based routing (chat không cần gửi API key). **User flow:** login → **/home** (list các store: bán đồ ăn, vé máy bay) → bấm store → **/store/[id]** (catalog), hoặc nút **Let’s chat now** → **/food-demo** (trang chat + ví). API: GET /api/stores, GET /api/stores/[id], GET /api/wallet, DELETE /api/projects/[id].
- **TODO:** Part 8 – **Widget nhúng script** (popup chat cho web của khách, dùng API key) – làm khi thừa thời gian.

Chi tiết từng bước: **IMPLEMENTATION PLAN.md**.

---

1. Executive Summary
We are building a two-sided AI Commerce Platform that enables:
* Users to complete purchases through natural language chat
* Merchants to integrate their websites as AI-accessible commerce endpoints
Instead of navigating multiple websites manually, users can simply describe what they need.
The AI agent understands the intent, selects relevant products from integrated partner websites, and completes the transaction automatically.
For the MVP demo, the system includes integrated payment capability (simulated wallet balance), demonstrating instant transaction execution after chat confirmation.
2. Problem Statement
User Problem
Modern users are overloaded with digital tasks.
To complete simple actions such as:

* Buying groceries

* Ordering event supplies

* Purchasing clothes

* Booking travel

* Restocking household essentials

They must manually:

* Visit multiple websites

* Search and compare products

* Add items to cart

* Fill out repetitive forms

* Enter shipping details

* Enter payment information

* Complete checkout processes

This workflow is repetitive, time-consuming, and cognitively demanding.
Each website requires users to learn a different interface, navigate different layouts, and repeat the same steps again and again.
Even simple purchases become multi-step processes.
As a result:

* Time is wasted

* Decision fatigue increases

* Transactions are often delayed or abandoned

Users do not want to operate interfaces.
They want outcomes.
They want to express intent once and have the task completed for them.
The core problem is not access to products —

it is the friction between intention and execution.
3. Solution Overview
We provide an AI Agent Orchestration Layer that connects:
* Users (via chat interface)
* Merchant platforms (via structured APIs)
The system interprets user intent and programmatically executes transactions on integrated websites.
Users interact once.
The system handles the execution.
4. Platform Structure (Two-Sided System)
* **Chat only on Intentra:** Users do not chat on each merchant’s site. Intentra is the middleman: user chats on our page → we infer intent (e.g. food vs flight) → we select the right project and complete the order.
* **API key per project:** Generated when a merchant creates a project. Used when the merchant later embeds our chat widget on their own website (script + API key), so orders are attributed to their project.
The platform supports two account types:
4.1 User Account (Consumer View)
Users can:
* View supported merchant websites
* Chat with the AI agent
* Review order confirmations
* Manage payment method
* Track order history
* View wallet balance
Integrated Payment Concept
Each user account includes:
* Linked payment method (e.g., credit card)
* Available wallet balance (demo version)
* Automatic payment deduction upon order confirmation
In the demo version:
* Users start with a preloaded balance (e.g., 10,000,000 VND equivalent)
* When an order is created, the system automatically deducts the corresponding amount
* The transaction is reflected instantly in the account balance
This simulates real payment integration.
In production, this would connect to actual payment gateways.
4.2 Merchant Account (Business View)
Merchants can:
* Create and manage projects
* Register their website domain
* Enable AI access to product listings
* View AI-generated orders
* Monitor transaction logs
* Track revenue from AI-driven sales
Merchants integrate their platform through structured endpoints such as:
* Product listing endpoint
* Order creation endpoint
This transforms their website into an AI-operable commerce service.
5. Core User Flow (Demo Scenario)
1. User logs into the platform.
2. User sees **home** with a list of stores (e.g. bán đồ ăn, bán vé máy bay). Can open a store to view catalog or click **Let’s chat now** to open chat.
3. User enters a natural language request in chat:
   “Prepare ingredients for a traditional family ceremony.”
4. The AI agent:
   * Interprets intent
   * Retrieves products from the integrated merchant
   * Selects relevant items
   * Calculates total cost
5. The system confirms the order summary.
6. Upon confirmation:
   * Order is created
   * Payment is automatically processed
   * User wallet balance is updated
7. Order appears in:
   * User order history
   * Merchant dashboard
This demonstrates end-to-end automated commerce execution.
6. Payment Integration (Conceptual Design)
For MVP demo:
* Simulated wallet balance
* Automatic deduction on purchase
* Transaction record stored
For production:
* Real payment gateway integration
* Credit card processing
* Secure tokenized payment methods
* Settlement and merchant payout logic
The architecture is designed to support real payment infrastructure in future phases.
7. Value Proposition
For Users
* One unified chat interface
* No manual browsing
* Instant checkout
* Automatic payment processing
* Reduced cognitive load
* Faster task completion
For Merchants
* AI-driven transaction channel
* Reduced checkout friction
* Higher conversion probability
* Structured integration
* Access to conversational commerce users
8. MVP Scope
Included:
* Two account types (User + Merchant)
* Integrated chat interface (on Intentra – backend infers intent: food vs travel)
* Multi vertical: food + travel (project_type), mỗi project một API key
* AI-based product/ticket selection
* Automatic order creation
* Integrated payment simulation (wallet)
* Wallet balance tracking
* Dashboard monitoring (create project, list project, copy API key)
Not included (future phases):
* **Embed widget** (script nhúng popup chat vào web của merchant – dùng API key) – planned as final step when time allows
* Multi-tenant scaling
* Real payment gateway integration
* Advanced analytics
* Subscription billing
* Enterprise onboarding tools
9. Strategic Positioning
This platform is not just a chatbot.
It is:
* An AI commerce infrastructure layer
* A programmable transaction engine
* A new distribution channel for merchants
* A productivity layer for consumers
As AI agents become mainstream,
commerce will shift from browsing interfaces to expressing intent.
This system positions us at the center of that transition.
 
 
