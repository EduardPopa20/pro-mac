import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import { realTimeEvents } from '../lib/realTimeEvents'
import type { Product, Category } from '../types'
import type { ProductFilters } from '../components/product/ProductFilter'

// Helper function to convert technical errors to user-friendly messages
const getErrorMessage = (error: any): string => {
  const message = error?.message || error?.toString() || 'Eroare necunoscută'
  
  // Database schema errors
  if (message.includes('image_path') && message.includes('schema cache')) {
    return 'Eroare la procesarea imaginii. Vă rugăm să încercați din nou.'
  }
  
  if (message.includes('is_featured') && message.includes('schema cache')) {
    return 'Schema de date nu este actualizată. Vă rugăm să contactați administratorul pentru a actualiza coloana is_featured.'
  }
  
  if (message.includes('stock_status') && message.includes('schema cache')) {
    return 'Schema de date nu este actualizată. Vă rugăm să contactați administratorul pentru a actualiza coloana stock_status.'
  }
  
  if (message.includes('column') && message.includes('does not exist')) {
    return 'Schema bazei de date necesită actualizare. Vă rugăm să contactați administratorul.'
  }
  
  if (message.includes('violates not-null constraint')) {
    return 'Toate câmpurile obligatorii trebuie completate.'
  }
  
  // Check constraint violations
  if (message.includes('check_area_positive') || message.includes('check_weight_positive') || message.includes('check_thickness_positive')) {
    return 'Valorile pentru dimensiuni și greutăți trebuie să fie pozitive sau să rămână necompletate.'
  }
  
  if (message.includes('violates check constraint')) {
    return 'Una dintre valorile introduse nu respectă restricțiile bazei de date.'
  }
  
  // Storage errors
  if (message.includes('bucket') && message.includes('not found')) {
    return 'Sistemul de stocare nu este configurat corect. Vă rugăm să contactați administratorul.'
  }
  
  if (message.includes('storage')) {
    return 'Eroare la încărcarea imaginii. Vă rugăm să încercați din nou.'
  }
  
  // Network errors
  if (message.includes('fetch') || message.includes('network')) {
    return 'Problemă de conectare. Vă rugăm să verificați conexiunea la internet.'
  }
  
  // Generic database errors
  if (message.includes('duplicate key') || message.includes('unique constraint')) {
    return 'Un produs cu aceste detalii există deja.'
  }
  
  // Fallback for unknown errors (don't show technical details)
  if (message.length > 100 || message.includes('Error:') || message.includes('at ')) {
    return 'A apărut o eroare. Vă rugăm să încercați din nou sau să contactați suportul.'
  }
  
  return message
}

interface PaginationMeta {
  page: number
  pageSize: number
  totalCount: number
  totalPages: number
}

interface ProductState {
  products: Product[]
  categories: Category[]
  allCategoryProducts: Product[] // All products for the category (without filters)
  loading: boolean
  error: string | null
  selectedCategory: number | null
  pagination: PaginationMeta
  
  // Actions
  fetchProducts: () => Promise<void>
  fetchCategories: () => Promise<void>
  fetchProductsByCategory: (
    categoryId: number,
    page?: number,
    pageSize?: number,
    filters?: ProductFilters
  ) => Promise<void>
  fetchAllCategoryProducts: (categoryId: number) => Promise<void>
  createProduct: (productData: Partial<Product>) => Promise<void>
  updateProduct: (id: number, productData: Partial<Product>) => Promise<void>
  deleteProduct: (id: number) => Promise<void>
  createCategory: (categoryData: Partial<Category>) => Promise<void>
  updateCategory: (id: number, categoryData: Partial<Category>) => Promise<void>
  deleteCategory: (id: number) => Promise<void>
  setSelectedCategory: (categoryId: number | null) => void
  clearError: () => void
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  categories: [],
  allCategoryProducts: [],
  loading: false,
  error: null,
  selectedCategory: null,
  pagination: {
    page: 1,
    pageSize: 12,
    totalCount: 0,
    totalPages: 0
  },

