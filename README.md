# 🛡️ TrustMarket

A fraud-prevention marketplace built with **Expo React Native** + **Supabase**.

## 💡 What It Solves

| Problem | Solution |
|---|---|
| Fake sellers create accounts easily | Sellers submit a verified ID card |
| Counterfeit products reach buyers | Every product is admin-reviewed |
| Buyers lose trust in online shopping | Verified badges on sellers & products |

---

## ⚙️ How It Works

```
Seller registers → Submits ID card → Admin approves seller
                                         ↓
                    Seller adds product → Admin approves product
                                                    ↓
                              Buyers see only verified products ✅
```

---

## 🏗️ Tech Stack

- **Expo SDK 55** with Expo Router (file-based navigation)
- **React Native** (TypeScript)
- **Supabase** – Auth, PostgreSQL database, Storage
- **Row-Level Security** on every table

---

## 🚀 Getting Started

### 1. Clone & install

```bash
git clone <repo-url>
cd App
npm install
```

### 2. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the contents of `supabase/schema.sql`
3. Go to **Storage** – the buckets `id-cards` and `product-images` are created by the schema
4. Copy your **Project URL** and **anon key** from `Settings > API`

### 3. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env`:
```
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Create an admin account

After a user registers, manually update their role in Supabase:

```sql
UPDATE profiles SET role = 'admin' WHERE email = 'admin@yourstore.com';
```

### 5. Run the app

```bash
# Android
npm run android

# iOS (macOS only)
npm run ios

# Web
npm run web
```

---

## 📁 Project Structure

```
app/
├── _layout.tsx           Root navigation + auth guard
├── (auth)/               Login & Register
├── (buyer)/              Browse, Search, Product Detail
├── (seller)/             Dashboard, Products, Add Product, Verification
└── (admin)/              Dashboard, Seller Reviews, Product Reviews
components/
├── ProductCard.tsx
├── StatusBadge.tsx
└── VerifiedBadge.tsx
contexts/
└── AuthContext.tsx        Session + profile state
lib/
├── supabase.ts            Supabase client
└── types.ts               Shared TypeScript types
supabase/
└── schema.sql             Complete DB schema + RLS policies
```

---

## 👤 User Roles

| Role | What they can do |
|---|---|
| **Buyer** | Browse & search verified products |
| **Seller** | Submit ID for verification, add products |
| **Admin** | Approve/reject sellers & products |

---

## 🗄️ Database Tables

| Table | Description |
|---|---|
| `profiles` | All users (buyer / seller / admin) |
| `seller_profiles` | ID card + approval status |
| `categories` | Product categories |
| `products` | Listings with approval status |

---

## 🔒 Security

- **Row Level Security** enabled on every table
- Sellers can only see/edit their own data
- Buyers only see `status = 'approved'` products
- ID card images are in a **private** storage bucket (admin access only)
- Product images are in a **public** bucket
