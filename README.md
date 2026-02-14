# IBNai DineOS - Multi-Tenant Restaurant Operating System

A complete, production-ready restaurant ordering platform with QR code ordering, real-time updates, and multi-tenant support.

## 🎯 Features

- **Multi-tenant Architecture**: Separate dashboards for each restaurant
- **QR Code Ordering**: Customers scan QR to view menu and place orders
- **Real-time Updates**: Live order notifications and menu availability
- **Admin Panel**: Manage registrations, verify restaurants, track analytics
- **Restaurant Dashboard**: Manage orders, menu, bills, and reports
- **Modern UI**: Clean, white background design (Airbnb/Stripe style)
- **Mobile Responsive**: Works perfectly on all devices

## 🛠 Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS (built, not CDN)
- **Backend**: Supabase (PostgreSQL + Auth + Real-time)
- **Routing**: React Router v6
- **Icons**: Lucide React
- **QR Generation**: qrcode.react
- **PDF Export**: jsPDF + html2canvas

## 📋 Prerequisites

- Node.js 18+ and npm
- Supabase account (free tier works)

## 🚀 Getting Started

### 1. Clone and Install

```bash
cd food-booking
npm install
```

### 2. Setup Supabase

1. Go to [Supabase](https://supabase.com) and create a new project.
2. Wait for the database to be provisioned.
3. This project uses Supabase CLI for migrations. Run the migrations located in `supabase/migrations` using the Supabase Dashboard SQL Editor or the CLI.
4. **IMPORTANT**: The system now uses **Supabase Native Auth**. There is no manual `users` table with password hashes.
5. All security is enforced via **Row Level Security (RLS)** and **Tenant Isolation triggers**.

4. Go to **Settings > API** and copy:

   - Project URL
   - anon/public key

5. Create `.env` file in project root:

```bash
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### 3. Run Development Server

```bash
npm run dev
```

Visit: http://localhost:5173

## 🔑 Default Login Credentials

### Admin Panel

- URL: http://localhost:5173/admin/login
- Email: admin@dineos.com
- Password: admin123

### Demo Restaurant

- URL: http://localhost:5173/login
- Email: demorestaurant@gmail.com
- Password: ATVSW679
- Customer Menu: http://localhost:5173/demo-restaurant

## 📱 Application Structure

```
/                       → Landing page
/register               → Restaurant registration
/login                  → Restaurant owner login
/dashboard              → Restaurant dashboard
  /dashboard/orders     → Orders management
  /dashboard/menu       → Menu management
  /dashboard/qr-code    → QR code download
  /dashboard/bills      → Bills & invoices
  /dashboard/reports    → Analytics
  /dashboard/settings   → Restaurant settings

/admin/login            → Admin login
/admin                  → Admin dashboard
  /admin/requests       → Pending registrations
  /admin/restaurants    → All restaurants
  /admin/analytics      → Platform analytics

/:restaurant-slug       → Customer ordering page
```

## 🎨 Design System

### Colors

- Background: `#FFFFFF`
- Subtle BG: `#FAFAFA`
- Text: `#0A0A0A`
- Text Secondary: `#6B6B6B`
- Accent: `#000000` / `#6366F1`
- Border: `#E5E5E5`
- Success: `#10B981`
- Error: `#EF4444`

### Typography

- Font: Inter (Google Fonts)
- Sizes: 12px, 14px, 15px, 18px, 24px, 32px
- Weights: 400, 500, 600, 700

## 🏗 Build for Production

```bash
npm run build
```

The `dist` folder will contain optimized production files.

## 🚢 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Netlify

1. Build command: `npm run build`
2. Publish directory: `dist`
3. Add environment variables


## 🤝 Contributing

This is a production-ready template. Feel free to customize based on your needs.

## 📄 License

MIT License - feel free to use this for commercial projects.

---