  fetchProducts: async () => {
    set({ loading: true, error: null })
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(*)
        `)
        // Include all products for testing - UI will handle stock display
        // .in('stock_status', ['available', 'coming_soon'])
        .order('name')

      if (error) throw error

      set({ products: data || [], loading: false })
    } catch (error: any) {
      set({ error: getErrorMessage(error), loading: false })
      console.error('Error fetching products:', error)
    }
  },

  fetchCategories: async () => {
    set({ loading: true, error: null })
    try {
      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true })

      if (categoriesError) throw categoriesError

      // Get product counts for each category
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('category_id')
        // Include all products for testing - UI will handle stock display
        // .in('stock_status', ['available', 'coming_soon'])

      if (productsError) throw productsError

      // Calculate product counts
      const productCounts = productsData?.reduce((counts, product) => {
        if (product.category_id) {
          counts[product.category_id] = (counts[product.category_id] || 0) + 1
        }
        return counts
      }, {} as Record<number, number>) || {}

      // Add product counts to categories
      const categoriesWithCount = categoriesData?.map(category => ({
        ...category,
        products_count: productCounts[category.id] || 0
      })) || []

      set({ categories: categoriesWithCount, loading: false })
    } catch (error: any) {
      set({ error: getErrorMessage(error), loading: false })
      console.error('Error fetching categories:', error)
    }
  },


  fetchProductsByCategory: async (
    categoryId: number,
    page: number = 1,
    pageSize: number = 12,
    filters?: ProductFilters
  ) => {
    set({ loading: true, error: null, selectedCategory: categoryId })
    try {
      // Build the base query
      let query = supabase
        .from('products')
        .select(`
          *,
          category:categories(*)
        `, { count: 'exact' })
        .eq('category_id', categoryId)
        .eq('is_active', true)  // Only show active products in public view
        // Include all products for testing - UI will handle stock display
        // .in('stock_status', ['available', 'coming_soon'])

      // Apply filters if provided
      if (filters) {
        // Price range filter
        if (filters.priceRange && filters.priceRange[0] > 0 && filters.priceRange[1] > 0) {
          query = query
            .gte('price', filters.priceRange[0])
            .lte('price', filters.priceRange[1])
        }

        // Colors filter
        if (filters.colors && filters.colors.length > 0) {
          query = query.in('color', filters.colors)
        }

        // Custom filters
        Object.keys(filters).forEach(key => {
          if (key !== 'priceRange' && key !== 'colors') {
            const value = filters[key]
            if (value && value !== '' && (!Array.isArray(value) || value.length > 0)) {
              if (Array.isArray(value)) {
                query = query.in(key, value)
              } else {
                // Handle boolean fields specifically
                if (key === 'is_on_sale' && value === 'true') {
                  query = query.eq(key, true)
                } else {
                  query = query.eq(key, value)
                }
              }
            }
          }
        })
      }

      // Apply pagination
      const from = (page - 1) * pageSize
      const to = from + pageSize - 1

      const { data, error, count } = await query
        .range(from, to)
        .order('name')

      if (error) throw error

      const totalCount = count || 0
      const totalPages = Math.ceil(totalCount / pageSize)

      set({ 
        products: data || [], 
        loading: false,
        pagination: {
          page,
          pageSize,
          totalCount,
          totalPages
        }
      })
    } catch (error: any) {
      set({ error: getErrorMessage(error), loading: false })
      console.error('Error fetching products by category:', error)
    }
  },

  fetchAllCategoryProducts: async (categoryId: number) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(*)
        `)
        .eq('category_id', categoryId)
        // Include all products for testing - UI will handle stock display
        // .in('stock_status', ['available', 'coming_soon'])
        .order('name')

      if (error) throw error

