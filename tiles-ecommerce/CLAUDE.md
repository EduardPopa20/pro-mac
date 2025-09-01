# CLAUDE.md – Pro-Mac Tiles E-commerce

## 1) Project Overview
- **Frontend:** React 18 + Vite + TypeScript + Material-UI (MUI)
- **Backend:** Supabase (Auth, DB, Storage, RLS)
- **State:** Zustand (client) + React Query (server)
- **Routing:** React Router v6
- **Other:** React Slick (carousel), reCAPTCHA v3
- **Goal:** Replace https://www.promac.ro with a modern, responsive e-commerce platform

---

## 2) Development Rules

### Responsive Design (MANDATORY)
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

**Golden snippet:**
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

### Loading & Empty States (CONSISTENT PATTERNS)
**Loading (required):**
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

**Empty state:**
```tsx
{dataArray.length === 0 ? (
  <Box display="flex" flexDirection="column" alignItems="center" sx={{ py: 8, textAlign: 'center' }}>
    <RelevantIcon sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
    <Typography variant="h5" color="text.secondary" gutterBottom>Nu există elemente</Typography>
    <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 400 }}>
      Descriptive message explaining the empty state.
    </Typography>
    <Button variant="contained" startIcon={<Add />} onClick={handleAddFunction} size="large">
      Adaugă Primul Element
    </Button>
  </Box>
) : (
  // Regular table/content
)}
```

---

## 3) Authentication & Security

- Supabase Auth + `profiles` table (roles: `admin` / `customer`)
- Row Level Security enforced for sensitive ops
- Strong passwords: 8+ chars, upper/lower/digit/special
- Email normalization (lowercase, trim) before auth ops
- Romanian error messages
- reCAPTCHA v3 on signup
- Email verification via OTP + redirect to `/auth/verify-email`

**Profiles schema (core):**
```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('admin','customer')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  PRIMARY KEY (id)
);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Enable insert for authenticated users only" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
```

---

## 4) Admin Dashboard Rules (UX Standards)

- **Inline editing only** → **List → Form → Preview** (❌ no modals)
- **Confirmation dialogs** required for save/delete/update
- **Breadcrumbs** at top-left of every main-content page
- **All admin buttons** must have Tooltips
- **Preview** must mirror client-facing view
- **Responsive**: tablet support (≥960px) is mandatory

---

## 5) Features & Status (Summary)

✅ Auth with email verification + reCAPTCHA  
✅ Admin Dashboard (settings, showrooms, products)  
✅ Product Management (CRUD, categories, featured, previews)  
✅ Public Product Catalog (responsive grid, filters, modal specs, full-screen images)  
✅ **Product Detail Page** (enhanced competitor-inspired layout, comprehensive properties table)  
✅ Contact Form + Edge Function email notifications  
✅ Newsletter subscription system (modal + DB + RLS)

🔄 Next: Contact messages admin view + auto-response; Inventory; Audit logging & bulk ops; Checkout + payments

> For detailed progress, see `STATUS.md`.

---

## 6) Setup Instructions

1) **Database:** run `database/admin-schema.sql` in Supabase  
2) **Storage:** configure `product-images` per `database/storage-setup.md`  
3) **Admin Access:** set user role → `UPDATE profiles SET role='admin' WHERE id = '...'`  
4) **reCAPTCHA:** `.env`
```
VITE_RECAPTCHA_SITE_KEY=your_site_key_here
```
5) **Local dev:**
```bash
npm run dev
npm run typecheck
npm run lint
npm run build
```

---

## 7) Commit Rules

