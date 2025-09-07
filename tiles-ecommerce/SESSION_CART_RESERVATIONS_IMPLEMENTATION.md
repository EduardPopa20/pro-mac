# Session-Based Cart Reservations Implementation

## Problem Solved
The "rezervat" (reserved) column in the admin inventory dashboard (`/admin/inventar`) was not updating when products were added to cart from incognito sessions because the original cart system was purely local and didn't create database reservations.

## Solution Overview
Completely rewrote the cart system to integrate with the stock reservation database system, supporting both authenticated and non-authenticated users.

## What Has Been Implemented

### 1. New Database Function (`database/session-based-reservations.sql`)
Created `reserve_stock_session()` function that handles both authenticated users and anonymous sessions:
- Accepts either `user_id` or `cart_session_id` 
- Automatically checks stock availability
- Creates reservation with 30-minute expiry
- Updates inventory `quantity_reserved` atomically

### 2. Updated Cart Store (`src/stores/cart.ts`)
**Major changes:**
- All cart operations now async (`addItem`, `removeItem`, `updateQuantity`, `clearCart`)
- Session-based reservation system for non-authenticated users
- Uses localStorage `cart-session-id` for tracking anonymous sessions  
- Integrated with Supabase `stock_reservations` table
- Real-time reservation syncing

**Key functions updated:**
```typescript
addItem: async (product: Product, quantity = 1) => Promise<void>
removeItem: async (productId: number) => Promise<void>  
updateQuantity: async (productId: number, quantity: number) => Promise<void>
syncReservations: async () => Promise<void> // Now handles both user types
```

### 3. Updated Components
**Components updated to handle async cart operations:**
- `src/components/common/CartPopper.tsx`
- `src/pages/Cart.tsx` 
- `src/pages/ProductDetail.tsx`
- `src/App.tsx` (added cart initialization)

### 4. Real-time Admin Dashboard
The inventory dashboard already has real-time subscriptions to both `inventory` and `stock_reservations` tables, so it will automatically update when reservations are created.

## Required Manual Step

**⚠️ IMPORTANT:** You need to run the SQL function in Supabase:

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run the content of `database/session-based-reservations.sql`
4. This creates the `reserve_stock_session()` function

## How It Works

### For Non-Authenticated Users (Incognito):
1. User adds product to cart
2. System generates unique session ID: `cart_${timestamp}_${random}`
3. Stored in `localStorage` as `cart-session-id`
4. Calls `reserve_stock_session()` with `cart_session_id`
5. Creates reservation in `stock_reservations` table
6. Updates `inventory.quantity_reserved`
7. Admin dashboard shows updated "Rezervat" value in real-time

### For Authenticated Users:
1. Same process but uses `user_id` instead of session ID
2. Calls existing `reserve_stock()` function for authenticated flow

## Testing Steps

1. **Execute the SQL function** (required first step)
2. Open incognito browser tab
3. Navigate to your site (http://localhost:5177)
4. Add "Gresie Marmură Carrara" (or any product) to cart
5. In another tab (logged in as admin), go to `/admin/inventar`
6. Check the "Rezervat" column for the product - should show 1

## Files Changed

### Core Implementation:
- `src/stores/cart.ts` - Complete rewrite for reservation integration
- `database/session-based-reservations.sql` - New SQL function

### Component Updates:
- `src/components/common/CartPopper.tsx`
- `src/pages/Cart.tsx`
- `src/pages/ProductDetail.tsx` 
- `src/App.tsx`

### Testing:
- `tests/session-cart-reservation-test.spec.ts` - Automated test

## Database Schema Impact

The `stock_reservations` table now stores:
- `user_id` (for authenticated users) OR
- `cart_session_id` (for anonymous sessions)
- Both with 30-minute expiry via `expires_at`

## Next Steps After SQL Execution

1. Test the incognito flow as described above
2. Verify admin dashboard updates in real-time
3. Check Supabase `stock_reservations` table to see new entries
4. Run the test: `npx playwright test session-cart-reservation-test.spec.ts`

The solution maintains backward compatibility while adding full reservation support for all user types.