# Darigo API Documentation

## Overview

The Darigo backend API is built with NestJS and provides authentication, user management, and core platform functionality. The API follows RESTful conventions and uses JWT for authentication.

**Base URL:** `http://localhost:3001` (development)

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## API Endpoints

### Health Check

#### GET /
- **Description:** Health check endpoint
- **Authentication:** Not required
- **Response:**
  ```json
  "Hello World!"
  ```

---

## Authentication Endpoints

### Register User

#### POST /auth/register
- **Description:** Register a new user account
- **Authentication:** Not required
- **Request Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe",
    "avatar": "https://example.com/avatar.jpg", // optional
    "phoneNumber": "+1234567890", // optional
    "countryCode": "+1", // optional
    "timezone": "UTC", // optional
    "locale": "en", // optional
    "role": "customer", // optional: "customer" | "provider"
    "address": { // optional
      "street": "123 Main St",
      "city": "New York",
      "state": "NY",
      "postalCode": "10001",
      "country": "USA",
      "latitude": 40.7128,
      "longitude": -74.0060,
      "fullAddress": "123 Main St, New York, NY 10001, USA"
    }
  }
  ```

- **Success Response (201):**
  ```json
  {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "avatar": "https://example.com/avatar.jpg",
      "phoneNumber": "+1234567890",
      "countryCode": "+1",
      "phoneVerification": {
        "verified": false,
        "attempts": 0
      },
      "address": {
        "street": "123 Main St",
        "city": "New York",
        "state": "NY",
        "postalCode": "10001",
        "country": "USA",
        "latitude": 40.7128,
        "longitude": -74.0060,
        "fullAddress": "123 Main St, New York, NY 10001, USA"
      },
      "notificationPreferences": {
        "email": true,
        "sms": false,
        "push": true,
        "marketing": true,
        "security": true
      },
      "security": {
        "twoFactorEnabled": false,
        "failedLoginAttempts": 0,
        "emailVerified": false
      },
      "status": "active",
      "role": "customer",
      "profileCompleted": false,
      "onboardingCompleted": false,
      "timezone": "UTC",
      "locale": "en",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
  ```

- **Error Responses:**
  - **409 Conflict:** User with email already exists
  - **400 Bad Request:** Invalid input data

### Login User

#### POST /auth/login
- **Description:** Authenticate user and get access token
- **Authentication:** Not required
- **Request Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```

- **Success Response (200):**
  ```json
  {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      // ... full user object (same as register response)
    }
  }
  ```

- **Error Responses:**
  - **401 Unauthorized:** Invalid credentials

### Get User Profile

#### GET /auth/profile
- **Description:** Get current authenticated user's profile
- **Authentication:** Required (JWT)
- **Success Response (200):**
  ```json
  {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    // ... full user object
  }
  ```

- **Error Responses:**
  - **401 Unauthorized:** Invalid or missing token

### Forgot Password

#### POST /auth/forgot-password
- **Description:** Initiate password reset by sending an email with a reset link.
- **Authentication:** Not required
- **Request Body:**
  ```json
  {
    "email": "user@example.com"
  }
  ```
- **Success Response (200):**
  ```json
  { "message": "If an account exists, an email has been sent." }
  ```
- **Error Responses:**
  - **400 Bad Request:** Invalid email format

### Reset Password

#### POST /auth/reset-password
- **Description:** Reset password using token from email.
- **Authentication:** Not required
- **Request Body:**
  ```json
  {
    "token": "<reset-token>",
    "newPassword": "NewPass123"
  }
  ```
- **Success Response (200):**
  ```json
  { "message": "Password reset successful." }
  ```
- **Error Responses:**
  - **400 Bad Request:** New password does not meet policy requirements
  - **404 Not Found:** Invalid or expired token

---

## Data Models

### User Model

```typescript
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  phoneNumber?: string;
  countryCode?: string;
  phoneVerification: PhoneVerification;
  address?: Address;
  notificationPreferences: NotificationPreferences;
  security: SecuritySettings;
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  role: 'customer' | 'provider' | 'admin';
  profileCompleted: boolean;
  onboardingCompleted: boolean;
  timezone: string;
  locale: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Address Model

```typescript
interface Address {
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  fullAddress?: string;
}
```

### Phone Verification Model

```typescript
interface PhoneVerification {
  verificationCode?: string;
  verificationExpires?: Date;
  verified: boolean;
  attempts: number;
}
```

### Notification Preferences Model

```typescript
interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  push: boolean;
  marketing: boolean;
  security: boolean;
}
```

### Security Settings Model

```typescript
interface SecuritySettings {
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;
  failedLoginAttempts: number;
  lockedUntil?: Date;
  lastLoginAt?: Date;
  lastLoginIP?: string;
  trustedDevices: string[];
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  emailVerificationToken?: string;
  emailVerified: boolean;
}
```

---

## Error Handling

The API uses standard HTTP status codes and returns error responses in the following format:

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

### Common Status Codes

- **200 OK:** Request successful
- **201 Created:** Resource created successfully
- **400 Bad Request:** Invalid request data
- **401 Unauthorized:** Authentication required or invalid
- **403 Forbidden:** Access denied
- **404 Not Found:** Resource not found
- **409 Conflict:** Resource already exists
- **500 Internal Server Error:** Server error

---

## Rate Limiting

Currently, no rate limiting is implemented. Consider implementing rate limiting for production use.

---

## CORS Configuration

The API is configured to accept requests from:
- `http://localhost:3000` (Frontend development)
- `http://localhost:3002` (Alternative frontend port)

Credentials are enabled for cross-origin requests.

---

## Validation

The API uses class-validator for request validation with the following global settings:
- `whitelist: true` - Strips properties not defined in DTOs
- `forbidNonWhitelisted: true` - Throws error for unknown properties
- `transform: true` - Automatically transforms payloads to DTO instances

---

## Database

The API uses MongoDB with Mongoose ODM. Key indexes are created for:
- `email` (unique)
- `phoneNumber`
- `security.emailVerificationToken`
- `security.passwordResetToken`
- `status`
- `role`

---

## Environment Variables

Required environment variables:
- `MONGODB_URI` - MongoDB connection string
- `MONGODB_DB_NAME` - Database name
- `JWT_SECRET` - JWT signing secret
- `PORT` - Server port (defaults to 3001)

---

## Future Endpoints

The following endpoints are planned for future implementation:

### User Management
- `PUT /auth/profile` - Update user profile
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset password with token
- `POST /auth/verify-email` - Verify email address
- `POST /auth/resend-verification` - Resend verification email

### Phone Verification
- `POST /auth/send-phone-verification` - Send phone verification code
- `POST /auth/verify-phone` - Verify phone number

### Two-Factor Authentication
- `POST /auth/enable-2fa` - Enable 2FA
- `POST /auth/disable-2fa` - Disable 2FA
- `POST /auth/verify-2fa` - Verify 2FA code

### Provider Features
- `GET /providers` - List service providers
- `GET /providers/:id` - Get provider details
- `POST /providers` - Create provider profile

### Search & Booking
- `GET /search` - Search for services
- `POST /bookings` - Create booking
- `GET /bookings` - List user bookings
- `GET /bookings/:id` - Get booking details

---

## Testing

Use tools like Postman, Insomnia, or curl to test the API endpoints. Example curl commands:

### Register a new user:
```bash
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User"
  }'
```

### Login:
```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Get profile (with token):
```bash
curl -X GET http://localhost:3001/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Change password (with token):
```bash
curl -X PATCH http://localhost:3001/auth/change-password \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "OldPassword123",
    "newPassword": "NewStrongPassword123"
  }'
```