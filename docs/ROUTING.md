# Routing in Next.js App Router

## The `/app` directory IS where your pages go!

In Next.js 13+, the **App Router** replaces the old Pages Router. Here's how it works:

## Routing Structure

```
app/
├── page.tsx                    → / (Home page)
├── layout.tsx                  → Root layout (wraps all pages)
│
├── about/
│   └── page.tsx               → /about
│
├── (auth)/                    → Route group (doesn't affect URL)
│   ├── login/
│   │   └── page.tsx          → /login
│   └── layout.tsx             → Auth-specific layout
│
├── (customer)/
│   ├── bookings/
│   │   ├── page.tsx          → /bookings
│   │   └── [id]/
│   │       └── page.tsx      → /bookings/:id
│   └── layout.tsx             → Customer layout
│
├── (provider)/
│   ├── dashboard/
│   │   └── page.tsx          → /dashboard
│   └── layout.tsx             → Provider layout
│
└── api/
    └── services/
        ├── route.ts           → API endpoint (not a page)
        └── [id]/
            └── route.ts       → API endpoint with params
```

## Key Differences from Pages Router

### Pages Router (Old) ✗
```
pages/
  index.tsx       → page
  _app.tsx        → layout
  about.tsx       → page
```
- Pages are files
- Layout requires special `_app` file
- More complex routing patterns

### App Router (New) ✓
```
app/
  page.tsx         → page
  layout.tsx      → layout
  about/
    page.tsx      → page
```
- Folders create routes
- Each folder can have its own layout
- Cleaner, more intuitive

## Where Do Pages Live?

In the **App Router**, pages live in the `/app` directory:

### Example: Creating Routes

1. **Home Page**: `app/page.tsx`
   ```tsx
   export default function Home() {
     return <div>Home</div>
   }
   ```

2. **About Page**: `app/about/page.tsx`
   ```tsx
   export default function About() {
     return <div>About</div>
   }
   ```

3. **Dynamic Route**: `app/services/[id]/page.tsx`
   ```tsx
   export default function ServicePage({ params }: { params: { id: string } }) {
     return <div>Service {params.id}</div>
   }
   ```

4. **Nested Route**: `app/customer/bookings/page.tsx`
   ```tsx
   export default function Bookings() {
     return <div>Bookings</div>
   }
   ```

## File Conventions

| File Name | Purpose |
|-----------|---------|
| `page.tsx` | Creates a route/page |
| `layout.tsx` | Wraps pages (persists across navigations) |
| `loading.tsx` | Loading UI for the route |
| `error.tsx` | Error UI for the route |
| `not-found.tsx` | 404 page for the route |
| `route.ts` | API endpoint (not a page) |

## Route Groups

Parentheses create groups without affecting URLs:

```
app/
├── (customer)/
│   ├── book/
│   └── search/
└── (provider)/
    └── dashboard/
```

**URLs**: `/book`, `/search`, `/dashboard` (no "customer" or "provider" in URL)

Each group can have its own `layout.tsx` with different navigation, sidebars, etc.

## Why App Router?

✅ **Better Performance**: React Server Components by default  
✅ **Nested Layouts**: More flexible than pages router  
✅ **Loading States**: Built-in `loading.tsx` files  
✅ **Error Boundaries**: Built-in `error.tsx` files  
✅ **Server Actions**: Built-in backend logic  
✅ **Streaming**: Better loading UX  

## Creating Pages for Tawa

You'll create pages like this:

```
app/
├── page.tsx                      # Home page
├── search/page.tsx               # Search services
├── services/page.tsx             # All services
├── services/[id]/page.tsx        # Service details
├── bookings/page.tsx             # User bookings
├── providers/[id]/page.tsx       # Provider profile
└── (auth)/
    ├── login/page.tsx
    ├── register/page.tsx
    └── layout.tsx
```

## Summary

**No `/pages` directory needed!** Everything goes in `/app`. The folder structure creates the routes automatically. This is the modern Next.js way. 🚀

