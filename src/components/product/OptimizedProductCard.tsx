import React, { memo, useMemo, useCallback } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Stack,
  Chip,
} from '@mui/material';
import {
  AspectRatio,
  Palette,
  Image,
} from '@mui/icons-material';
import { useNavigateWithScroll } from '../../hooks/useNavigateWithScroll';
import { FEATURES, PRESENTATION_MESSAGES } from '../../config/features';
import OptimizedImage from '../common/OptimizedImage';

interface Product {
  id: number;
  name: string;
  slug: string;
  price: number;
  special_price?: number;
  images?: string;
  image_url?: string;
  dimensions?: string;
  material?: string;
  finish?: string;
  color?: string;
  is_featured?: boolean;
  stock_quantity?: number;
  category_id: number;
  categories?: {
    name: string;
    slug: string;
  };
}

interface OptimizedProductCardProps {
  product: Product;
  priority?: boolean;
  className?: string;
}

// Memoized helper function for generating product URLs
const generateProductUrl = (product: Product): string => {
  const categorySlug = product.categories?.slug || 'categoria';
  return `/categorii_produse/${categorySlug}/${product.slug}/${product.id}`;
};

// Memoized price display component
const PriceDisplay = memo(({ price, specialPrice }: { price: number; specialPrice?: number }) => {
  if (!FEATURES.SHOW_PRICES) {
    return (
      <Typography variant="h5" color="primary.main" sx={{ fontWeight: 700 }}>
        {PRESENTATION_MESSAGES.PRICE_REQUEST}
      </Typography>
    );
  }

  if (specialPrice && specialPrice < price) {
    return (
      <Box>
        <Typography variant="h5" color="error.main" sx={{ fontWeight: 700 }}>
          {specialPrice.toFixed(2)} RON
          <Chip label="OFERTĂ" color="error" size="small" sx={{ ml: 1 }} />
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ textDecoration: 'line-through' }}
        >
          {price.toFixed(2)} RON
        </Typography>
      </Box>
    );
  }

  return (
    <Typography variant="h5" color="primary.main" sx={{ fontWeight: 700 }}>
      {price.toFixed(2)} RON
    </Typography>
  );
});

PriceDisplay.displayName = 'PriceDisplay';

// Memoized product specs component
const ProductSpecs = memo(({ product }: { product: Product }) => {
  const specs = useMemo(() => {
    const items = [];

    if (product.dimensions) {
      items.push({
        icon: <AspectRatio sx={{ fontSize: 16, color: 'black' }} />,
        text: product.dimensions,
      });
    }

    if (product.color) {
      items.push({
        icon: <Palette sx={{ fontSize: 16, color: 'black' }} />,
        text: product.color,
      });
    }

    return items.slice(0, 2); // Show only first 2 specs
  }, [product.dimensions, product.color]);

  if (specs.length === 0) return null;

  return (
    <Stack spacing={0.5} mb={2}>
      {specs.map((spec, index) => (
        <Box key={index} display="flex" alignItems="center" gap={0.5}>
          {spec.icon}
          <Typography variant="caption" color="primary.main">
            {spec.text}
          </Typography>
        </Box>
      ))}
    </Stack>
  );
});

ProductSpecs.displayName = 'ProductSpecs';

// Main optimized product card component
const OptimizedProductCard: React.FC<OptimizedProductCardProps> = memo(({
  product,
  priority = false,
  className,
}) => {
  const navigate = useNavigateWithScroll();

  // Memoize the product URL to prevent recalculation
  const productUrl = useMemo(() => generateProductUrl(product), [product]);

  // Memoize the click handler
  const handleClick = useCallback(() => {
    navigate(productUrl);
  }, [navigate, productUrl]);

  // Memoize the image source
  const imageSrc = useMemo(() => {
    // Handle both images and image_url fields
    if (product.images) {
      try {
        const images = JSON.parse(product.images);
        return Array.isArray(images) && images.length > 0 ? images[0] : '';
      } catch {
        return product.images;
      }
    }
    return product.image_url || '';
  }, [product.images, product.image_url]);

  return (
    <Card
      className={className}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        borderRadius: 3,
        overflow: 'hidden',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: (theme) => theme.shadows[8],
        },
      }}
      onClick={handleClick}
    >
      {/* Optimized Product Image */}
      <Box sx={{ position: 'relative', paddingBottom: '60%' }}>
        {imageSrc ? (
          <OptimizedImage
            src={imageSrc}
            alt={product.name}
            width="100%"
            height="100%"
            objectFit="cover"
            quality={75} // Slightly reduced quality for product cards
            priority={priority}
            placeholder="skeleton"
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
            }}
          />
        ) : (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'grey.100',
            }}
          >
            <Image sx={{ fontSize: 48, color: 'grey.400' }} />
          </Box>
        )}

        {/* Featured badge */}
        {product.is_featured && (
          <Chip
            label="RECOMANDAT"
            color="secondary"
            size="small"
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              fontWeight: 600,
            }}
          />
        )}
      </Box>

      {/* Product Content */}
      <CardContent sx={{ flexGrow: 1, p: 2 }}>
        {/* Product Name */}
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            mb: 1,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            lineHeight: 1.3,
          }}
        >
          {product.name}
        </Typography>

        {/* Price */}
        <Box mb={2}>
          <PriceDisplay price={product.price} specialPrice={product.special_price} />
        </Box>

        {/* Product Specifications */}
        <ProductSpecs product={product} />

        {/* Category Badge */}
        {product.categories && (
          <Chip
            label={product.categories.name}
            variant="outlined"
            size="small"
            sx={{
              fontSize: '0.75rem',
              height: 24,
            }}
          />
        )}
      </CardContent>
    </Card>
  );
});

OptimizedProductCard.displayName = 'OptimizedProductCard';

// Custom comparison function for React.memo
const arePropsEqual = (
  prevProps: OptimizedProductCardProps,
  nextProps: OptimizedProductCardProps
): boolean => {
  // Deep comparison for product object
  const prevProduct = prevProps.product;
  const nextProduct = nextProps.product;

  // Check if it's the exact same product instance
  if (prevProduct === nextProduct) return true;

  // Compare key fields that affect rendering
  return (
    prevProduct.id === nextProduct.id &&
    prevProduct.name === nextProduct.name &&
    prevProduct.price === nextProduct.price &&
    prevProduct.special_price === nextProduct.special_price &&
    prevProduct.images === nextProduct.images &&
    prevProduct.image_url === nextProduct.image_url &&
    prevProduct.is_featured === nextProduct.is_featured &&
    prevProps.priority === nextProps.priority &&
    prevProps.className === nextProps.className
  );
};

// Export memoized component with custom comparison
export default memo(OptimizedProductCard, arePropsEqual);