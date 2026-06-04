# Authentication System Implementation

## Overview
Sistem autentikasi telah diimplementasikan dengan menggunakan database real, bcrypt untuk password hashing, dan session management menggunakan HTTP-only cookies.

## Changes Made

### 1. API Routes (`app/api/auth/`)

#### Login API (`/api/auth/login`)
**File:** `app/api/auth/login/route.ts`

**Features:**
- ✅ Validasi email & password dari database
- ✅ Menggunakan bcrypt untuk compare password
- ✅ Set HTTP-only cookies untuk session management
- ✅ Return user info dan redirect path berdasarkan role
- ✅ Error handling yang proper

**Request Body:**
```json
{
  "email": "user@staff.uns.ac.id",
  "password": "password123"
}
```

**Response Success:**
```json
{
  "success": true,
  "user": {
    "id": "user-id",
    "name": "User Name",
    "email": "user@staff.uns.ac.id",
    "role": "DOSEN"
  },
  "redirectPath": "/dosen"
}
```

**Cookies Set:**
- `userId` (HTTP-only, 7 days)
- `role` (HTTP-only, 7 days)
- `name` (HTTP-only, 7 days)

#### Logout API (`/api/auth/logout`)
**File:** `app/api/auth/logout/route.ts`

**Features:**
- ✅ Clear all authentication cookies
- ✅ Simple POST request

### 2. Login Page Update

**File:** `app/(auth)/login/page.tsx`

**Changes:**
- ❌ Removed hardcoded authentication
- ✅ Now calls `/api/auth/login` API
- ✅ Proper error handling
- ✅ Demo accounts now set both email AND password
- ✅ Loading state during API call

**Demo Accounts:**
All accounts use password: `password123`

1. **Kaprodi:** kaprodi@staff.uns.ac.id
2. **Admin:** admin@staff.uns.ac.id  
3. **Dosen:** dosen@staff.uns.ac.id
4. **Mahasiswa:** mhs@student.uns.ac.id

### 3. Session Management

**File:** `lib/auth.ts`

**Current Implementation:**
```typescript
export async function getCurrentUser() {
  const cookieStore = await cookies();
  const roleCookie = cookieStore.get('role');
  const nameCookie = cookieStore.get('name');
  const userIdCookie = cookieStore.get('userId');

  if (!roleCookie?.value) {
    return null;
  }

  return {
    role: roleCookie.value,
    name: nameCookie?.value || 'User',
    userId: userIdCookie?.value || '',
  };
}
```

## Database Schema

### User Table
```prisma
model User {
  id        String   @id @default(cuid())
  name      String
  email     String   @unique
  password  String   // bcrypt hashed
  role      String   // KAPRODI, ADMIN, DOSEN, MAHASISWA
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  mahasiswa Mahasiswa?
  dosen     Dosen?
}
```

## Seeded Data

All passwords are hashed with bcrypt using salt rounds 10.
Default password for all demo accounts: `password123`

**Users Created:**
1. Kaprodi (kaprodi-001)
2. Admin (admin-001)
3. Dosen 1 (dosen-001)
4. Dosen 2 (dosen-002)
5. 26 Mahasiswa (mhs-001 to mhs-026)

## Security Features

### Password Security
- ✅ Passwords hashed with bcrypt (salt rounds: 10)
- ✅ Never stored in plain text
- ✅ Compared using bcrypt.compare()

### Cookie Security
- ✅ HTTP-only cookies (cannot be accessed via JavaScript)
- ✅ Secure flag in production
- ✅ SameSite: lax (CSRF protection)
- ✅ 7 days expiration
- ✅ Path: / (accessible across the app)

### API Security
- ✅ Proper error messages (generic for security)
- ✅ Try-catch blocks for error handling
- ✅ Database errors logged server-side only

## Next Steps for Production

### 1. Add CSRF Protection
```bash
npm install csrf
```

### 2. Add Rate Limiting
```bash
npm install express-rate-limit
```

### 3. Environment Variables
```env
# .env
SESSION_SECRET=your-secret-key-here
COOKIE_SECURE=true
NODE_ENV=production
```

### 4. Password Requirements
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- At least 1 special character

### 5. Add Email Verification
- Send verification email on registration
- Verify email before allowing login

### 6. Add Two-Factor Authentication (2FA)
- Optional 2FA for admin users
- SMS or authenticator app

### 7. Session Timeout
- Auto logout after 30 minutes of inactivity
- Refresh token mechanism

### 8. Audit Logging
- Log all login attempts
- Log all role changes
- Log all admin actions

## Testing

### Manual Testing Checklist

#### Login
- [ ] Login with valid credentials → Success
- [ ] Login with invalid email → Error message
- [ ] Login with invalid password → Error message
- [ ] Login redirects to correct dashboard based on role
- [ ] Cookies are set correctly
- [ ] Demo accounts work correctly

#### Session
- [ ] Protected routes check for valid session
- [ ] Invalid session redirects to login
- [ ] Session persists across page reloads
- [ ] Session expires after 7 days

#### Logout
- [ ] Logout clears all cookies
- [ ] After logout, cannot access protected routes
- [ ] Logout works from all roles

## API Documentation

### POST /api/auth/login

**Description:** Authenticate user and create session

**Request:**
```typescript
{
  email: string;    // Required, valid email format
  password: string; // Required
}
```

**Response 200 (Success):**
```typescript
{
  success: true;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  redirectPath: string;
}
```

**Response 401 (Unauthorized):**
```typescript
{
  error: "Email atau password salah"
}
```

**Response 500 (Server Error):**
```typescript
{
  error: "Terjadi kesalahan saat login"
}
```

### POST /api/auth/logout

**Description:** Clear user session

**Request:** None

**Response 200 (Success):**
```typescript
{
  success: true
}
```

**Response 500 (Server Error):**
```typescript
{
  error: "Terjadi kesalahan saat logout"
}
```

## Migration Guide

### From Old System (Hardcoded) to New System (Database)

**Old Flow:**
1. User enters email
2. Frontend checks email pattern
3. Frontend sets cookies directly
4. Frontend redirects

**New Flow:**
1. User enters email & password
2. Frontend sends to API `/api/auth/login`
3. API validates against database
4. API sets HTTP-only cookies
5. API returns redirect path
6. Frontend redirects

### Updating Dashboard Pages

Dashboard pages should fetch user data from database using `userId` from cookies:

```typescript
// Example: Fetch current user's data
const user = await getCurrentUser();
if (!user) {
  redirect('/login');
}

// Fetch user-specific data
const data = await prisma.user.findUnique({
  where: { id: user.userId },
  include: { ... }
});
```

## Important Notes

⚠️ **Development Only:**
- Current implementation is for development/demo purposes
- Password requirements are minimal
- Error messages could be more specific

⚠️ **Production Requirements:**
- Implement proper password policies
- Add rate limiting to prevent brute force
- Add CSRF protection
- Enable secure cookies in production
- Add audit logging
- Implement session refresh mechanism
- Add account lockout after failed attempts

✅ **Ready to Use:**
- Basic authentication works
- Password security with bcrypt
- HTTP-only cookies
- Role-based redirects
- Database integration
