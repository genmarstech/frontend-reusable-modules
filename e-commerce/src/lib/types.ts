// Mirrors the Django DRF serializers exactly (field names, nullability) —
// see the backend's accounts/catalog/inventory/cart/orders/payments/core
// serializers.py files. Keep this in lockstep with them by hand; there is
// no shared schema generation wired up yet (drf-spectacular's schema at
// /api/schema/ would be the source for that, if this ever gets codegen'd).

export interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ApiError {
  detail?: string;
  [field: string]: unknown;
}

// ---- accounts ----

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  date_joined: string;
}

export interface Address {
  id: number;
  label: string;
  recipient_name: string;
  phone_number: string;
  line1: string;
  line2: string;
  city: string;
  is_default: boolean;
}

export interface Customer extends User {
  is_active: boolean;
  order_count: number;
  lifetime_total: string;
}

// ---- catalog ----

export interface Category {
  id: number;
  name: string;
  slug: string;
  parent: number | null;
}

export interface ProductImage {
  id: number;
  image: string;
  sort_order: number;
}

export interface ProductVariant {
  id: number;
  name: string;
  value: string;
  sku: string;
  price_override: string | null;
  price: string;
}

export type ProductStatus = "draft" | "published" | "archived";

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  sku: string;
  price: string;
  status: ProductStatus;
  category: number | null;
  images: ProductImage[];
  variants: ProductVariant[];
  created_at: string;
  updated_at: string;
}

// ---- inventory ----

export type InventoryReason =
  | "restock"
  | "order"
  | "cancellation"
  | "refund"
  | "return"
  | "adjustment";

export interface InventoryRecord {
  id: number;
  product: number | null;
  variant: number | null;
  quantity: number;
  low_stock_threshold: number | null;
  is_low_stock: boolean;
}

export interface InventoryMovement {
  id: number;
  record: number;
  delta: number;
  resulting_quantity: number;
  reason: InventoryReason;
  reference: string;
  note: string;
  actor: number | null;
  created_at: string;
}

// ---- cart ----

export interface CartItem {
  id: number;
  product: number;
  variant: number | null;
  product_name: string;
  quantity: number;
  unit_price: string;
}

export interface Cart {
  id: number;
  items: CartItem[];
  subtotal: number;
  updated_at: string;
}

// ---- orders ----

export type OrderStatus =
  | "awaiting_payment"
  | "payment_failed"
  | "paid"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

export interface OrderItem {
  id: number;
  product: number | null;
  product_name: string;
  sku: string;
  unit_price: string;
  quantity: number;
  line_total: string;
}

export interface OrderStatusHistoryEntry {
  id: number;
  from_status: string;
  to_status: string;
  note: string;
  actor: number | null;
  created_at: string;
}

export interface Order {
  id: number;
  reference: string;
  status: OrderStatus;
  currency: string;
  subtotal: string;
  delivery_fee: string;
  discount_total: string;
  tax_total: string;
  total: string;
  contact_email: string;
  contact_phone: string;
  delivery_recipient_name: string;
  delivery_line1: string;
  delivery_line2: string;
  delivery_city: string;
  delivery_phone: string;
  items: OrderItem[];
  status_history: OrderStatusHistoryEntry[];
  created_at: string;
  updated_at: string;
}

export interface OrderSummary {
  id: number;
  reference: string;
  status: OrderStatus;
  currency: string;
  total: string;
  contact_email: string;
  contact_phone: string;
  created_at: string;
}

// ---- payments ----

export type PaymentStatus = "pending" | "successful" | "failed" | "refunded";

export interface Payment {
  id: number;
  order: number;
  provider: string;
  amount: string;
  currency: string;
  phone_number: string;
  status: PaymentStatus;
  receipt_number: string;
  created_at: string;
}

// ---- core / ops ----

export interface StoreSettings {
  currency: string;
  default_delivery_fee: string;
  low_stock_default_threshold: number;
}

export interface DashboardSummary {
  sales_total: number;
  orders_by_status: Partial<Record<OrderStatus, number>>;
  low_stock_count: number;
  recent_orders: OrderSummary[];
}
