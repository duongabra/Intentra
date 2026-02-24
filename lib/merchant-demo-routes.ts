/**
 * Config for merchant demo pages (static list shown on Home).
 * Add more entries when you create new pages under app/merchant/.
 */
export const MERCHANT_DEMO_ROUTES = [
  { name: "Demo Food Store", href: "/merchant/food-store", typeLabel: "Đồ ăn" },
  { name: "Demo Vé máy bay", href: "/merchant/flight-store", typeLabel: "Vé máy bay" },
] as const;
