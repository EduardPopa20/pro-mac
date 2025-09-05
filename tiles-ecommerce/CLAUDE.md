# CLAUDE.md – Pro-Mac Tiles E-commerce

## 1) Project Context
Modern e-commerce platform replacing promac.ro for tile/ceramics sales with admin dashboard, inventory management, and showroom locations.

### Tech Stack
- **Frontend:** React 18 + Vite + TypeScript + Material-UI (MUI)
- **Backend:** Supabase (Auth, DB, Storage, RLS)
- **State:** Zustand (client) + React Query (server)
- **Routing:** React Router v6
- **Testing:** Playwright (95+ test files)
- **Payments:** Netopia integration

---

## 2) Core Design Rules (MANDATORY)

### Responsive Design
✅ Mobile-first with MUI breakpoints  
✅ Must work on **xs / sm / md / lg / xl**  
✅ Readable text, consistent spacing, touch targets ≥44px  
❌ No horizontal scrolling

**Standard pattern:**
```tsx
import { useTheme, useMediaQuery } from '@mui/material'

const theme = useTheme()
const isMobile = useMediaQuery(theme.breakpoints.down('md'))

<Box
  sx={{
    // mobile first
    property: mobileValue,
    [theme.breakpoints.up('md')]: { property: tabletValue },
    [theme.breakpoints.up('lg')]: { property: desktopValue },
  }}
/>
```

### Breadcrumbs (REQUIRED)
✅ Top-left inside main `Container`, separated from other UI  
✅ Spacing `mb={4}`  
❌ Never inline with back buttons or titles

```tsx
<Container maxWidth="xl" sx={{ py: 4 }}>
  <Box sx={{ mb: 4 }}>
    <Breadcrumbs>
      <Link href="/" color="inherit" sx={{ textDecoration: 'none' }}>Acasă</Link>
      <Typography color="text.primary">Current Page</Typography>
    </Breadcrumbs>
  </Box>
  {/* Page content */}
</Container>
```

### Loading & Empty States
**Loading:**
```tsx
if (loading && dataArray.length === 0) {
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      sx={{ minHeight: 'calc(100vh - 200px)', width: '100%' }}
    >
      <Stack alignItems="center" spacing={2}>
        <CircularProgress size={50} />
        <Typography color="text.secondary">Se încarcă datele...</Typography>
      </Stack>
    </Box>
  )
}
```

---

## 3) Typography & Sizing Standards

### Base & Breakpoints
- **Root font size:** `16px` (1rem)
- **MUI breakpoints:** `xs: 0–599`, `sm: 600–959`, `md: 960–1279`, `lg: 1280–1919`, `xl: 1920+`

### Typography Scale
- **Body:** `body1` = 16px, `body2` = 14px
- **Headings:** `h1` = clamp(32px-56px), `h2` = clamp(28px-40px), `h3` = clamp(24px-32px), `h4` = 20px, `h5` = 16px, `h6` = 14px
- **Caption:** 12px minimum

### Button Sizes & Touch Targets
- **Small:** 32px height, 14px text (36px height on mobile)
- **Medium:** 40px height, 15px text (44px height on mobile)
- **Large:** 48px height, 16px text (maintained on all devices)
- **Mobile (xs/sm):** minimum 44px touch targets for all interactive elements
- **Padding:** ≥16px horizontal (≥24px for primary on desktop)
- **Best Practice:** Use `size={isMobile ? 'small' : 'medium'}` for optimal mobile UX

### Icon Sizes
- **Glyph sizes:** 16px (small), 24px (default), 32px (large)
- **IconButton containers:** 32×32 (small), 40×40 (medium), 48×48 (large)
- **Mobile:** ≥44×44 click area for actionable icons

### TextField Visibility (MANDATORY)
- **Desktop (≥960px):** width ≥100px, font-size ≥16px
- **Tablet (600-959px):** width ≥90px, font-size ≥15px  
- **Mobile (≤599px):** width ≥75px, font-size ≥14px
- **InputAdornments:** Must be fully visible without clipping
- **Error messages:** Must fit within container

```tsx
sx={{
  width: { xs: 80, sm: 90, md: 100 },
  minWidth: { xs: 80, md: 100 },
  flexShrink: 0,
  '& .MuiInputBase-root': {
    fontSize: { xs: '0.875rem', md: '1rem' }
  }
}}
```

---

## 4) Card & Container Sizing

### Container Guidelines
✅ **Use `height: 'fit-content'`** for desktop cards  
✅ **Use `maxHeight: 'calc(100vh - Xpx)'`** to prevent overflow  
✅ **Use `height: '100vh'`** only for mobile full-screen layouts  
❌ **Never use fixed heights** that create white space

### Flex Layout Best Practices
✅ **Use `flex: '0 1 auto'`** for content-fitted containers on desktop  
✅ **Use `flex: '1 1 auto'`** for full-height containers on mobile  
✅ **Always include `minHeight: 0`** for scrollable flex children

---

## 5) Admin Interface Standards

