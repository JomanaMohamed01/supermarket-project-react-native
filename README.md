# FreshLane Market (React Native)

React Native / Expo remake of the FreshLane supermarket web app.

## Features

- Auth (login / signup with validation + password strength)
- Category aisles & product browsing
- Cart, checkout, and order success
- Account profile (avatar, address, delete account)
- FreshLane branding (leaf/cream palette, Fraunces + Nunito Sans)
- Local demo mode until Supabase is connected

## Run

```bash
npm install
npx expo start
```

Then open in Expo Go (Android/iOS) or a simulator.

## Connect Supabase (next step)

1. Copy `.env.example` → `.env`
2. Add your project values:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

3. Restart Expo (`npx expo start -c`)

The client lives in `src/lib/supabase.ts`. Data/auth flows in `src/providers/AppProvider.tsx` already call Supabase when those env vars are set; otherwise they use local mock data so you can develop offline.

Expected tables (same as the web app): `categories`, `products`, `cart_items`, `orders`, `order_items`, `profiles`, plus an `avatars` storage bucket.
