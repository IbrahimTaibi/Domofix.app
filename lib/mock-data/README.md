# Mock User Data

This directory contains mock user data for testing authentication functionality.

## Available Test Users

### Customer Users
- **Marie Dubois** - `marie@example.com` / `password123`
- **Pierre Martin** - `pierre@example.com` / `password123`
- **Sophie Laurent** - `sophie@example.com` / `password123`

### Provider Users
- **Jean Plombier** - `jean.plombier@example.com` / `password123`
- **Amélie Coiffure** - `amelie.coiffure@example.com` / `password123`
- **Marc Électricien** - `marc.electricien@example.com` / `password123`

### Admin User
- **Admin Tawa** - `admin@tawa.com` / `admin123`

## Usage

1. Navigate to `/login` page
2. Use any of the email/password combinations above
3. Each user type redirects to different pages after login:
   - **Customer**: `/get-started/customer`
   - **Provider**: `/get-started/provider`
   - **Admin**: `/admin`

## API Endpoints

- `POST /api/auth/login` - Authenticate user
- `POST /api/auth/register` - Register new user
- `GET /api/auth/me` - Get current user profile

## Files

- `users.ts` - Mock user data and helper functions
- `README.md` - This documentation file