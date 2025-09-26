export interface User {
  id: string
  email: string
  full_name?: string
  phone?: string
  // Legacy address field (keeping for backwards compatibility)
  address?: string
  // New structured address fields
  county?: string
  city?: string
  street_address_1?: string
  street_address_2?: string
  postal_code?: string
  newsletter_subscribed?: boolean
  role: 'admin' | 'customer'
  created_at: string
  updated_at: string
}

export interface Category {
  id: number
  name: string
  slug: string
  sort_order: number
  created_at: string
  updated_at: string
  products_count?: number // from view
}

export interface Product {
  id: number
  name: string
  slug: string
  description?: string
  price: number
  category_id: number | null
  category?: Category
  image_url?: string
  
  // Basic tile-specific fields
  dimensions?: string
  material?: string
  finish?: string
  color?: string
  usage_area?: string
  
  // Enhanced product properties (inspired by competitor analysis)
  // Brand and identification
  brand?: string
  product_code?: string
  sku?: string
  
  // Technical specifications
  thickness?: number // in mm
  surface_finish?: string // More detailed than finish
  texture?: string // e.g., "Marble-like", "Wood-like"
  quality_grade?: number // 1-3
  
  // Physical properties
  weight_per_box?: number // in kg
  area_per_box?: number // in m2
  tiles_per_box?: number
  origin_country?: string
  
  // Technical capabilities (boolean flags)
  is_rectified?: boolean
  is_frost_resistant?: boolean
  is_floor_heating_compatible?: boolean
  
  // Application areas (JSON array for multiple areas)
  application_areas?: string[] // JSON array of application areas
  
  // Suitability
  suitable_for_walls?: boolean
  suitable_for_floors?: boolean
  suitable_for_exterior?: boolean
  suitable_for_commercial?: boolean
  
  // Inventory and pricing
  stock_quantity?: number // in m2
  standard_price?: number
  special_price?: number
  price_unit?: string // mp, buc, cutie

  // Sale/Discount status
  is_on_sale?: boolean // flag for sale status (uses special_price for discounted price)
  
  // Additional details
  estimated_delivery_days?: number
  installation_notes?: string
  care_instructions?: string
  
  // Calculator specifications
  specifications?: {
    coverage_per_box?: number // m² per box for calculator
    pieces_per_box?: number // pieces per box
    width?: number // tile width in cm
    height?: number // tile height in cm
    linear_meters_per_box?: number // for riflaje
    [key: string]: any // allow additional specs
  }
  
  // Status fields
  stock_status: 'available' | 'out_of_stock' | 'discontinued' | 'coming_soon'
  is_featured: boolean
  created_at: string
  updated_at: string
  created_by?: string
}

export interface Warehouse {
  id: string
  code: string
  name: string
  type: 'warehouse' | 'showroom' | 'supplier' | 'transit'
  address?: string
  city?: string
  county?: string
  postal_code?: string
  country: string
  phone?: string
  email?: string
  manager_id?: string
  can_ship: boolean
  can_receive: boolean
  is_default: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Inventory {
  id: string
  product_id: number
  warehouse_id: string
  warehouse?: Warehouse
  quantity_on_hand: number
  quantity_reserved: number
  quantity_available: number
  pieces_per_box: number
  sqm_per_box: number
  pieces_per_sqm: number
  reorder_point?: number
  reorder_quantity?: number
  max_stock_level?: number
  bin_location?: string
  zone?: string
  last_counted_at?: string
  last_restock_at?: string
  version: number
  created_at: string
  updated_at: string
}

export interface StockMovement {
  id: string
  movement_type: 'purchase' | 'sale' | 'return' | 'adjustment' | 
                 'transfer_in' | 'transfer_out' | 'damage' | 
                 'count_adjustment' | 'reservation' | 'release'
  product_id: number
  product?: Product
  from_warehouse_id?: string
  from_warehouse?: Warehouse
  to_warehouse_id?: string
  to_warehouse?: Warehouse
  order_id?: string
  quantity: number
  unit_of_measure: string
  unit_cost?: number
  total_cost?: number
  batch_number?: string
  lot_number?: string
  expiry_date?: string
  status: 'pending' | 'completed' | 'cancelled' | 'failed'
  performed_by?: string
  approved_by?: string
  reason?: string
  notes?: string
  external_ref?: string
  external_system?: string
  movement_date: string
  created_at: string
}

export interface StockReservation {
  id: string
  product_id: number
  product?: Product
  warehouse_id: string
  warehouse?: Warehouse
  order_id?: string
  cart_session_id?: string
  quantity: number
  unit_price?: number
  reserved_at: string
  expires_at: string
  released_at?: string
  status: 'active' | 'confirmed' | 'released' | 'expired'
  user_id?: string
}

export interface StockAlert {
  id: string
  alert_type: 'low_stock' | 'out_of_stock' | 'overstock' | 'expiring'
  product_id?: number
  product?: Product
  warehouse_id?: string
  warehouse?: Warehouse
  threshold_value?: number
  current_value?: number
  severity: 'low' | 'medium' | 'high' | 'critical'
  message?: string
  is_active: boolean
  is_acknowledged: boolean
  acknowledged_by?: string
  acknowledged_at?: string
  resolved_at?: string
  resolution_notes?: string
  triggered_at: string
  created_at: string
}

export interface StockBatch {
  id: string
  batch_number: string
  product_id: number
  product?: Product
  warehouse_id: string
  warehouse?: Warehouse
  initial_quantity: number
  current_quantity: number
  manufacture_date?: string
  expiry_date?: string
  received_date: string
  supplier_name?: string
  purchase_order_number?: string
  invoice_number?: string
  quality_check_status?: string
  quality_notes?: string
  unit_cost?: number
  total_cost?: number
  status: string
  created_at: string
  updated_at: string
}

export interface SiteSetting {
  id: number
  key: string
  value: string
  description?: string
  created_at: string
  updated_at: string
  updated_by?: string
}

export interface Showroom {
  id: number
  name: string
  address: string
  city: string
  phone?: string
  email?: string
  waze_url?: string
  google_maps_url?: string
  description?: string
  opening_hours?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface AdminAuditLog {
  id: number
  user_id?: string
  action: 'CREATE' | 'UPDATE' | 'DELETE'
  table_name: string
  record_id?: number
  old_data?: any
  new_data?: any
  ip_address?: string
  user_agent?: string
  created_at: string
}

export interface CartItem {
  id: string
  product_id: number
  product: Product
  quantity: number
  user_id: string
  created_at: string
}

export interface Order {
  id: string
  user_id: string
  total_amount: number
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
  items: OrderItem[]
  shipping_address: Address
  created_at: string
  updated_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: number
  product: Product
  quantity: number
  price: number
}

export interface Address {
  street: string
  city: string
  county: string
  postal_code: string
  country: string
}

export interface NewsletterSubscription {
  id: number
  email: string
  status: 'active' | 'unsubscribed' | 'bounced'
  source: 'modal' | 'footer' | 'checkout' | 'manual'
  user_id?: string | null
  ip_address?: string
  user_agent?: string
  subscribed_at: string
  updated_at: string
  unsubscribed_at?: string | null
  last_email_sent_at?: string | null
}