- ❌ No automatic commits
- ✅ Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`, etc.)
- ✅ Sign with `- Claude`

---

## 8) Typography, Icon & Button Sizing Standard **(+ Playwright MCP Enforcement)**

> **MANDATORY:** All UI must follow these sizes. Claude Code must both **implement** and **verify** them using **Playwright MCP** before completing any UI task.

### 8.1 Base & Breakpoints
- **Root font size:** `16px` (1rem)
- **MUI breakpoints:** `xs: 0–599`, `sm: 600–959`, `md: 960–1279`, `lg: 1280–1919`, `xl: 1920+`

### 8.2 Typography Scale (MUI `theme.typography`)
- Use `rem` + `clamp()` for fluid scaling; never go below **12px** anywhere.
- **Body:**
  - `body1`: `1rem` (16px), line-height **1.6**
  - `body2`: `0.875rem` (14px), line-height **1.5**
- **Headings (fluid):**
  - `h1`: `clamp(2rem, 5vw, 3.5rem)` → ~32–56px
  - `h2`: `clamp(1.75rem, 3.5vw, 2.5rem)` → ~28–40px
  - `h3`: `clamp(1.5rem, 2.5vw, 2rem)` → ~24–32px
  - `h4`: `1.25rem` (20px)
  - `h5`: `1rem` (16px)
  - `h6`: `0.875rem` (14px, semibold suggested)
- **Caption/overline:** `0.75rem` (12px), medium/semi-bold

**Theme snippet (`src/theme.ts`):**
```ts
import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  typography: {
    fontSize: 16,
    h1: { fontSize: 'clamp(2rem, 5vw, 3.5rem)', lineHeight: 1.15, fontWeight: 700 },
    h2: { fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)', lineHeight: 1.2, fontWeight: 700 },
    h3: { fontSize: 'clamp(1.5rem, 2.5vw, 2rem)', lineHeight: 1.25, fontWeight: 600 },
    h4: { fontSize: '1.25rem', lineHeight: 1.3, fontWeight: 600 },
    h5: { fontSize: '1rem', lineHeight: 1.35, fontWeight: 600 },
    h6: { fontSize: '0.875rem', lineHeight: 1.4, fontWeight: 600 },
    body1: { fontSize: '1rem', lineHeight: 1.6 },
    body2: { fontSize: '0.875rem', lineHeight: 1.5 },
    caption: { fontSize: '0.75rem', lineHeight: 1.4, fontWeight: 500 },
    overline: { fontSize: '0.75rem', letterSpacing: '0.08em', textTransform: 'uppercase' }
  },
  breakpoints: { values: { xs: 0, sm: 600, md: 960, lg: 1280, xl: 1920 } }
});
```

### 8.3 Button Sizes (visual + touch targets)
- Visual heights & fonts:
  - `small` → **32px** height, **14px** text
  - default → **40px** height, **16px** text
  - `large` → **48px** height, **16–18px** text
- **xs/sm:** ensure **min-height ≥44px** (prefer 48px for primary).  
- Horizontal padding: ≥16px per side (≥24px for primary at `md+`).

**Theme overrides:**
```ts
components: {
  MuiButton: {
    styleOverrides: {
      root: ({ theme }) => ({
        fontWeight: 600,
        borderRadius: 10,
        [theme.breakpoints.down('sm')]: { minHeight: 44 }
      }),
      sizeSmall: { fontSize: '0.875rem', padding: '4px 10px', minHeight: 32 },
      sizeMedium: { fontSize: '1rem', padding: '8px 16px', minHeight: 40 },
      sizeLarge: { fontSize: '1rem', padding: '12px 20px', minHeight: 48 }
    }
  }
}
```

### 8.4 Icon & IconButton Sizes
- Glyph sizes: **16px** (small), **24px** (default), **32px** (large)
- `IconButton` containers:
  - `small` → **32×32**
  - `medium` → **40×40**
  - `large` → **48×48**
- **xs/sm actionable icons:** ensure **≥44×44** click area.

**Theme overrides:**
```ts
components: {
  MuiIconButton: {
    styleOverrides: {
      root: ({ theme }) => ({
        [theme.breakpoints.down('sm')]: { minWidth: 44, minHeight: 44 }
      }),
      sizeSmall: { width: 32, height: 32 },
      sizeMedium: { width: 40, height: 40 },
      sizeLarge: { width: 48, height: 48 }
    }
  },
  MuiSvgIcon: {
    styleOverrides: {
      fontSizeSmall: { fontSize: 16 },
      fontSizeMedium: { fontSize: 24 },
      fontSizeLarge: { fontSize: 32 }
    }
  }
}
```

### 8.5 Required `sx` pattern (mobile-first)
```tsx
sx={{
  fontSize: '1rem', lineHeight: 1.6,
  [theme.breakpoints.up('md')]: { fontSize: '1.0625rem' }, // 17px (opt)
  [theme.breakpoints.up('lg')]: { fontSize: '1.125rem' }    // 18px (opt)
}}
```

### 8.6 TextField Visibility Requirements **(MANDATORY)**
All TextFields, especially in forms and filters, must meet these visibility standards:
- **Desktop (≥960px):** TextField width ≥100px, readable font-size ≥16px
- **Tablet (600-959px):** TextField width ≥90px, readable font-size ≥15px  
- **Mobile (≤599px):** TextField width ≥75px, readable font-size ≥14px
- **InputAdornments:** Suffix text (like "RON") must be fully visible without clipping
- **Error states:** Error messages must fit within container without text clipping
- **Responsive behavior:** TextFields must adapt gracefully across all breakpoints

**Required responsive TextField pattern:**
```tsx
sx={{
  width: { xs: 80, sm: 90, md: 100 },
  minWidth: { xs: 80, md: 100 },
  flexShrink: 0, // Prevent unwanted shrinking
  '& .MuiInputBase-root': {
    fontSize: { xs: '0.875rem', md: '1rem' }
  },
  '& .MuiInputAdornment-root': {
    '& .MuiTypography-root': {
      fontSize: { xs: '0.75rem', md: '0.875rem' }
    }
  }
}}
```

### 8.7 Verification (Playwright MCP) — **Claude must run**
Claude Code **must** use Playwright MCP to verify at `xs`, `md`, `lg`:
1. **Typography:** computed `font-size` for `h1..h6`, `body1/2`, `caption` in key pages.  
2. **Buttons:** `min-height`, `font-size`, horizontal padding; **≥44px** at `xs/sm`.  
3. **Icons:** `MuiSvgIcon` glyph sizes; `IconButton` bounding boxes; **≥44px** at `xs/sm` if actionable.  
4. **TextFields:** Width compliance per 8.6 requirements, no content clipping, full visibility of adornments.
5. **No horizontal scroll** at any breakpoint.

Use **role/name** or `data-testid` selectors (no brittle CSS).

**Playwright helpers (`tests/utils.ts`):**
```ts
export async function setViewport(page, bp: 'xs'|'sm'|'md'|'lg'|'xl') {
  const sizes = { xs:[360,720], sm:[600,900], md:[960,1000], lg:[1280,1000], xl:[1920,1080] };
  const [w,h] = sizes[bp]; await page.setViewportSize({ width: w, height: h });
}
export async function computedPx(page, locator: import('@playwright/test').Locator, prop: string) {
  return await locator.evaluate((el, prop) => getComputedStyle(el as Element).getPropertyValue(prop), prop);
}
```

**Example spec (`tests/controls.spec.ts`):**
```ts
import { test, expect } from '@playwright/test';
import { setViewport } from './utils';

