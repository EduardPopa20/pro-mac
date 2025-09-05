import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Use SWC for faster builds
      fastRefresh: true,
      // Babel config for optimizations
      babel: {
        plugins: [
          // Remove console logs in production
          process.env.NODE_ENV === 'production' && ['transform-remove-console', { exclude: ['error', 'warn'] }]
        ].filter(Boolean)
      }
    })
  ],
  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@stores': path.resolve(__dirname, './src/stores'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@types': path.resolve(__dirname, './src/types')
    }
  },

  build: {
    // Output directory
    outDir: 'dist',
    
    // Generate source maps for debugging (disable in production for smaller builds)
    sourcemap: process.env.NODE_ENV !== 'production',
    
    // Chunk size warning limit
    chunkSizeWarningLimit: 500,
    
    // Minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: process.env.NODE_ENV === 'production',
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info'],
        passes: 2
      },
      format: {
        comments: false
      }
    },
    
    // Rollup options for code splitting
    rollupOptions: {
      output: {
        // Manual chunks for better caching
        manualChunks: (id) => {
          // Core vendor chunk
          if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
            return 'vendor-react'
          }
          
          // MUI chunk
          if (id.includes('@mui') || id.includes('@emotion')) {
            return 'vendor-mui'
          }
          
          // Utilities chunk
          if (id.includes('zustand') || id.includes('react-query') || id.includes('date-fns') || 
              id.includes('react-hook-form') || id.includes('@tanstack')) {
            return 'vendor-utils'
          }
          
          // Carousel and heavy UI libraries
          if (id.includes('slick') || id.includes('react-slick')) {
            return 'vendor-carousel'
          }
          
          // Supabase chunk
          if (id.includes('supabase')) {
            return 'vendor-supabase'
          }
          
          // Admin chunk
          if (id.includes('src/pages/admin') || id.includes('src/components/admin')) {
            return 'admin'
          }
        },
        
        // Asset file naming
        assetFileNames: (assetInfo) => {
          let extType = assetInfo.name.split('.').at(1)
          if (/png|jpe?g|svg|gif|tiff|bmp|ico|webp/i.test(extType)) {
            extType = 'img'
          }
          return `assets/${extType}/[name]-[hash][extname]`
        },
        
        // Chunk file naming
        chunkFileNames: 'assets/js/[name]-[hash].js',
        
        // Entry file naming
        entryFileNames: 'assets/js/[name]-[hash].js'
      },
      
      // External dependencies (if using CDN)
      external: [],
      
      // Tree shaking
      treeshake: {
        preset: 'recommended',
        moduleSideEffects: 'no-external'
      }
    },
    
    // CSS code splitting
    cssCodeSplit: true,
    
    // Asset size limit (in bytes)
    assetsInlineLimit: 4096,
    
    // Target browsers
    target: 'es2015',
    
    // Polyfill
    polyfillModulePreload: true,
    
    // Report compressed size
    reportCompressedSize: false, // Disable for faster builds
    
    // CSS minification
    cssMinify: true
  },

  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@mui/material',
      '@mui/icons-material',
      'zustand',
      '@tanstack/react-query',
      '@supabase/supabase-js'
    ],
    exclude: [],
    esbuildOptions: {
      target: 'es2015'
    }
  },

  // Server configuration
  server: {
    port: 5184,
    open: false,
    cors: true,
    
    // Proxy configuration for API calls
    proxy: {
      '/api': {
        target: process.env.VITE_SUPABASE_URL,
        changeOrigin: true,
        secure: false
      }
    },
    
    // HMR configuration
    hmr: {
      overlay: true
    },
    
    // Watch options
    watch: {
      usePolling: false
    }
  },

  // Preview server configuration
  preview: {
    port: 4173,
    open: false,
    cors: true
  },

  // CSS configuration
  css: {
    modules: {
      localsConvention: 'camelCase'
    },
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/styles/variables.scss";`
      }
    },
    postcss: {
      plugins: [
        // Add PostCSS plugins if needed
      ]
    }
  },

  // Worker configuration
  worker: {
    format: 'es',
    rollupOptions: {
      output: {
        entryFileNames: 'assets/worker/[name]-[hash].js'
      }
    }
  },

  // Environment variables prefix
  envPrefix: 'VITE_',

  // JSON handling
  json: {
    namedExports: true,
    stringify: false
  },

  // Logging level
  logLevel: 'info',

  // Clear screen on startup
  clearScreen: true,

  // App type
  appType: 'spa'
})