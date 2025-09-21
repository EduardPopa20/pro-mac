import React, { useState, useRef, useEffect, memo } from 'react';
import { Box, Skeleton, useTheme } from '@mui/material';
import { BrokenImage } from '@mui/icons-material';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number | string;
  height?: number | string;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  quality?: number;
  placeholder?: 'skeleton' | 'blur' | 'none';
  priority?: boolean;
  className?: string;
  onClick?: () => void;
  onLoad?: () => void;
  onError?: () => void;
  style?: React.CSSProperties;
  sx?: any;
}

const OptimizedImage: React.FC<OptimizedImageProps> = memo(({
  src,
  alt,
  width = '100%',
  height = 'auto',
  objectFit = 'cover',
  quality = 80,
  placeholder = 'skeleton',
  priority = false,
  className,
  onClick,
  onLoad,
  onError,
  style,
  sx,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const theme = useTheme();

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || isInView) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px', // Start loading 50px before entering viewport
        threshold: 0.1,
      }
    );

    const currentContainer = containerRef.current;
    if (currentContainer) {
      observer.observe(currentContainer);
    }

    return () => {
      if (currentContainer) {
        observer.unobserve(currentContainer);
      }
    };
  }, [priority, isInView]);

  // Optimize Supabase image URLs
  const getOptimizedSrc = (originalSrc: string, targetQuality: number) => {
    if (!originalSrc) return '';

    // Check if it's a Supabase storage URL
    if (originalSrc.includes('supabase') && originalSrc.includes('storage/v1/object/public/')) {
      // Add quality and resize parameters for Supabase
      const separator = originalSrc.includes('?') ? '&' : '?';
      return `${originalSrc}${separator}quality=${targetQuality}&resize=contain`;
    }

    return originalSrc;
  };

  const handleLoad = () => {
    setIsLoaded(true);
    setIsError(false);
    onLoad?.();
  };

  const handleError = () => {
    setIsError(true);
    setIsLoaded(false);
    onError?.();
  };

  const optimizedSrc = getOptimizedSrc(src, quality);

  const containerStyle = {
    width,
    height,
    display: 'inline-block',
    position: 'relative' as const,
    overflow: 'hidden',
    ...style,
  };

  const imageStyle = {
    width: '100%',
    height: '100%',
    objectFit,
    transition: 'opacity 0.3s ease',
    opacity: isLoaded ? 1 : 0,
  };

  // Error state
  if (isError) {
    return (
      <Box
        ref={containerRef}
        sx={{
          ...containerStyle,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'grey.100',
          color: 'grey.500',
          ...sx,
        }}
        className={className}
        onClick={onClick}
      >
        <BrokenImage sx={{ fontSize: 48 }} />
      </Box>
    );
  }

  return (
    <Box
      ref={containerRef}
      sx={{
        ...containerStyle,
        ...sx,
      }}
      className={className}
      onClick={onClick}
    >
      {/* Skeleton Placeholder */}
      {!isLoaded && placeholder === 'skeleton' && (
        <Skeleton
          variant="rectangular"
          width="100%"
          height="100%"
          animation="wave"
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: 1,
          }}
        />
      )}

      {/* Blur Placeholder */}
      {!isLoaded && placeholder === 'blur' && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'grey.200',
            zIndex: 1,
            backgroundImage: `linear-gradient(45deg, ${theme.palette.grey[100]} 25%, transparent 25%, transparent 75%, ${theme.palette.grey[100]} 75%), linear-gradient(45deg, ${theme.palette.grey[100]} 25%, transparent 25%, transparent 75%, ${theme.palette.grey[100]} 75%)`,
            backgroundSize: '20px 20px',
            backgroundPosition: '0 0, 10px 10px',
            animation: 'pulse 2s infinite',
            '@keyframes pulse': {
              '0%': { opacity: 0.6 },
              '50%': { opacity: 0.8 },
              '100%': { opacity: 0.6 },
            },
          }}
        />
      )}

      {/* Actual Image */}
      {isInView && (
        <img
          ref={imgRef}
          src={optimizedSrc}
          alt={alt}
          style={imageStyle}
          onLoad={handleLoad}
          onError={handleError}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
        />
      )}
    </Box>
  );
});

OptimizedImage.displayName = 'OptimizedImage';

export default OptimizedImage;