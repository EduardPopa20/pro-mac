import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { SpecificationVisibility, CATEGORY_SPECIFICATIONS } from '../types/category-specs';

interface UseCategorySpecsReturn {
  visibleSpecs: SpecificationVisibility | null;
  loading: boolean;
  error: string | null;
  isSpecVisible: (specKey: string, type: 'filters' | 'details') => boolean;
}

/**
 * Hook to get and use category specification visibility settings
 * @param categorySlug - The slug of the category
 * @returns Object with visibility settings and helper functions
 */
export function useCategorySpecs(categorySlug: string | undefined): UseCategorySpecsReturn {
  const [visibleSpecs, setVisibleSpecs] = useState<SpecificationVisibility | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!categorySlug) {
      setLoading(false);
      return;
    }

    fetchCategorySpecs();
  }, [categorySlug]);

  const fetchCategorySpecs = async () => {
    if (!categorySlug) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('categories')
        .select('visible_specifications')
        .eq('slug', categorySlug)
        .single();

      if (fetchError) {
        // If category not found or error, use default visibility
        console.warn('Error fetching category specs:', fetchError);
        setVisibleSpecs(getDefaultVisibility(categorySlug));
      } else if (data?.visible_specifications) {
        setVisibleSpecs(data.visible_specifications);
      } else {
        // No configuration, use defaults
        setVisibleSpecs(getDefaultVisibility(categorySlug));
      }
    } catch (err) {
      console.error('Error in fetchCategorySpecs:', err);
      setError('Eroare la încărcarea configurării specificațiilor');
      // Fall back to defaults on error
      setVisibleSpecs(getDefaultVisibility(categorySlug));
    } finally {
      setLoading(false);
    }
  };

  const getDefaultVisibility = (slug: string): SpecificationVisibility => {
    const specs = CATEGORY_SPECIFICATIONS[slug] || [];
    const filters: Record<string, boolean> = {};
    const details: Record<string, boolean> = {};

    // Default: show basic specs in filters, all specs in details
    specs.forEach(spec => {
      filters[spec.key] = spec.category === 'basic';
      details[spec.key] = true;
    });

    return { filters, details };
  };

  const isSpecVisible = (specKey: string, type: 'filters' | 'details'): boolean => {
    if (!visibleSpecs) {
      // If no config loaded yet, default to showing everything
      return true;
    }

    return visibleSpecs[type]?.[specKey] ?? false;
  };

  return {
    visibleSpecs,
    loading,
    error,
    isSpecVisible,
  };
}

/**
 * Helper function to filter an object based on visibility settings
 * @param data - The data object to filter
 * @param visibilityConfig - The visibility configuration
 * @param type - Whether to use filter or details visibility
 * @returns Filtered object with only visible properties
 */
export function filterVisibleSpecs<T extends Record<string, any>>(
  data: T,
  visibilityConfig: SpecificationVisibility | null,
  type: 'filters' | 'details'
): Partial<T> {
  if (!visibilityConfig) {
    // If no config, return all data
    return data;
  }

  const filtered: Partial<T> = {};
  const visibility = visibilityConfig[type];

  Object.keys(data).forEach(key => {
    // Always include basic fields like id, name, etc.
    const alwaysInclude = ['id', 'name', 'slug', 'category_id', 'price', 'special_price', 'images'];

    if (alwaysInclude.includes(key) || visibility[key] === true) {
      filtered[key as keyof T] = data[key];
    }
  });

  return filtered;
}