# Real-Time Updates System - Setup Guide

## Overview
Implementarea sistemului de actualizări în timp real folosind Supabase Real-time subscriptions pentru sincronizarea automată dintre panoul de admin și site-ul public.

## Architecture
```
Admin Dashboard (Modificare) 
    ↓ 
Store Action (emitEvent) 
    ↓ 
Supabase real_time_events table 
    ↓ 
Supabase Real-time (postgres_changes) 
    ↓ 
Client Subscription (useRealTimeSync) 
    ↓ 
Store Refresh (fetchData)
    ↓
Public Site (Actualizare automată)
```

## 1. Database Setup

### Pasul 1: Rulează schema SQL
```sql
-- Execute în Supabase SQL Editor
\i database/real-time-events-schema.sql
```

### Pasul 2: Enable real-time pentru tabela events
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE real_time_events;
```

### Pasul 3: Verifică că RLS policies sunt active
- Oricine poate citi events (pentru sync public)
- Doar adminii pot crea events

## 2. System Components

### Core Files Created:
- `src/lib/realTimeEvents.ts` - Event manager system
- `src/hooks/useRealTimeSync.ts` - React hooks pentru sincronizare
- `src/components/common/RealTimeStatus.tsx` - Status indicator (optional)
- `database/real-time-events-schema.sql` - Database schema

### Modified Files:
- `src/stores/settings.ts` - Added event emission pentru showrooms & settings
- `src/stores/products.ts` - Added event emission pentru products & categories
- `src/App.tsx` - Initialized global real-time sync

## 3. How It Works

### Admin Side (Event Emission):
1. Admin efectuează CRUD operation (create/update/delete)
2. Store function execută operația în Supabase
3. După success, se apelează `realTimeEvents.emitEvent()`
4. Event-ul se salvează în tabela `real_time_events`

### Client Side (Event Reception):
1. `useRealTimeSync` hook se subscribe la `real_time_events` table
2. Supabase real-time detectează INSERT în tabelă
3. Hook-ul primește evenimentul și apelează store refresh functions
4. UI-ul se actualizează automat cu datele noi

## 4. Supported Entities
- `showrooms` - Showroom management
- `site_settings` - Site configuration
- `products` - Product catalog
- `categories` - Product categories

## 5. Event Types
- `create` - New entity created
- `update` - Entity modified
- `delete` - Entity removed

## 6. Usage Examples

### În admin pages:
```tsx
// Events se emit automat când folosești store functions
const { updateShowroom, createShowroom, deleteShowroom } = useSettingsStore()
await updateShowroom(id, data) // Emite automat 'showrooms update' event
```

### În public pages:
```tsx
// Sync-ul se face automat prin useRealTimeSync în App.tsx
// Public pages vor primi actualizări automate
```

### Manual entity-specific sync:
```tsx
import { useEntitySync } from '../hooks/useRealTimeSync'

// Subscribe doar la anumite entități
useEntitySync(['products', 'categories'])
```

## 7. Debugging

### Enable Real-Time Status Indicator:
```tsx
import RealTimeStatus from './components/common/RealTimeStatus'

// În oricare componentă
<RealTimeStatus showStatus={true} position="top-right" />
```

### Console Logging:
- Events emise: `Event emitted: showrooms update`
- Events primite: `Received real-time event: ...`
- Sync initialized: `Real-time sync initialized`

## 8. Performance Considerations

### Automatic Cleanup:
- Events older than 24 hours se șterg automat
- Indexuri pentru performanță optimă

### Connection Management:
- Automatic reconnect la întreruperi de conexiune
- Single subscription per client (nu multiple connections)

### Optimizations:
- Events se emit doar pentru successful operations
- Store refreshes sunt debounce-d natural prin React hooks

## 9. Testing

### Test Scenario:
1. Deschide 2 browser tabs: admin panel + public site
2. În admin panel: modifică un showroom/product
3. Verifică că public site se actualizează imediat
4. Check browser console pentru event logs

### Expected Flow:
```
[Admin Tab] User modifies showroom
[Admin Tab] Console: "Event emitted: showrooms update"
[Public Tab] Console: "Received real-time event: showrooms update"
[Public Tab] Showroom carousel updates automatically
```

## 10. Deployment Notes

### Development:
- Funcționează direct cu Supabase local/remote

### Production:
- Real-time subscriptions supported by Supabase
- No additional server configuration needed
- Scales automatically with Supabase limits

### Environment Variables:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

## 11. Troubleshooting

### Common Issues:

**Events nu se emit:**
- Verifică că user-ul este admin (role = 'admin')
- Check RLS policies în Supabase
- Verify that real_time_events table exists

**Events nu se primesc:**
- Check că `ALTER PUBLICATION supabase_realtime ADD TABLE real_time_events;` a fost executat
- Verifică console pentru connection errors
- Test connection cu RealTimeStatus component

**Sync nu funcționează:**
- Verifică că useRealTimeSync este apelat în App.tsx
- Check că store functions (fetchProducts, fetchShowrooms) sunt disponibile
- Verify browser network tab pentru WebSocket connections

## 12. Future Enhancements

### Possible Additions:
- Event batching pentru multiple updates
- User-specific events (notifications)
- Real-time analytics updates
- Advanced filtering pentru events
- Offline support cu event replay

---

*Implementat: 2025-08-29*  
*Status: Production Ready*