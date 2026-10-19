/**
 * Types below are transcribed from the backend's actual serializers, not
 * guessed from the URL shape — see docs/API_CONTRACT.md for exactly which
 * file each one came from and whether it was also spot-checked against a
 * live response in this phase.
 */

export interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// catalog/serializers.py::CategorySerializer
export interface Category {
  id: number;
  name: string;
  slug: string;
  parent: number | null;
}

// catalog/serializers.py::ProductImageSerializer
export interface ProductImage {
  id: number;
  product: number;
  image: string;
  sort_order: number;
}

// catalog/serializers.py::ProductVariantSerializer
export interface ProductVariant {
  id: number;
  product: number;
  name: string;
  value: string;
  sku: string;
  price_override: string | null;
  price: string;
}

// catalog/serializers.py::ProductSerializer — decimals serialize as
// strings (DRF's default for DecimalField), never numbers.
export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  sku: string;
  price: string;
  status: "draft" | "published" | "archived";
  category: number | null;
  images: ProductImage[];
  variants: ProductVariant[];
  created_at: string;
  updated_at: string;
}

// accounts/serializers.py::UserSerializer
export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  date_joined: string;
}

// accounts/views.py::RegisterView / LoginView response shape — not a
// dedicated serializer, assembled in the view (_tokens_for()).
export interface AuthResponse {
  user: User;
  access: string;
  refresh: string;
}

// businesses/serializers.py::BusinessSerializer
export interface Business {
  id: number;
  name: string;
  slug: string;
  status: "active" | "suspended" | "offboarding";
  country: string;
  timezone: string;
  default_currency: string;
  contact_email: string;
  contact_phone: string;
  created_at: string;
}

// businesses/serializers.py::MyBusinessMembershipSerializer — the
// endpoint added in Phase 2 Step 4, see docs/API_CONTRACT.md.
export interface MyBusinessMembership {
  id: number;
  business: Business;
  role: "owner" | "manager" | "staff";
  status: "active" | "invited" | "suspended";
  created_at: string;
}

// orders/serializers.py::OrderSummarySerializer
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

// core/views.py::DashboardView
export interface DashboardSummary {
  sales_total: string;
  orders_by_status: Record<string, number>;
  low_stock_count: number;
  recent_orders: OrderSummary[];
}

// cart/serializers.py::CartItemSerializer
export interface CartItem {
  id: number;
  product: number;
  variant: number | null;
  product_name: string;
  quantity: number;
  unit_price: string;
}

// cart/serializers.py::CartSerializer — `subtotal` is a SerializerMethodField,
// still a decimal-shaped string like every other money field here.
export interface Cart {
  id: number;
  items: CartItem[];
  subtotal: string;
  updated_at: string;
}

// accounts/serializers.py::AddressSerializer
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

// orders/models.py — every order status this state machine can reach
// (orders/services.py::ALLOWED_TRANSITIONS on the backend). Kept as a union,
// not a bare `string`, so a UI switch over status can't silently miss one.
export type OrderStatus =
  | "awaiting_payment"
  | "payment_failed"
  | "paid"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

// orders/serializers.py::OrderItemSerializer — a purchase-time snapshot,
// never re-derived from the live Product after creation.
export interface OrderItem {
  id: number;
  product: number | null;
  product_name: string;
  sku: string;
  unit_price: string;
  quantity: number;
  line_total: string;
}

// orders/serializers.py::OrderStatusHistorySerializer — append-only.
export interface OrderStatusHistoryEntry {
  id: number;
  from_status: string;
  to_status: string;
  note: string;
  actor: number | null;
  created_at: string;
}

// orders/serializers.py::OrderSerializer — the full, single-order shape;
// OrderSummary above is the lighter list-row shape the ops dashboard uses.
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

// payments/serializers.py::PaymentSerializer
export interface Payment {
  id: number;
  order: number;
  provider: string;
  amount: string;
  currency: string;
  phone_number: string;
  status: "pending" | "successful" | "failed" | "refunded";
  receipt_number: string;
  created_at: string;
}

// accounts/serializers.py::CustomerSerializer — accounts/ops_views.py's own
// annotated queryset, order_count/lifetime_total scoped to THIS business
// only (a customer who also shops at another business doesn't show it here).
export interface Customer {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  date_joined: string;
  order_count: number;
  lifetime_total: string;
}

// core/serializers.py::StoreSettingsSerializer
export interface StoreSettings {
  currency: string;
  default_delivery_fee: string;
  low_stock_default_threshold: number;
  theme: string;
}

// core/serializers.py::PublicStoreInfoSerializer — GET /api/<slug>/store/,
// anonymous. Deliberately narrower than StoreSettings above (that one is
// owner/manager-only, via /api/ops/<slug>/settings/).
export interface PublicStoreInfo {
  name: string;
  currency: string;
  theme: string;
}

// businesses/serializers.py::BusinessMembershipSerializer — the
// /api/ops/<slug>/members/ shape, distinct from MyBusinessMembership
// above (that one nests `business`; this one is already scoped to one
// business by the URL and nests nothing, but adds `user_email`).
export interface BusinessMembership {
  id: number;
  user: number;
  user_email: string;
  role: "owner" | "manager" | "staff";
  status: "active" | "invited" | "suspended";
  invited_by: number | null;
  created_at: string;
}

// inventory/serializers.py::InventoryRecordSerializer
export interface InventoryRecord {
  id: number;
  product: number;
  variant: number | null;
  quantity: number;
  low_stock_threshold: number | null;
  is_low_stock: boolean;
}

// inventory/serializers.py::InventoryMovementSerializer — append-only.
export interface InventoryMovement {
  id: number;
  record: number;
  delta: number;
  resulting_quantity: number;
  reason: string;
  reference: string;
  note: string;
  actor: number | null;
  created_at: string;
}

/**
 * core/exceptions.py + DRF's own default exception handler. Every error
 * response is one of these two shapes — there is no third form.
 */
export type ApiErrorBody =
  | { detail: string }
  | Record<string, string[]>;