test.describe('Buttons & IconButtons', () => {
  for (const bp of ['xs','md'] as const) {
    test(`sizes @${bp}`, async ({ page }) => {
      await page.goto('http://localhost:5173/');
      await setViewport(page, bp);

      const anyButton = page.getByRole('button').first();
      const box = await anyButton.boundingBox();
      expect(box?.height).toBeGreaterThanOrEqual(bp === 'xs' ? 44 : 40);

      const hasScroll = await page.evaluate(() =>
        document.documentElement.scrollWidth > document.documentElement.clientWidth);
      expect(hasScroll).toBeFalsy();
    });
  }
});
```

**Run (Claude via MCP):**
```
npm run dev
# In Claude Code:
Use Playwright MCP to open http://localhost:5173, run tests, and if failures occur, patch theme/components and re-run until all pass.
```

---

## 9) Card & Container Sizing Guidelines

**MANDATORY:** All cards, modals, and containers must follow proper sizing to avoid unnecessary white space.

### Card Height & Content Fitting
✅ **Use `height: 'fit-content'`** for desktop cards that should size to their content  
✅ **Use `maxHeight: 'calc(100vh - Xpx)'`** to prevent viewport overflow (where X = header + margins)  
✅ **Use `height: '100vh'`** only for mobile full-screen layouts  
❌ **Never use fixed heights** that create white space below content

### Flex Layout Best Practices
✅ **Use `flex: '0 1 auto'`** for content-fitted containers on desktop  
✅ **Use `flex: '1 1 auto'`** for full-height containers on mobile  
✅ **Always include `minHeight: 0`** for scrollable flex children  
❌ **Avoid `flexGrow: 1`** unless you want the container to fill available space

### Container Patterns
```tsx
// Desktop: Content-fitted card
<Box sx={{
  height: 'fit-content',
  maxHeight: 'calc(100vh - 120px)', // Leave space for header/margins
  overflow: 'auto'
}}>

// Mobile: Full-screen card
<Box sx={{
  height: { xs: '100vh', md: 'fit-content' },
  maxHeight: { xs: '100vh', md: 'calc(100vh - 120px)' }
}}>

