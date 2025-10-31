# Tawa - Hyperlocal Services Platform

> Your city's digital layer - connecting users with trusted professionals and small businesses.

## About

Tawa is a hyperlocal services platform that connects users with trusted professionals and small businesses in their area — instantly. Whether you need a plumber, barber, cleaner, tutor, or delivery, Tawa brings your city's services together in one easy-to-use app.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod
- **Icons**: Lucide React

## Project Structure

```
tawa/
├── app/                    # Next.js app directory
│   ├── (auth)/            # Auth routes
│   ├── (customer)/        # Customer routes
│   ├── (provider)/        # Provider routes
│   ├── api/               # API routes
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── components/             # React components
│   ├── ui/                # Reusable UI components
│   ├── features/          # Feature-specific components
│   └── layout/            # Layout components
├── lib/                    # Utility functions
│   ├── api/               # API client
│   ├── utils.ts           # Helper functions
│   └── constants.ts       # App constants
├── hooks/                  # Custom React hooks
├── store/                  # Zustand state management
├── types/                  # TypeScript type definitions
└── public/                 # Static assets
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Visit [http://localhost:3000](http://localhost:3000) to see the app.

## Features

- 🔍 **Smart Search** - Find services near you
- 📍 **Location-Based** - Real-time location tracking
- ⭐ **Verified Reviews** - Trusted ratings and reviews
- 💰 **Transparent Pricing** - Clear pricing information
- 📅 **Easy Booking** - Book services with a few taps
- 👨‍💼 **Provider Dashboard** - Manage bookings and grow your business

## Key Directories

- **`/app`** - Next.js App Router pages and layouts
- **`/components`** - Reusable React components
- **`/lib`** - Utility functions and API clients
- **`/hooks`** - Custom React hooks
- **`/store`** - Zustand state management stores
- **`/types`** - TypeScript type definitions

## Development

### Type Checking

```bash
npm run type-check
```

### Linting

```bash
npm run lint
```

## License

MIT

