# JODNA · Jabal Omar Digital Center

A premium, mobile-first frontend for **JODNA**, the smart destination operating system for Jabal Omar. Designed to feel like a digital concierge (not a generic mall directory): order food, shop, explore, navigate, and track orders inside the destination.

Built with **React + TypeScript + Tailwind CSS + Framer Motion + Lucide React**, fully runnable with mock data, optimized for a 390 px viewport, and ready for English / Arabic (RTL).

---

## Quick start

```bash
cd digital-center
npm install
npm run dev
```

Open http://localhost:5173 — the experience is locked to a 430 px column on larger screens (mobile-first).

```bash
npm run build      # type-check + production build
npm run preview    # preview the production build
```

Requires Node 18+.

---

## Design system

| Token | Value | Usage |
| --- | --- | --- |
| `midnight-700` | `#374C5F` | Brand base, headers, primary surfaces |
| `emerald2-500` | `#3DAF8D` | Primary accent, CTAs, success states |
| `cloud` | `#F5F5F5` | App background |
| `ink` | `#1E1E1E` | Primary text |

Reusable patterns: rounded cards (`rounded-2xl` / `rounded-3xl`), soft shadows (`shadow-soft` / `shadow-card` / `shadow-lift` / `shadow-glow`), gradient placeholders (`bg-midnight-gradient`, `bg-emerald-gradient`).

Typography: **Inter** for Latin, **Tajawal** for Arabic (loaded from Google Fonts, swapped automatically when `dir="rtl"`).

---

## Project structure

```
digital-center/
├── index.html
├── package.json
├── tailwind.config.js
├── postcss.config.js
├── vite.config.ts
├── tsconfig.json
├── tsconfig.node.json
└── src/
    ├── main.tsx
    ├── App.tsx                   # screen router + page transitions
    ├── index.css                 # Tailwind + base styles
    ├── types.ts                  # shared TS types
    ├── context/
    │   └── AppContext.tsx        # screen, language, cart, order state
    ├── data/
    │   └── mockData.ts           # restaurants, retail, offers, menus
    ├── components/
    │   ├── AppShell.tsx
    │   ├── BottomNav.tsx
    │   ├── Header.tsx
    │   ├── SearchBar.tsx
    │   ├── QuickActionCard.tsx
    │   ├── StoreCard.tsx
    │   ├── OfferCard.tsx
    │   ├── FilterChips.tsx
    │   ├── MenuItemCard.tsx
    │   ├── StickyCartBar.tsx
    │   ├── ProgressTracker.tsx
    │   └── MapPlaceholder.tsx
    └── screens/
        ├── SplashScreen.tsx
        ├── HomeScreen.tsx
        ├── FoodListingScreen.tsx
        ├── RestaurantDetailScreen.tsx
        ├── CartScreen.tsx
        ├── OrderTrackingScreen.tsx
        ├── RetailListingScreen.tsx
        ├── StoreDetailScreen.tsx
        ├── MapScreen.tsx
        └── ProfileScreen.tsx
```

---

## Screens (10)

1. **Splash** — gradient backdrop, centered logo placeholder, animated loading dots, language/QR detection note.
2. **Home** — greeting + nearest zone, search, quick actions (Order Food / Shop Now / Explore), Trending, Offers Today, Nearby (sorted by distance).
3. **Food Listing** — filter chips (Distance, Rating, Ready Time, Cuisine), restaurant cards with rating, distance and **Ready in N min** / **No queue** tags.
4. **Restaurant Detail** — hero, stats (rating, distance, prep time), category tabs, menu item cards (image, name, price in SAR, animated **Add** button), **sticky cart bar** with item count + total.
5. **Cart / Checkout** — items with quantity controls, fulfilment selector (**Pickup / Delivery / Table**), payment options (**Card / Apple Pay**), price summary (subtotal, fee, VAT 15%, total), **Place Order** CTA.
6. **Order Tracking** — live countdown timer, order ID, store name, 4-step progress (**Received → Preparing → Ready → Completed**), **Back to Home** CTA.
7. **Retail Listing** — filter chips for Fashion / Gifts / Perfumes / Services, store cards with **In store now** / **New collection** tags.
8. **Store Detail** — hero banner, store info, featured products carousel, CTAs **Visit Store / Request Item / Navigate**.
9. **Map** — full-screen indoor map placeholder with grid + faux building shapes, layer toggle (All / Food / Retail), interactive store pins, animated bottom sheet with **Navigate** CTA.
10. **Profile** — Jabal Omar Club summary, Language toggle (EN/AR), Orders, Favorites, Notifications, Settings, Help, Sign out.

