# domofix - Service Provider Platform

![domofix Logo](https://via.placeholder.com/200x80/0ea5e9/ffffff?text=domofix)

domofix is a modern service provider platform that connects customers with service providers across various categories. Built with a scalable monorepo architecture using Next.js 14 and NestJS.

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.0.0
- npm >= 8.0.0
- MongoDB (for backend)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd domofix

# Install all dependencies
npm run install:all

# Set up environment variables
cp apps/backend/.env.example apps/backend/.env
# Edit the .env file with your configuration
```

### Development

```bash
# Start both frontend and backend in development mode
npm run dev

# Or start them separately
npm run dev:frontend  # Starts Next.js on http://localhost:3000
npm run dev:backend   # Starts NestJS on http://localhost:3001
```

## 📁 Project Structure

```
domofix/
├── apps/
│   ├── frontend/          # Next.js 14 application
│   └── backend/           # NestJS API server
├── packages/
│   ├── shared-types/      # Shared TypeScript types
│   ├── shared-utils/      # Shared utility functions
│   └── eslint-config/     # Shared ESLint configuration
├── docs/                  # Project documentation
└── package.json           # Workspace configuration
```

## 🏗️ Architecture

### Frontend (Next.js 14)
- **App Router**: Modern Next.js routing with app directory
- **Feature-based Architecture**: Organized by features (auth, profile, etc.)
- **Shared Components**: Reusable UI components and utilities
- **Tailwind CSS**: Utility-first CSS framework
- **Zustand**: State management
- **TypeScript**: Full type safety

### Backend (NestJS)
- **Modular Architecture**: Feature-based modules
- **JWT Authentication**: Secure authentication system
- **MongoDB**: Document database with Mongoose
- **Guards & Decorators**: Role-based access control
- **TypeScript**: Full type safety

## 🎯 Features

- **User Authentication**: Registration, login, JWT-based auth
- **Role Management**: Customer and Provider roles
- **Profile Management**: User profiles with customizable settings
- **Service Categories**: Multiple service categories support
- **Responsive Design**: Mobile-first responsive UI
- **Type Safety**: End-to-end TypeScript support

## 📚 Documentation

- [Project Structure](./STRUCTURE.md) - Detailed project organization
- [API Documentation](./API.md) - Backend API endpoints
- [Frontend Guide](./FRONTEND.md) - Frontend development guide
- [Deployment Guide](./DEPLOYMENT.md) - Production deployment
- [Development Workflow](./DEVELOPMENT.md) - Development guidelines
- [Testing Guide](./TESTING.md) - Testing strategies
- [Database Schema](./DATABASE.md) - Data models and schema

## 🛠️ Available Scripts

### Root Level
```bash
npm run dev              # Start frontend development server
npm run dev:frontend     # Start frontend only
npm run dev:backend      # Start backend only
npm run build            # Build all applications
npm run test             # Run all tests
npm run lint             # Lint all code
npm run type-check       # Type check all code
```

### Frontend Specific
```bash
cd apps/frontend
npm run dev              # Development server
npm run build            # Production build
npm run start            # Start production server
npm run test             # Run tests
npm run lint             # Lint code
```

### Backend Specific
```bash
cd apps/backend
npm run start:dev        # Development server
npm run build            # Production build
npm run start:prod       # Start production server
npm run test             # Run tests
npm run test:e2e         # End-to-end tests
```

## 🌍 Environment Variables

### Backend (.env)
```env
# Database
MONGODB_URI=mongodb://localhost:27017/domofix

# JWT
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=7d

# Server
PORT=3001
NODE_ENV=development
```

### Frontend (.env.local)
```env
# API
NEXT_PUBLIC_API_URL=http://localhost:3001

# Environment
NODE_ENV=development
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

See [DEVELOPMENT.md](./DEVELOPMENT.md) for detailed contribution guidelines.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation in the `/docs` folder
- Review the troubleshooting section in [DEPLOYMENT.md](./DEPLOYMENT.md)

## 🔄 Version History

- **v0.1.0** - Initial release with basic authentication and profile management