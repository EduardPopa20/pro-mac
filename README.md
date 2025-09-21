# Pro-Mac Tiles E-commerce Platform

A modern, full-stack e-commerce platform for tiles and ceramics built with React, TypeScript, and Supabase.

## 🏢 About Pro-Mac

Pro-Mac is a comprehensive tiles and ceramics e-commerce platform featuring:
- **Product Catalog**: Dynamic product management with categories, specifications, and featured items
- **Showroom Management**: Location-based showroom listings with navigation integration  
- **Admin Dashboard**: Complete administrative interface for managing products, showrooms, and site settings
- **User Authentication**: Secure login/signup system with email verification
- **Responsive Design**: Mobile-first design optimized for all devices

## 🚀 Features

### **Product Management**
- ✅ Complete CRUD operations for products and categories
- ✅ Tile-specific specifications (dimensions, material, finish, color, usage area)
- ✅ Featured products highlighting system
- ✅ Category-based navigation and filtering
- ✅ Modern card-based product display
- ✅ Full-screen image viewing with modal details

### **Showroom System**
- ✅ Dynamic showroom listings with real-time data
- ✅ GPS navigation integration (Google Maps + Waze)
- ✅ Contact information and opening hours management
- ✅ Admin interface for complete showroom management

### **Admin Dashboard**
- ✅ Modern admin interface with sidebar navigation
- ✅ Real-time analytics and quick actions
- ✅ Inline editing system (List → Form → Preview)
- ✅ Confirmation dialogs for all critical operations
- ✅ Role-based access control (admin/customer)

### **User Experience**
- ✅ Responsive design across all breakpoints
- ✅ Professional loading states and error handling
- ✅ Romanian localization for all user-facing content
- ✅ WhatsApp integration for customer support
- ✅ SEO-friendly routing and meta tags

## 🛠️ Tech Stack

### **Frontend**
- **React 19.1.1** - Latest React with concurrent features
- **TypeScript 5.8.3** - Strict type checking enabled
- **Material-UI 7.3.1** - Modern component library
- **React Router 7.8.2** - Client-side routing
- **Zustand** - Lightweight state management
- **Vite** - Fast build tool and dev server

### **Backend & Database**
- **Supabase** - PostgreSQL database with real-time capabilities
- **Row Level Security** - Database-level security policies
- **Authentication** - Email/password with verification
- **Storage** - File storage for product images

### **Development**
- **ESLint & TypeScript** - Code quality and type safety
- **Git Hooks** - Pre-commit quality checks
- **Hot Reload** - Instant development feedback

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account

### 1. Clone Repository
```bash
git clone <repository-url>
cd tiles-ecommerce
npm install
```

### 2. Environment Setup
```bash
cp .env.example .env
```

Configure the following variables:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_RECAPTCHA_SITE_KEY=your_recaptcha_site_key (optional)
```

### 3. Database Setup
1. Create a new Supabase project
2. Run the SQL schema from `database/admin-schema.sql`
3. Configure authentication settings in Supabase dashboard
4. Set up storage buckets following `database/storage-setup.md`

### 4. Development Server
```bash
npm run dev
```

Visit `http://localhost:5173` to view the application.

## 🗄️ Database Schema

### Core Tables
- **profiles** - User accounts with role-based access
- **categories** - Product categorization system  
- **products** - Product catalog with tile specifications
- **inventory** - Stock management (future implementation)
- **showrooms** - Physical location management
- **site_settings** - Configurable site-wide settings

### Security
- Row Level Security (RLS) enabled on all tables
- Admin-only access for management operations
- Public read access for active products/showrooms

## 🧑‍💼 Admin Access

### Setting Up Admin User
1. Create regular account through signup
2. In Supabase, update user role in `profiles` table:
```sql
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'your-admin-email@example.com';
```

### Admin Features
- Access admin dashboard at `/admin`
- Manage products, categories, and showrooms
- Configure site settings (WhatsApp, company info)
- View analytics and quick actions
- Separate admin interface (no customer sidebar/features)

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Vercel (Recommended)
```bash
npm install -g vercel
vercel --prod
```

### Environment Variables in Production
Ensure all environment variables are configured in your deployment platform.

## 📁 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── admin/           # Admin-specific components
│   ├── auth/            # Authentication components
│   ├── common/          # Shared components
│   └── layout/          # Layout components
├── pages/               # Route components
│   └── admin/           # Admin pages
├── stores/              # Zustand state stores
├── types/               # TypeScript type definitions
├── lib/                 # Utilities and configurations
└── database/            # Database schema and docs
```

## 🔧 Development Guidelines

### Code Style
- TypeScript strict mode enabled
- ESLint + Prettier for formatting
- Material-UI components preferred
- Romanian localization for user content
- Mobile-first responsive design

### State Management
- Zustand for global state
- Separate stores for different domains (auth, products, settings)
- Local state for component-specific data

### Security
- Never commit sensitive data
- Use environment variables for API keys
- Follow Supabase RLS best practices
- Validate all user inputs

## 🐛 Known Issues & Roadmap

### Current Limitations
- Inventory management in development
- Payment integration pending
- Shopping cart basic implementation
- Limited analytics dashboard

### Roadmap
- [ ] Complete inventory management system
- [ ] Shopping cart & checkout flow
- [ ] Payment processing integration
- [ ] Advanced analytics dashboard
- [ ] Email notifications
- [ ] Order management system

## 📄 License

This project is proprietary software for Pro-Mac tiles and ceramics company.

## 🤝 Contributing

This is a private project. Contact the development team for contribution guidelines.

---

**Pro-Mac Tiles E-commerce Platform** - Built with ❤️ using modern web technologies