// Scrollable content inside card
<Box sx={{
  overflow: 'auto',
  flex: { xs: '1 1 auto', md: '0 1 auto' }, // Fill on mobile, fit on desktop
  minHeight: 0
}}>
```

### Auth Form Example (Reference)
The Auth form demonstrates proper responsive card sizing:
- Mobile: Full viewport height with internal scrolling
- Desktop: Content-fitted height with maximum viewport constraint
- No unnecessary white space below form content
- Proper flex layout for scrollable form sections

---

## 10) Product Detail Page Standards

> **MANDATORY:** Product detail pages must be fully visible in viewport on initial load without vertical scrolling.

### 10.1 Viewport Optimization Rules
✅ **No vertical scroll** on initial page load across all breakpoints  
✅ **Action buttons** (`Adaugă în coș`, `Contactează-ne`) must be visible without scrolling  
✅ **Full-screen image functionality** with dark backdrop and proper aspect ratio  
✅ **Breadcrumbs only** - no back buttons or "înapoi la X" titles  
❌ **Never use fixed heights** that cause content overflow

### 10.2 Layout Specifications - Smart Viewport Adaptation
- **Container padding:** `py: 3, pt: 8` (balanced spacing for readability)
- **Grid spacing:** `spacing={3}` (comfortable spacing)
- **Image card:** `maxHeight: { xs: '400px', md: 'min(400px, calc(100vh - 300px))' }` (intelligent viewport adaptation)
- **Details section:** `maxHeight: { xs: 'none', md: 'min(500px, calc(100vh - 300px))' }` with `overflow: 'auto'`
- **Breadcrumbs:** Absolute positioned at `top: 16, left: 24`
- **Description:** Full text, proper readability maintained
- **Specifications:** Normal padding, scrollable only when viewport requires it
- **Buttons:** Always visible with `pt: 2` and `mt: 'auto'`

### 10.3 Full-Screen Image Dialog
```tsx
<Dialog
  open={fullScreenImage}
  onClose={() => setFullScreenImage(false)}
  maxWidth={false}
  fullScreen
  sx={{
    '& .MuiDialog-paper': {
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }}
  BackdropComponent={Backdrop}
  BackdropProps={{ sx: { backgroundColor: 'rgba(0, 0, 0, 0.9)' } }}
>
  <DialogContent sx={{ 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center',
    maxWidth: '90vw',
    maxHeight: '90vh'
  }}>
    {/* Image with objectFit: 'contain' for proper aspect ratio */}
    <Box
      component="img"
      src={product.image_url}
      alt={product.name}
      sx={{
        maxWidth: '100%',
        maxHeight: '100%',
        objectFit: 'contain'
      }}
    />
  </DialogContent>
</Dialog>
```

### 10.4 Smart Viewport Adaptation Strategy
Product detail pages use intelligent CSS `calc()` for dynamic sizing:
- **Dynamic sizing:** `min(400px, calc(100vh - 300px))` adapts to actual viewport
- **Minimum sizes:** Images never smaller than 300px for visibility
- **Content quality:** No forced truncation or compression
- **Intelligent overflow:** Content scrolls only when necessary
- **Button guarantee:** Action buttons always visible via flexbox `mt: 'auto'`

### 10.5 Testing Requirements
Product detail pages must pass these validation tests:
- No vertical scroll on initial load (all common laptop resolutions)
- Action buttons (`Adaugă în coș`, `Contactează-ne`) visible without scrolling
- Content fits within 220px card height constraints
- Touch targets ≥44px on mobile
- Typography standards compliance
- Full-screen image functionality

**Test files:** 
- `tests/product-detail-viewport.spec.ts` (implementation validation)
- `tests/product-detail-optimized.spec.ts` (dimension analysis)

---

## 11) Enhanced Product Properties System

> **NEW FEATURE**: Comprehensive product properties inspired by industry-leading tile e-commerce competitors. Database schema enhanced with 20+ new fields for professional tile specifications.

### 11.1 Enhanced Database Schema
**New product properties added to `products` table:**

**Brand & Identification:**
- `brand` (VARCHAR) - Manufacturer brand (e.g., CERAMAXX)
- `product_code` (VARCHAR) - Manufacturer product code  
- `sku` (VARCHAR) - Internal SKU identifier
- `quality_grade` (INTEGER) - Quality grade 1-3 (1=Premium)

**Technical Specifications:**
- `thickness` (DECIMAL) - Tile thickness in mm
- `surface_finish` (VARCHAR) - Detailed surface finish description
- `texture` (VARCHAR) - Texture type (e.g., "Marble-like")
- `origin_country` (VARCHAR) - Country of manufacture

**Physical Properties:**
- `weight_per_box` (DECIMAL) - Box weight in kg
- `area_per_box` (DECIMAL) - Coverage area per box in m²
- `tiles_per_box` (INTEGER) - Number of tiles per box

**Technical Capabilities (Boolean flags):**
- `is_rectified` - Precision-cut edges at 90°
- `is_frost_resistant` - Freeze/thaw resistance
- `is_floor_heating_compatible` - Underfloor heating compatibility

**Application & Suitability:**
- `application_areas` (JSONB) - Array of application zones
- `suitable_for_walls/floors/exterior/commercial` (Boolean flags)

**Enhanced Pricing:**
- `standard_price/special_price` (DECIMAL) - Multi-tier pricing
- `price_unit` (VARCHAR) - Pricing unit (mp/buc/cutie)
- `stock_quantity` (DECIMAL) - Available stock in m²

**Professional Details:**
- `estimated_delivery_days` (INTEGER)
- `installation_notes/care_instructions` (TEXT)

### 11.2 Product Detail Page Layout (Competitor-Inspired)
**Desktop Layout:**
- Image gallery (left 50%) + Comprehensive table (right 50%)
- Professional specifications table with icons and visual indicators
- Brand chips, quality grades, stock status indicators
- Special/standard pricing with discount visualization

**Mobile Layout:**
- Image gallery (full width, top)
- Comprehensive table (full width, below image)
- Touch-optimized controls and responsive spacing

**Key Features:**
- ✅ **No vertical scroll** on initial load (viewport-optimized)
- ✅ **Professional table layout** with categorized sections
- ✅ **Visual status indicators** (stock, capabilities, suitability)
- ✅ **Enhanced pricing display** (special offers, discounts)
- ✅ **Full-screen image dialog** with proper aspect ratio

### 11.3 Admin Dashboard Enhancement
**Modern Grid-Based Form:**
- **8 organized sections:** Basic Info, Brand & ID, Tech Specs, Physical Props, Capabilities, Suitability, Pricing, Additional Details
- **Smart form controls:** Number inputs, select dropdowns, switch toggles
- **Validation:** Real-time validation with proper type conversion
- **Professional UX:** Grouped fields, clear labeling, helpful placeholders

**Form Sections:**
1. **Basic Info** - Name, description, category
2. **Brand & Identification** - Brand, codes, quality grade  
3. **Technical Specifications** - Dimensions, thickness, materials, finishes
4. **Physical Properties** - Weight, area, tiles per box
5. **Technical Capabilities** - Boolean flags with descriptive labels
6. **Suitability** - Wall/floor/exterior/commercial compatibility
7. **Application Areas** - Comma-separated zones (converted to JSON array)
8. **Pricing & Stock** - Multi-tier pricing, stock management, delivery times
9. **Additional Details** - Installation notes, care instructions

### 11.4 Database Migration Required
Execute `database/enhanced-products-schema.sql` in Supabase to add all new columns:
```sql
-- Run this migration to add enhanced product properties
-- Includes 20+ new columns, indexes, constraints, and sample data
-- Creates enhanced_products view with calculated fields
```

---

## 12) Product Filter Pages Requirements (/gresie & /faianta) **(MANDATORY)**

> **CRITICAL:** These pages have comprehensive filter functionality that must be maintained with highest quality standards. All changes must respect existing patterns and pass validation tests.

### 12.1 Filter Behavior Standards
**Price Range Slider:**
- ✅ **Smooth movement:** Slider step must be `1` (not 10) for fluid interaction
- ✅ **Text input sync:** Price inputs must update in real-time with slider movement
- ✅ **Validation:** Show error alerts for invalid ranges (min > max)
- ✅ **No jumping:** Slider must show all intermediate values (94, 93, 92...) during movement

**Color Filter Chips:**
- ✅ **Delete behavior:** Chip X button must NOT open dropdown unexpectedly
- ✅ **Event isolation:** Use `preventDefault()` and `stopPropagation()` on chip delete
- ✅ **Multiple selection:** Users can select/deselect multiple colors independently

**Filter State Management:**
- ✅ **No reset on Save:** Save button must NOT reset user's filter selections
- ✅ **Unsaved changes detection:** Prevent automatic state updates when user has pending changes
- ✅ **Clear filters:** Dedicated "Șterge tot" button to reset all filters to defaults

### 12.2 Mobile Responsiveness (Critical)
**Mobile Modal Pattern (≤959px):**
- ✅ **Trigger button:** "Filtrează produsele" with active state indication
- ✅ **Full-screen modal:** Dialog covers entire viewport for optimal mobile UX
- ✅ **Modal structure:** Header + scrollable content + action buttons (Cancel/Apply)
- ✅ **Auto-close:** Modal closes after applying filters successfully

**Desktop Sidebar (≥960px):**
- ✅ **Filter card:** Always visible sidebar with collapse functionality
- ✅ **Loading skeleton:** FilterSkeleton component during data loading
- ✅ **No interference:** Hamburger menu must not interfere with filter interactions

### 12.3 TextField Visibility (Enhanced Requirements)
**Responsive Width Standards:**
- ✅ **Desktop (≥960px):** Price inputs ≥100px width for full visibility
- ✅ **Tablet (600-959px):** Price inputs ≥90px width
- ✅ **Mobile (≤599px):** Price inputs ≥75px width, must fit within viewport
- ✅ **Currency suffix:** "RON" text must be fully visible without clipping
- ✅ **Error messages:** Must display completely within container bounds

**Implementation Pattern:**
```tsx
// Price TextField responsive sizing
sx={{
  width: { xs: 80, sm: 90, md: 100 },
  minWidth: { xs: 75, md: 100 },
  flexShrink: 0,
  '& .MuiInputBase-root': {
    fontSize: { xs: '0.875rem', md: '1rem' }
  }
}}
```

### 12.4 Event Isolation & Interaction
**Hamburger Menu Interference Prevention:**
- ✅ **stopPropagation():** All filter toggle buttons must prevent event bubbling
- ✅ **Z-index hierarchy:** Drawers > Filter modals > Filter cards > Background
- ✅ **Focus management:** Proper focus handling between menu and filter interactions

**Component Event Handling:**
```tsx
// Filter toggle button (prevents menu interference)
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

### 12.5 Comprehensive Test Coverage
**Test Files (MANDATORY for changes):**
- `tests/product-filter-functionality.spec.ts` - Core filter functionality
- `tests/hamburger-filter-interference.spec.ts` - Menu interaction isolation
- `tests/textfield-visibility.spec.ts` - Visual validation of sizing
- `tests/filter-behavior-regression.spec.ts` - Complete regression suite

**Test Validation Requirements:**
- ✅ **All breakpoints:** xs/sm/md/lg/xl responsive behavior
- ✅ **Filter interactions:** Price slider, color selection, clear/save actions
- ✅ **Mobile modal:** Full-screen dialog behavior and button states
- ✅ **Edge cases:** Invalid inputs, empty states, rapid interactions
- ✅ **Performance:** Layout stability (CLS < 0.1), no horizontal scroll

**Run before any filter changes:**
```bash
npx playwright test product-filter-functionality.spec.ts
npx playwright test hamburger-filter-interference.spec.ts  
npx playwright test textfield-visibility.spec.ts
npx playwright test filter-behavior-regression.spec.ts
```

### 12.6 Filter Card Architecture
**Loading State (Desktop):**
- ✅ **FilterSkeleton component:** Show during initial data load
- ✅ **Structured skeleton:** Header, price section, color section with proper spacing
- ✅ **Responsive skeleton:** Adapt to desktop layout requirements

**Component Structure:**
```tsx
// FilterContent component (reusable for desktop + mobile modal)
const FilterContent = ({ filters, onFilterChange, compact = false }) => {
  // Price range section with slider + text inputs
  // Color selection with multi-select dropdown
  // Clear filters button when filters applied
}

// Desktop usage: <FilterContent filters={filters} onFilterChange={setFilters} />
// Mobile modal: <FilterContent filters={localFilters} onFilterChange={setLocalFilters} compact={true} />
```

### 12.7 Performance & Accessibility
**Requirements:**
- ✅ **Touch targets:** ≥44px on mobile for all interactive elements
- ✅ **Keyboard navigation:** Full keyboard support for all filter controls
- ✅ **Screen readers:** Proper ARIA labels and announcements
- ✅ **Layout stability:** No cumulative layout shift during filter interactions
- ✅ **Memory efficiency:** Proper cleanup of event listeners and timeouts

---

## 13) Feature Development Workflow (Claude must follow)

1) **Understand & plan**  
   - Identify routes, states (Zustand/React Query), data requirements, and RLS constraints.  
   - Confirm breadcrumbs positioning and page structure up front.

