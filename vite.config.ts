import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Allow external connections
    port: 5176,      // Set consistent port
  },
  build: {
    // Enable source maps for production debugging
    sourcemap: true,
    // Handle CommonJS dependencies
    commonjsOptions: {
      include: [/react-slick/, /slick-carousel/, /node_modules/]
    },
    // Optimize bundle splitting
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Core vendor chunks for better caching
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
              return 'vendor-react';
            }
            if (id.includes('@mui') || id.includes('@emotion')) {
              return 'vendor-mui';
            }
            if (id.includes('zustand') || id.includes('@tanstack/react-query')) {
              return 'vendor-state';
            }
            if (id.includes('@supabase')) {
              return 'vendor-supabase';
            }
            if (id.includes('jspdf') || id.includes('html2canvas')) {
              return 'vendor-pdf';
            }
            if (id.includes('react-slick') || id.includes('slick-carousel')) {
              return 'vendor-media';
            }
            if (id.includes('date-fns') || id.includes('react-hook-form') || id.includes('zod') || id.includes('joi')) {
              return 'vendor-utils';
            }
          }

          // Feature-based chunks for src files
          if (id.includes('src/pages/admin/') || id.includes('src/components/admin/')) {
            return 'admin';
          }
          if (id.includes('src/components/product') || id.includes('src/pages/Products') || id.includes('src/pages/ProductDetail')) {
            return 'features-product';
          }
          if (id.includes('src/components/auth') || id.includes('src/pages/Conectare') || id.includes('src/pages/CreeazaCont')) {
            return 'features-auth';
          }
        },
      },
    },
    // Optimize chunk size warnings
    chunkSizeWarningLimit: 1000,
    // Minification settings
    target: 'esnext',
    minify: 'esbuild',
    // CSS code splitting
    cssCodeSplit: true,
    // Optimize assets
    assetsInlineLimit: 4096, // Inline assets < 4KB
  },
  // Performance optimizations
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      '@mui/material',
      '@mui/icons-material',
      '@emotion/react',
      '@emotion/styled',
      'zustand',
      '@tanstack/react-query',
      '@supabase/supabase-js',
      'react-slick',  // Include react-slick for proper CommonJS transformation
      'slick-carousel'
    ],
    exclude: [
      // Exclude large libraries that benefit from dynamic imports
      'jspdf',
      'html2canvas'
    ]
  }
})
