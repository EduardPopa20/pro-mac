# Newsletter Feature Setup Guide

## Database Setup

### 1. Execute Newsletter Schema
Run the following SQL file in your Supabase SQL Editor:
```bash
database/newsletter-schema.sql
```

This will create:
- `newsletter_subscriptions` table with proper RLS policies
- Helper function `is_email_subscribed()` for duplicate checking
- Indexes for optimal performance

### 2. Verify Database Setup
After running the schema, verify the setup:

```sql
-- Check table creation
SELECT * FROM information_schema.tables WHERE table_name = 'newsletter_subscriptions';

-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies WHERE tablename = 'newsletter_subscriptions';

-- Test the helper function
SELECT is_email_subscribed('test@example.com');
```

## Feature Overview

### 🎯 Newsletter Modal System
- **Responsive Design**: Mobile-first approach with breakpoint-specific styling
- **Smart Display Logic**: Shows 3-4 seconds after first website visit
- **Visit Tracking**: Uses localStorage to track first visits and subscription status
- **Duplicate Prevention**: Validates if email already exists before allowing subscription

### 🔧 Technical Implementation

#### Components
- **NewsletterModal** (`src/components/common/NewsletterModal.tsx`)
  - Fully responsive modal with Material-UI design
  - Form validation with Romanian error messages
  - Success/error states with loading indicators
  - Auto-close functionality after successful subscription

#### Hooks
- **useNewsletterModal** (`src/hooks/useNewsletterModal.ts`)
  - First-visit detection with localStorage
  - Modal display timing (3.5 second delay)
  - Subscription status tracking
  - Dismiss count management (max 3 dismissals)

#### Stores
- **useNewsletterStore** (`src/stores/newsletter.ts`)
  - Email subscription with duplicate checking
  - Unsubscribe functionality
  - Admin management functions (CRUD operations)
  - Integration with Supabase database

#### Types
- **NewsletterSubscription** interface added to `src/types/index.ts`

### 🛡️ Security Features
- Row Level Security (RLS) policies for data protection
- Anonymous user support with proper access control
- Admin-only access for subscription management
- Email normalization (lowercase, trimmed)
- IP tracking for basic analytics

### 📱 User Experience
- **First Visit**: Modal appears after 3-4 seconds
- **Returning Users**: Modal reappears after 24 hours if not subscribed
- **Dismissal Logic**: Maximum 3 dismissals before permanently hiding
- **Subscription Success**: Auto-close with success message after 3 seconds
- **Email Validation**: Real-time validation with Romanian error messages

### 🎨 Responsive Design
The modal is fully responsive across all breakpoints:
- **Mobile** (< 600px): Compact design with smaller text and buttons
- **Tablet** (600-960px): Medium-sized modal with adjusted spacing
- **Desktop** (> 960px): Full-sized modal with optimal spacing

### 🚀 Integration
The newsletter modal is integrated globally in the main application (`src/App.tsx`) and appears on all public pages for non-admin users.

## Testing the Feature

### 1. First Visit Test
1. Open browser in incognito/private mode
2. Navigate to `http://localhost:5174`
3. Wait 3-4 seconds - modal should appear
4. Test form validation with invalid emails
5. Test successful subscription

### 2. LocalStorage Testing
```javascript
// In browser console - reset modal status for testing
localStorage.removeItem('promac_newsletter_status')
localStorage.removeItem('promac_first_visit')
```

### 3. Database Verification
Check subscription was created:
```sql
SELECT * FROM newsletter_subscriptions ORDER BY subscribed_at DESC LIMIT 5;
```

## Future Enhancements

### Admin Dashboard Integration
- View all newsletter subscriptions
- Send bulk emails to subscribers
- Export subscriber lists
- Analytics and reporting

### Advanced Features
- Email templates for newsletters
- Unsubscribe links in emails  
- Segmentation by user preferences
- A/B testing for modal designs

## Maintenance

### Regular Tasks
- Monitor subscription rates
- Clean up bounced email addresses
- Review dismiss patterns
- Update modal content seasonally

### Database Maintenance
```sql
-- Clean up old unsubscribed records (optional, for GDPR compliance)
DELETE FROM newsletter_subscriptions 
WHERE status = 'unsubscribed' 
AND unsubscribed_at < NOW() - INTERVAL '2 years';
```

## Troubleshooting

### Modal Not Appearing
1. Check browser console for errors
2. Verify localStorage is enabled
3. Clear localStorage and test in incognito mode
4. Check if user is admin (admins don't see the modal)

### Subscription Errors
1. Verify database schema is applied
2. Check RLS policies are enabled
3. Test with Supabase logs
4. Verify network connectivity

### Responsive Issues
1. Test on actual devices, not just browser dev tools
2. Check Material-UI breakpoints match design requirements
3. Verify CSS clamp() functions are working properly