### Enhanced Card Design
```tsx
<Card 
  sx={{ 
    borderRadius: 3, // 12px for modern look
    border: '1px solid',
    borderColor: isActive ? 'success.light' : 'grey.300',
    transition: 'all 0.3s ease',
    '&:hover': {
      borderColor: isActive ? 'success.main' : 'primary.light',
      boxShadow: theme.shadows[6],
      transform: 'translateY(-2px)'
    }
  }}
>
```

### Requirements
- **Breadcrumbs** at top-left of every page (`mb={4}`)
- **Confirmation dialogs** for save/delete/update
- **All admin buttons** must have Tooltips
- **Typography:** Headers use 600-700 font weight
- **Touch targets:** ≥44px on mobile, ≥32px on desktop
- **Responsive:** Tablet support (≥960px) mandatory

---

## 6) TextField Focus Loss Prevention ⚠️

### Critical Bug Prevention
TextFields lose focus after one character due to improper state management.

**❌ BAD:**
```tsx
onChange={(e) => setFormData({ ...formData, name: e.target.value })}
```

**✅ GOOD:**
```tsx
const handleFieldChange = useCallback((field: string) => 
  (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }))
  }, [setFormData])

<TextField onChange={handleFieldChange('name')} />
```

### Requirements
- **All forms** must use functional state updates (`prev => ({ ...prev, ... })`)
- **Always use `useCallback`** for event handlers
- **Test focus retention** during typing

---

## 7) Filter System Standards (Product Pages)

### Filter Behavior
- **Price Range Slider:** Step = `1` for smooth movement
- **Text input sync:** Real-time updates with slider
- **Color chips:** Delete button must NOT open dropdown
- **Event isolation:** Use `preventDefault()` and `stopPropagation()`

### Mobile Responsiveness
- **Mobile (≤959px):** Full-screen modal with "Filtrează produsele" button
- **Desktop (≥960px):** Sidebar with collapse functionality
- **No interference:** Hamburger menu must not interfere with filters

### Component Event Handling
```tsx
// Filter toggle (prevents menu interference)
onClick={(event) => {
  event.stopPropagation()
  toggleFilterExpansion()
}}

// Color chip delete (prevents dropdown opening)
onDelete={(event) => {
  event.stopPropagation()
  event.preventDefault()
  removeColor(value)
}}
```

### Select Dropdown Best Practices
- **Z-index Issues:** Use proper MenuProps to prevent overlay issues
- **Default Values:** Always show meaningful default values in view mode

```tsx
<TextField
  select
  value={editing ? formData.field : (user.field || DEFAULT_VALUE)}
  SelectProps={{
    MenuProps: {
      PaperProps: {
        style: {
          maxHeight: 300,
          zIndex: 1500,
        },
      },
    },
  }}
>
```

---

## 8) Project Structure

### Key Directories
```
src/
├── components/
│   ├── admin/         # Admin components (EnhancedProductForm, etc)
│   ├── common/        # Shared (SearchComponent, CartPopper, etc)
│   ├── calculator/    # Material calculator components
│   └── product/       # Product display (CategoryFilters, etc)
├── pages/            
│   ├── admin/         # Admin routes (Dashboard, ProductManagement)
│   └── [public]       # HomePage, Products, ProductDetail, Cart
├── stores/            # Zustand stores (auth, cart, products, etc)
├── types/             # TypeScript definitions
└── utils/             # Helpers (pdfGenerator, calculatorUtils)
```

### Database Tables
- `profiles` - User accounts with roles (admin/customer)
- `products` - Catalog with tile specifications
- `categories` - Product categorization
- `inventory` - Multi-warehouse stock tracking
- `orders` & `order_items` - Order management
- `showrooms` - Physical locations
- `site_settings` - Global configuration

---

## 9) Common Patterns

### State Management
```tsx
// Zustand for client state
const { user, isAdmin } = useAuthStore()
const { items, addItem } = useCartStore()

// React Query for server state
const { data: products, isLoading } = useQuery({
  queryKey: ['products'],
  queryFn: fetchProducts
})
```

### Supabase Queries
```tsx
// With RLS policies
const { data, error } = await supabase
  .from('products')
  .select('*')
  .eq('category_id', categoryId)
  .order('created_at', { ascending: false })
```

### Romanian Localization
- All user-facing text in Romanian
- Error messages: "Eroare la încărcarea datelor"
- Empty states: "Nu există produse în această categorie"
- Loading: "Se încarcă..."

---

## 10) Testing & Commands

### Development
```bash
npm run dev          # Start dev server (port 5179)
npm run build        # Production build
npm run typecheck    # TypeScript validation
npm run lint         # ESLint checks
```

### Testing
```bash
npx playwright test                    # Run all tests
npx playwright test --ui              # Interactive UI
npx playwright test file.spec.ts      # Single file
```

### Key Test Files
- `showroom-design-analysis.spec.ts` - UI compliance
- `cart-functionality-e2e.spec.ts` - Cart operations
- `filter-responsive-behavior.spec.ts` - Filter system

---

## 11) Commit Rules
- ❌ No automatic commits
- ✅ Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`)
- ✅ Sign with `- Claude`