      set({ allCategoryProducts: data || [] })
    } catch (error: any) {
      console.error('Error fetching all category products:', error)
      set({ allCategoryProducts: [] })
    }
  },

  createProduct: async (productData: Partial<Product>) => {
    set({ loading: true, error: null })
    try {

      const { data, error } = await supabase
        .from('products')
        .insert([productData])
        .select(`
          *,
          category:categories(*)
        `)

      if (error) throw error

      if (data) {
        const currentProducts = get().products
        set({ 
          products: [...currentProducts, ...data],
          loading: false 
        })
        
        // Emit real-time event for product creation
        await realTimeEvents.emitEvent('products', 'create', data[0])
      }
    } catch (error: any) {
      set({ error: getErrorMessage(error), loading: false })
      console.error('Error creating product:', error)
      throw error
    }
  },

  updateProduct: async (id: number, productData: Partial<Product>) => {
    set({ loading: true, error: null })
    try {

      const { data, error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', id)
        .select(`
          *,
          category:categories(*)
        `)

      if (error) throw error

      if (data) {
        const currentProducts = get().products
        const updatedProducts = currentProducts.map(product => 
          product.id === id ? data[0] : product
        )
        set({ 
          products: updatedProducts,
          loading: false 
        })
        
        // Emit real-time event for product update
        await realTimeEvents.emitEvent('products', 'update', data[0])
      }
    } catch (error: any) {
      set({ error: getErrorMessage(error), loading: false })
      console.error('Error updating product:', error)
      throw error
    }
  },

  deleteProduct: async (id: number) => {
    set({ loading: true, error: null })
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)

      if (error) throw error

      const currentProducts = get().products
      const updatedProducts = currentProducts.filter(product => product.id !== id)
      set({ 
        products: updatedProducts,
        loading: false 
      })
      
      // Emit real-time event for product deletion
      await realTimeEvents.emitEvent('products', 'delete', { id })
    } catch (error: any) {
      set({ error: getErrorMessage(error), loading: false })
      console.error('Error deleting product:', error)
      throw error
    }
  },

  setSelectedCategory: (categoryId: number | null) => {
    set({ selectedCategory: categoryId })
    if (categoryId === null) {
      get().fetchProducts()
    } else {
      get().fetchProductsByCategory(categoryId)
    }
  },

  createCategory: async (categoryData: Partial<Category>) => {
    set({ loading: true, error: null })
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert([categoryData])
        .select('*')

      if (error) throw error

      if (data) {
        const currentCategories = get().categories
        set({ 
          categories: [...currentCategories, ...data].sort((a, b) => a.sort_order - b.sort_order),
          loading: false 
        })
      }
    } catch (error: any) {
      set({ error: getErrorMessage(error), loading: false })
      console.error('Error creating category:', error)
      throw error
    }
  },

  updateCategory: async (id: number, categoryData: Partial<Category>) => {
    set({ loading: true, error: null })
    try {
      const { data, error } = await supabase
        .from('categories')
        .update(categoryData)
        .eq('id', id)
        .select('*')

      if (error) throw error

      if (data) {
        const currentCategories = get().categories
        const updatedCategories = currentCategories.map(category => 
          category.id === id ? data[0] : category
        )
        set({ 
          categories: updatedCategories.sort((a, b) => a.sort_order - b.sort_order),
          loading: false 
        })
      }
    } catch (error: any) {
      set({ error: getErrorMessage(error), loading: false })
      console.error('Error updating category:', error)
      throw error
    }
  },

  deleteCategory: async (id: number) => {
    set({ loading: true, error: null })
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id)

      if (error) throw error

      const currentCategories = get().categories
      const updatedCategories = currentCategories.filter(category => category.id !== id)
      set({ 
        categories: updatedCategories,
        loading: false 
      })
    } catch (error: any) {
      set({ error: getErrorMessage(error), loading: false })
      console.error('Error deleting category:', error)
      throw error
    }
  },

  clearError: () => set({ error: null })
}))

// Admin-specific store with additional admin functions
interface AdminProductState extends ProductState {
  // Admin-specific actions
  fetchAllProducts: () => Promise<void> // Including inactive products
  fetchAllCategories: () => Promise<void> // Including inactive categories
}