2) **Scaffold**  
   - Create page/component with **mandatory breadcrumbs** top-left (`mb={4}`).  
   - Implement **loading** and **empty** states from Section 2.

3) **Implement UI**  
   - Apply **Section 8** sizes via theme or `sx`.  
   - Ensure **≥44px** touch targets on `xs/sm`.  
   - Add Tooltips for all admin buttons.
   - **⚠️ CRITICAL: Always test TextField focus behavior** (see Section 14).

4) **Accessibility**  
   - Use semantic roles; label all inputs/buttons; ensure keyboard focus order.  
   - Prefer role/name selectors; add `data-testid` where needed.

5) **Tests & MCP validation**  
   - Create/extend Playwright specs to assert typography, button/icon sizes, and no horizontal scroll.  
   - **Run via Playwright MCP** at `xs`, `md`, `lg`. Fix & re-run until green.
   - **Test TextField focus retention** during typing (add to all form tests).

6) **Performance & polish**  
   - Avoid layout shift; optimize images; defer non-critical work.  
   - Verify responsive behavior at **xs/sm/md/lg/xl**.

7) **Commit**  
   - Conventional commit with scope (e.g., `feat(products): responsive card sizes`)  
   - Sign with `- Claude`

---

## 14) CRITICAL: TextField Focus Loss Prevention ⚠️

