// Database entity types (match Supabase schema)

export type ProfileRole = "user" | "merchant";
export type ProjectType = "food" | "travel";

export interface Profile {
  id: string;
  email: string;
  role: ProfileRole;
  created_at: string;
}

export interface Project {
  id: string;
  merchant_id: string;
  project_type: ProjectType;
  name: string;
  domain: string | null;
  endpoint: string | null;
  api_key: string | null;
  created_at: string;
}

export interface Product {
  id: string;
  project_id: string;
  name: string;
  price: number;
  category: string;
  created_at: string;
}

export interface Wallet {
  id: string;
  user_id: string;
  balance: number;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  project_id: string;
  total_amount: number;
  status: string;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  created_at: string;
}

export interface TravelListing {
  id: string;
  project_id: string;
  name: string;
  from_location: string;
  to_location: string;
  price: number;
  departure_at: string | null;
  created_at: string;
}

export interface OrderTicketItem {
  id: string;
  order_id: string;
  listing_id: string;
  quantity: number;
  price: number;
  created_at: string;
}

// API: agent chat
export interface AgentChatItem {
  product_id: string;
  quantity: number;
}

export interface AgentTravelItem {
  listing_id: string;
  quantity: number;
}

export interface AgentChatResponse {
  items?: Array<{ product_id: string; quantity: number; name?: string; price?: number }>;
  tickets?: Array<{ listing_id: string; quantity: number; name?: string; price?: number }>;
  total: number;
  remaining_balance: number;
  message: string;
}
