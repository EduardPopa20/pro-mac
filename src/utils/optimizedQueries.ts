import { supabase } from '../lib/supabase';

// Cache configuration
const CACHE_TTL = {
  products: 5 * 60 * 1000, // 5 minutes
  categories: 10 * 60 * 1000, // 10 minutes
  showrooms: 30 * 60 * 1000, // 30 minutes
  settings: 15 * 60 * 1000, // 15 minutes
  inventory: 2 * 60 * 1000, // 2 minutes
  default: 5 * 60 * 1000, // 5 minutes
} as const;

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class OptimizedQueryCache {
  private cache = new Map<string, CacheEntry<any>>();
  private maxCacheSize = 100; // Prevent memory leaks

  // Get from cache or execute query
  async get<T>(
    key: string,
    queryFn: () => Promise<T>,
    ttl: number = CACHE_TTL.default
  ): Promise<T> {
    // Check if we have valid cached data
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data;
    }

    // Execute query and cache result
    try {
      const data = await queryFn();
      this.set(key, data, ttl);
      return data;
    } catch (error) {
      // If query fails and we have stale cache, use it
      if (cached) {
        console.warn(`Query failed for ${key}, using stale cache:`, error);
        return cached.data;
      }
      throw error;
    }
  }

  // Set cache entry
  set<T>(key: string, data: T, ttl: number = CACHE_TTL.default): void {
    // Prevent cache from growing too large
    if (this.cache.size >= this.maxCacheSize) {
      // Remove oldest entries
      const entries = Array.from(this.cache.entries());
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      const toRemove = entries.slice(0, Math.floor(this.maxCacheSize * 0.2));
      toRemove.forEach(([key]) => this.cache.delete(key));
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  // Clear specific cache entries
  invalidate(pattern: string): void {
    const keysToDelete = Array.from(this.cache.keys()).filter(key =>
      key.includes(pattern)
    );
    keysToDelete.forEach(key => this.cache.delete(key));
  }

  // Clear all cache
  clear(): void {
    this.cache.clear();
  }

  // Get cache statistics
  getStats() {
    const now = Date.now();
    const entries = Array.from(this.cache.values());
    const valid = entries.filter(entry => now - entry.timestamp < entry.ttl);
    const stale = entries.filter(entry => now - entry.timestamp >= entry.ttl);

    return {
      total: entries.length,
      valid: valid.length,
      stale: stale.length,
      memoryUsage: this.cache.size,
    };
  }
}

// Global cache instance
export const queryCache = new OptimizedQueryCache();

// Optimized query functions
export const optimizedQueries = {
  // Products with intelligent caching
  async getProducts(categorySlug?: string, limit?: number) {
    const cacheKey = `products:${categorySlug || 'all'}:${limit || 'unlimited'}`;

    return queryCache.get(
      cacheKey,
      async () => {
        let query = supabase
          .from('products')
          .select(`
            id,
            name,
            slug,
            price,
            special_price,
            images,
            dimensions,
            material,
            finish,
            color,
            is_featured,
            stock_quantity,
            category_id,
            categories!inner(name, slug)
          `)
          .eq('is_active', true);

        if (categorySlug) {
          query = query.eq('categories.slug', categorySlug);
        }

        if (limit) {
          query = query.limit(limit);
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
      },
      CACHE_TTL.products
    );
  },

  // Single product with optimized fields
  async getProduct(productSlug: string) {
    const cacheKey = `product:${productSlug}`;

    return queryCache.get(
      cacheKey,
      async () => {
        const { data, error } = await supabase
          .from('products')
          .select(`
            *,
            categories!inner(id, name, slug)
          `)
          .eq('slug', productSlug)
          .eq('is_active', true)
          .single();

        if (error) throw error;
        return data;
      },
      CACHE_TTL.products
    );
  },

  // Categories with product counts
  async getCategories() {
    const cacheKey = 'categories:with_counts';

    return queryCache.get(
      cacheKey,
      async () => {
        const { data, error } = await supabase
          .from('categories')
          .select(`
            id,
            name,
            slug,
            description,
            image_url,
            products!inner(id)
          `)
          .eq('is_active', true);

        if (error) throw error;

        // Add product counts
        return (data || []).map(category => ({
          ...category,
          products_count: category.products?.length || 0,
          products: undefined, // Remove products array to save memory
        }));
      },
      CACHE_TTL.categories
    );
  },

  // Showrooms with minimal data
  async getShowrooms() {
    const cacheKey = 'showrooms:active';

    return queryCache.get(
      cacheKey,
      async () => {
        const { data, error } = await supabase
          .from('showrooms')
          .select(`
            id,
            name,
            address,
            phone,
            email,
            google_maps_url,
            waze_url,
            operating_hours,
            is_main
          `)
          .eq('is_active', true)
          .order('is_main', { ascending: false });

        if (error) throw error;
        return data || [];
      },
      CACHE_TTL.showrooms
    );
  },

  // Site settings
  async getSiteSettings() {
    const cacheKey = 'site_settings';

    return queryCache.get(
      cacheKey,
      async () => {
        const { data, error } = await supabase
          .from('site_settings')
          .select('*')
          .single();

        if (error) throw error;
        return data;
      },
      CACHE_TTL.settings
    );
  },

  // Featured products
  async getFeaturedProducts(limit: number = 8) {
    const cacheKey = `featured_products:${limit}`;

    return queryCache.get(
      cacheKey,
      async () => {
        const { data, error } = await supabase
          .from('products')
          .select(`
            id,
            name,
            slug,
            price,
            special_price,
            images,
            dimensions,
            material,
            categories!inner(name, slug)
          `)
          .eq('is_active', true)
          .eq('is_featured', true)
          .limit(limit)
          .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
      },
      CACHE_TTL.products
    );
  },

  // Search products with minimal fields
  async searchProducts(query: string, limit: number = 20) {
    const cacheKey = `search:${query}:${limit}`;

    return queryCache.get(
      cacheKey,
      async () => {
        const { data, error } = await supabase
          .from('products')
          .select(`
            id,
            name,
            slug,
            price,
            special_price,
            images,
            categories!inner(name, slug)
          `)
          .eq('is_active', true)
          .ilike('name', `%${query}%`)
          .limit(limit)
          .order('name');

        if (error) throw error;
        return data || [];
      },
      CACHE_TTL.products
    );
  },

  // Batch operations for admin
  async getBatchData() {
    const cacheKey = 'admin:batch_data';

    return queryCache.get(
      cacheKey,
      async () => {
        const [categories, showrooms, settings] = await Promise.all([
          this.getCategories(),
          this.getShowrooms(),
          this.getSiteSettings(),
        ]);

        return {
          categories,
          showrooms,
          settings,
        };
      },
      CACHE_TTL.default
    );
  },
};

// Cache invalidation helpers
export const cacheInvalidation = {
  // Invalidate product-related cache
  invalidateProducts() {
    queryCache.invalidate('products');
    queryCache.invalidate('featured_products');
    queryCache.invalidate('search');
  },

  // Invalidate category-related cache
  invalidateCategories() {
    queryCache.invalidate('categories');
    queryCache.invalidate('products'); // Products include category data
  },

  // Invalidate showroom cache
  invalidateShowrooms() {
    queryCache.invalidate('showrooms');
  },

  // Invalidate settings cache
  invalidateSettings() {
    queryCache.invalidate('site_settings');
  },

  // Clear all cache
  clearAll() {
    queryCache.clear();
  },
};

// Performance monitoring
export const cacheStats = {
  getStats: () => queryCache.getStats(),

  // Log cache performance
  logPerformance() {
    const stats = queryCache.getStats();
    console.log('Cache Performance:', {
      hitRate: stats.total > 0 ? (stats.valid / stats.total * 100).toFixed(2) + '%' : '0%',
      ...stats,
    });
  },
};

// Preload critical data
export const preloadCriticalData = async () => {
  try {
    // Preload essential data that's needed on most pages
    await Promise.all([
      optimizedQueries.getCategories(),
      optimizedQueries.getFeaturedProducts(6),
      optimizedQueries.getSiteSettings(),
    ]);
    console.log('Critical data preloaded successfully');
  } catch (error) {
    console.warn('Failed to preload critical data:', error);
  }
};