export const useAdminProductStore = create<AdminProductState>((set) => ({
  // Initialize all state from the regular store
  products: [],
  categories: [],
  allCategoryProducts: [],
  loading: false,
  error: null,
  selectedCategory: null,
  pagination: {
    page: 1,
    pageSize: 12,
    totalCount: 0,
    totalPages: 0
  },

  // Regular store methods - bound properly to this store instance
  fetchProducts: async () => {
    set({ loading: true, error: null })
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(*)
        `)
        // Include all products for testing - UI will handle stock display
        // .in('stock_status', ['available', 'coming_soon'])
        .order('name')

      if (error) throw error

      set({ products: data || [], loading: false })
    } catch (error: any) {
      set({ error: getErrorMessage(error), loading: false })
      console.error('Error fetching products:', error)
    }
  },

  fetchCategories: async () => {
    set({ loading: true, error: null })
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        // Include all products for testing - UI will handle stock display
        // .in('stock_status', ['available', 'coming_soon'])
        .order('sort_order', { ascending: true })

      if (error) throw error

      set({ categories: data || [], loading: false })
    } catch (error: any) {
      set({ error: getErrorMessage(error), loading: false })
      console.error('Error fetching categories:', error)
    }
  },

  fetchProductsByCategory: async (categoryId: number) => {
    set({ loading: true, error: null, selectedCategory: categoryId })
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(*)
        `)
        .eq('category_id', categoryId)
        .order('name')

      if (error) throw error

      set({ products: data || [], loading: false })
    } catch (error: any) {
      set({ error: getErrorMessage(error), loading: false })
      console.error('Error fetching products by category:', error)
    }
  },

  fetchAllCategoryProducts: async (categoryId: number) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(*)
        `)
        .eq('category_id', categoryId)
        // Include all products for testing - UI will handle stock display
        // .in('stock_status', ['available', 'coming_soon'])
        .order('name')

      if (error) throw error

      set({ allCategoryProducts: data || [] })
    } catch (error: any) {
      console.error('Error fetching all category products:', error)
      set({ allCategoryProducts: [] })
    }
  },

  createProduct: async (productData: Partial<Product>) => {
    set({ loading: true, error: null })
    try {
      const { data, error } = await supabase
        .from('products')
        .insert([productData])
        .select(`
          *,
          category:categories(*)
        `)

      if (error) throw error

      if (data) {
        const currentProducts = useAdminProductStore.getState().products
        set({ 
          products: [...currentProducts, ...data],
          loading: false 
        })
      }
    } catch (error: any) {
      set({ error: getErrorMessage(error), loading: false })
      console.error('Error creating product:', error)
      throw error
    }
  },

  updateProduct: async (id: number, productData: Partial<Product>) => {
    set({ loading: true, error: null })
    try {
      const { data, error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', id)
        .select(`
          *,
          category:categories(*)
        `)

      if (error) throw error

      if (data) {
        const currentProducts = useAdminProductStore.getState().products
        const updatedProducts = currentProducts.map(product => 
          product.id === id ? data[0] : product
        )
        set({ 
          products: updatedProducts,
          loading: false 
        })
      }
    } catch (error: any) {
      set({ error: getErrorMessage(error), loading: false })
      console.error('Error updating product:', error)
      throw error
    }
  },

  deleteProduct: async (id: number) => {
    set({ loading: true, error: null })
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)

      if (error) throw error

      const currentProducts = useAdminProductStore.getState().products
      const updatedProducts = currentProducts.filter(product => product.id !== id)
      set({ 
        products: updatedProducts,
        loading: false 
      })
    } catch (error: any) {
      set({ error: getErrorMessage(error), loading: false })
      console.error('Error deleting product:', error)
      throw error
    }
  },

  createCategory: async (categoryData: Partial<Category>) => {
    set({ loading: true, error: null })
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert([categoryData])
        .select('*')

      if (error) throw error

      if (data) {
        const currentCategories = useAdminProductStore.getState().categories
        set({ 
          categories: [...currentCategories, ...data].sort((a, b) => a.sort_order - b.sort_order),
          loading: false 
        })
      }
    } catch (error: any) {
      set({ error: getErrorMessage(error), loading: false })
      console.error('Error creating category:', error)
      throw error
    }
  },

  updateCategory: async (id: number, categoryData: Partial<Category>) => {
    set({ loading: true, error: null })
    try {
      const { data, error } = await supabase
        .from('categories')
        .update(categoryData)
        .eq('id', id)
        .select('*')

      if (error) throw error

      if (data) {
        const currentCategories = useAdminProductStore.getState().categories
        const updatedCategories = currentCategories.map(category => 
          category.id === id ? data[0] : category
        )
        set({ 
          categories: updatedCategories.sort((a, b) => a.sort_order - b.sort_order),
          loading: false 
        })
      }
    } catch (error: any) {
      set({ error: getErrorMessage(error), loading: false })
      console.error('Error updating category:', error)
      throw error
    }
  },

  deleteCategory: async (id: number) => {
    set({ loading: true, error: null })
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id)

      if (error) throw error

      const currentCategories = useAdminProductStore.getState().categories
      const updatedCategories = currentCategories.filter(category => category.id !== id)
      set({ 
        categories: updatedCategories,
        loading: false 
      })
    } catch (error: any) {
      set({ error: getErrorMessage(error), loading: false })
      console.error('Error deleting category:', error)
      throw error
    }
  },

  setSelectedCategory: (categoryId: number | null) => {
    set({ selectedCategory: categoryId })
    if (categoryId === null) {
      useAdminProductStore.getState().fetchAllProducts()
    } else {
      useAdminProductStore.getState().fetchProductsByCategory(categoryId)
    }
  },

  clearError: () => set({ error: null }),
  
  // Admin-specific methods
  fetchAllProducts: async () => {
    set({ loading: true, error: null })
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(*)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      set({ products: data || [], loading: false })
    } catch (error: any) {
      set({ error: getErrorMessage(error), loading: false })
      console.error('Error fetching all products:', error)
    }
  },

  fetchAllCategories: async () => {
    set({ loading: true, error: null })
    try {
      // Query categories directly and calculate product count manually
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order')

      if (categoriesError) throw categoriesError

      // Get product counts for each category
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('category_id')
        // Include all products for testing - UI will handle stock display
        // .in('stock_status', ['available', 'coming_soon'])

      if (productsError) throw productsError

      // Calculate product counts
      const productCounts = productsData?.reduce((counts, product) => {
        if (product.category_id) {
          counts[product.category_id] = (counts[product.category_id] || 0) + 1
        }
        return counts
      }, {} as Record<number, number>) || {}

      // Add product counts to categories
      const categoriesWithCount = categoriesData?.map(category => ({
        ...category,
        products_count: productCounts[category.id] || 0
      })) || []

      set({ categories: categoriesWithCount, loading: false })
    } catch (error: any) {
      set({ error: getErrorMessage(error), loading: false })
      console.error('Error fetching all categories:', error)
    }
  }
}))