### Problem (CONFIRMED BUG in Admin Dashboard)
TextFields lose focus after typing **one character** due to **improper state management patterns**. This makes forms completely unusable.

### Root Cause
```tsx
// ❌ BAD: Creates new object reference on every keystroke
onChange={(e) => setFormData({ ...formData, name: e.target.value })}
```

**Why this breaks:**
1. Every keystroke → new object reference → React re-render
2. TextField gets unmounted/remounted → **immediate focus loss**
3. User cannot type more than one character at a time

### Solution Pattern (MANDATORY)
```tsx
// ✅ GOOD: Use stable callback with functional updates
const handleFieldChange = useCallback((field: string) => 
  (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }))
  }, [setFormData])

// Usage:
<TextField
  onChange={handleFieldChange('name')}
  // ... other props
/>
```

### Additional Requirements
- **All form components** must use functional state updates (`prev => ({ ...prev, ... })`)
- **Always use `useCallback`** for event handlers that update state
- **Test focus retention** in Playwright specs: type multiple characters without losing focus
- **Never** directly mutate state objects or create new references in render cycles

### Testing Pattern
```tsx
// Add to all form tests
await nameField.click();
await nameField.type('Test', { delay: 100 });
const isFocused = await nameField.evaluate(el => el === document.activeElement);
expect(isFocused).toBe(true); // Must maintain focus
```

