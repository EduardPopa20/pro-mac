export interface User {
  id: string
  email: string
  full_name?: string
  role: 'admin' | 'customer'
  created_at: string
  updated_at: string
}

export interface Category {
  id: number
  name: string
  slug: string
  is_active: boolean
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
  image_path?: string // calea în Supabase Storage
  
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
  
  // Additional details
  estimated_delivery_days?: number
  installation_notes?: string
  care_instructions?: string
  
  // Status fields
  is_active: boolean
  is_featured: boolean
  created_at: string
  updated_at: string
  created_by?: string
}

export interface Inventory {
  id: number
  product_id: number
  quantity: number
  reserved_quantity: number
  reorder_level: number
  last_restock_date?: string
  notes?: string
  created_at: string
  updated_at: string
  updated_by?: string
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