Global **bottom tab bar**: Home · Explore · Orders · Map · Profile (animated active pill via Framer Motion `layoutId`).

---

## UX behavior

- Screens are switched via lightweight context state (`useApp().navigate(screen)`) — no router needed for the prototype.
- Page transitions: subtle fade + 8 px slide via `AnimatePresence`.
- Micro-interactions: button tap scale, card hover lift, animated cart `+`/`✓` swap, sticky cart bar slide-in.
- **RTL ready** — toggle from Profile · Language. The provider sets `<html dir>` and `lang`; layouts use logical `gap`/`px-5` so they mirror correctly. Tajawal loads automatically for Arabic.
- All copy is mirrored in EN / AR for the major surfaces; menu items remain English-only by design (extend in `mockData.ts` with localized fields when wiring real content).

---

## Mock data

All content is in `src/data/mockData.ts`:

- `restaurants` — 6 venues with rating, distance (m), ready minutes, queue status, gradient + emoji placeholder, zone.
- `retailStores` — 6 stores typed by category (Fashion / Gifts / Perfumes / Services).
- `offers` — 3 promo cards.
- `restaurantMenus` — keyed by restaurant id; each item has price (SAR), category, gradient + emoji.
- `featuredProducts` — used in store detail.
- `greetingByHour` / `greetingByHourAr` — time-aware home greeting.

No external images: every card uses gradient + emoji placeholders. Swap with real `<img>` tags when you have a CDN.

---

## Where to connect real APIs later

| Surface | File | Replace with |
| --- | --- | --- |
| Restaurants list | `src/data/mockData.ts → restaurants` | `GET /v1/destination/dining` (filter by zone, sort=distance) |
| Retail stores | `src/data/mockData.ts → retailStores` | `GET /v1/destination/retail` |
| Offers | `src/data/mockData.ts → offers` | `GET /v1/promotions/active` (geo + member tier) |
| Menus | `src/data/mockData.ts → restaurantMenus` | `GET /v1/dining/{id}/menu` |
| Cart / order placement | `src/context/AppContext.tsx → placeOrder` | `POST /v1/orders` (returns order id + ETA), then `GET /v1/orders/{id}` for tracking |
| Order tracking | `src/screens/OrderTrackingScreen.tsx` | Replace local timer with WebSocket / SSE on `/v1/orders/{id}/stream` (status + ETA updates) |
| Greeting + nearest zone | `src/screens/HomeScreen.tsx` | Use beacon / QR / GPS context: `GET /v1/visitor/context` |
| Map pins | `src/components/MapPlaceholder.tsx` | Plug an indoor-positioning SDK (e.g. MappedIn / Esri Indoors) and feed real `{x,y}` coords |
| Language detection | `src/context/AppContext.tsx` | Read from `navigator.language` on first load, persist in `localStorage` |
| Auth + member profile | `src/screens/ProfileScreen.tsx` | `GET /v1/me`, OAuth/SSO with the destination loyalty system |
| Payments | `src/screens/CartScreen.tsx` | Stripe / HyperPay / Apple Pay — replace the **Place Order** handler with a real PSP confirmation flow |

A pragmatic next step: introduce a `src/services/api.ts` layer with typed fetchers that mirror the mock shapes already defined in `src/types.ts` — that keeps screen components untouched.

---

## Notes

- The host repository is unrelated (`ColorFaker`, an Objective-C macOS utility). The frontend lives in `digital-center/` and is fully self-contained.
- All styling is Tailwind. No CSS-in-JS, no global stylesheets beyond `index.css` (tailwind + base body styles).
- No images are committed; gradients + emoji avoid CDN setup but render crisply on any device.