**Status**: ✅ **FIXED** - Critical bugs resolved in `EnhancedShowroomForm.tsx` and `WorkingHoursEditor.tsx`. All TextFields now use `useCallback` with functional state updates to prevent focus loss. Always follow this pattern for new forms.

---

## 14) Enhanced Admin Interface Design Standards

> **MANDATORY:** All admin interfaces must follow these enhanced design patterns for consistency, professionalism, and optimal UX.

### 14.1 Enhanced Card Design
**Card Architecture:**
```tsx
// Enhanced card with proper elevation and borders
<Card 
  sx={{ 
    borderRadius: 3, // 12px for modern look
    border: '1px solid',
    borderColor: isActive ? 'success.light' : 'grey.300',
    transition: 'all 0.3s ease',
    '&:hover': {
      borderColor: isActive ? 'success.main' : 'primary.light',
      boxShadow: theme.shadows[6],
      transform: 'translateY(-2px)' // Subtle lift effect
    },
    position: 'relative',
    overflow: 'visible' // For floating badges
  }}
>
```

**Visual Requirements:**
- ✅ **Border radius:** ≥12px for modern appearance
- ✅ **Status-based borders:** Different colors for active/inactive states  
- ✅ **Hover effects:** Smooth transitions with elevation and slight movement
- ✅ **Floating badges:** Absolute positioning for status indicators
- ✅ **Gradient headers:** Professional background gradients for card headers

### 14.2 Card-Based Form Sections
**Section Architecture:**
```tsx
const FormSection: React.FC = ({ icon, title, children, color = 'primary' }) => (
  <Paper 
    elevation={2} 
    sx={{ 
      p: 3, 
      border: '1px solid',
      borderColor: `${color}.light`,
      borderRadius: 2,
      '&:hover': {
        borderColor: `${color}.main`,
        boxShadow: theme.shadows[4]
      }
    }}
  >
    <Box display="flex" alignItems="center" gap={2} mb={3}>
      <Box sx={{ 
        p: 1.5, 
        borderRadius: '50%', 
        backgroundColor: `${color}.light`,
        color: `${color}.contrastText`
      }}>
        {icon}
      </Box>
      <Typography variant="h5" sx={{ 
        fontWeight: 700,
        color: `${color}.main`
      }}>
        {title}
      </Typography>
    </Box>
    <Divider sx={{ mb: 3, borderColor: `${color}.light` }} />
    {children}
  </Paper>
)
```

**Form Design Requirements:**
- ✅ **Color-coded sections:** Each form section has thematic coloring
- ✅ **Icon integration:** Every section header includes relevant icon
- ✅ **Professional elevation:** Subtle shadows with hover enhancement
- ✅ **Typography hierarchy:** h5 headers with 700 font weight
- ✅ **Consistent spacing:** 3-unit padding and margins throughout

### 14.3 Enhanced Status Indicators
**Floating Badge Pattern:**
```tsx
// Status badge positioned absolutely above card
<Box sx={{ position: 'absolute', top: -8, right: 16, zIndex: 1 }}>
  <Chip
    icon={getStatusIcon(isActive)}
    label={isActive ? 'Activ' : 'Inactiv'}
    color={getStatusColor(isActive)}
    size="small"
    sx={{
      fontWeight: 600,
      boxShadow: theme.shadows[2] // Floating effect
    }}
  />
</Box>
```

**Status Requirements:**
- ✅ **Floating placement:** Above card with negative top margin
- ✅ **Visual hierarchy:** Icons + text + proper shadows
- ✅ **Color semantics:** Green for active, grey for inactive
- ✅ **Typography:** 600 font weight for status text

### 14.4 Enhanced Typography for Admin Readability
**Admin-Specific Typography:**
- **Section Headers:** h5 with 700 font weight and color theming
- **Field Labels:** 600 font weight for enhanced visibility
- **Body Text:** 500 font weight (enhanced from 400) for better readability
- **Card Titles:** h5-h6 with 700 font weight and proper line height
- **Status Text:** 600 font weight with semantic coloring

**Typography Compliance:**
```tsx
// Section headers
<Typography variant="h5" sx={{ 
  fontWeight: 700,
  color: 'primary.main',
  letterSpacing: '-0.02em'
}}>

// Field labels  
<Typography variant="subtitle1" sx={{ 
  fontWeight: 600,
  mb: 1,
  color: 'text.primary'
}}>

// Card titles
<Typography variant="h5" sx={{ 
  fontWeight: 700, 
  lineHeight: 1.2,
  letterSpacing: '-0.02em'
}}>
```

### 14.5 Scroll Management & Container Sizing
**Container Guidelines:**
- ❌ **Never use** `maxHeight` with `overflowY: 'auto'` in main content areas
- ✅ **Natural flow:** Let content determine container height naturally  
- ✅ **Page-level scroll:** Only allow vertical scroll at document level
- ✅ **Sticky elements:** Use `position: sticky` for sidebars and action panels

**Problematic Patterns to Avoid:**
```tsx
// ❌ NEVER DO THIS
<Box sx={{ maxHeight: '75vh', overflowY: 'auto' }}>

// ✅ DO THIS INSTEAD  
<Box sx={{ height: 'fit-content' }}>
```

### 14.6 Enhanced Action Button Patterns
**Primary Actions:**
- **Size:** `large` with 48px minimum height
- **Typography:** 600 font weight, no text transform
- **Spacing:** 2-unit spacing between button groups
- **Icons:** Always include relevant start icons

**Secondary Actions:**
- **Outlined style** with proper border radius
- **Icon buttons** in Paper containers for delete actions
- **Tooltips** mandatory for all admin action buttons

### 14.7 Breadcrumb Standards for Admin
**Requirements:**
- ✅ **Dynamic content:** Show actual entity names, not generic terms
- ✅ **Correct routing:** Ensure all links use proper admin routes  
- ✅ **Romanian text:** All admin breadcrumbs in Romanian
- ✅ **Proper hierarchy:** Admin / Section / Entity Name structure

**Breadcrumb Example:**
```tsx
// ✅ CORRECT
Admin / Showroom-uri / Pro-Mac București

// ❌ INCORRECT  
Admin / Showrooms / Editează
```

### 14.8 Enhanced Validation Requirements
**Admin interfaces must pass:**
- **Typography:** All headers use proper font weights (600-700)
- **Touch targets:** ≥44px on mobile, ≥32px on desktop
- **No horizontal scroll:** All breakpoints tested
- **Proper elevation:** Cards have shadows and borders
- **Status indicators:** Clear visual hierarchy with semantic colors
- **Responsive design:** Mobile-first with proper breakpoint behavior

### 14.9 Component Architecture Pattern
**Reusable Enhanced Components:**
- `EnhancedCard` - For entity display with status and actions
- `EnhancedForm` - Card-based form sections with color theming  
- `FormSection` - Standardized form section with icon + title
- `StatusBadge` - Floating status indicator with semantic coloring

**Integration Pattern:**
```tsx
// Main management page uses enhanced components
<EnhancedEntityCard entity={item} onEdit={handleEdit} onDelete={handleDelete} />
<EnhancedEntityForm formData={data} sections={sections} onSave={handleSave} />
```

This enhanced design system ensures consistent, professional admin interfaces that provide excellent UX while maintaining CLAUDE.md compliance throughout the application.

