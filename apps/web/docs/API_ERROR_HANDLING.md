# API Error Handling Guide

## Overview

This guide explains how to handle the "Invalid or expired token" error and other API errors in the projectname application.

## Common Error: "Invalid or expired token"

### What causes this error?

- User session has expired
- Access token is invalid or corrupted
- Server-side token validation has failed
- Network issues during token refresh

### How it's handled automatically:

1. **Automatic Token Refresh**: The HTTP service automatically attempts to refresh tokens
2. **Graceful Logout**: If refresh fails, user is logged out automatically
3. **User-Friendly Messages**: Technical errors are converted to user-friendly messages
4. **Redirect to Login**: User is redirected to login page after logout

## Improved Error Handling

### 1. Enhanced HTTP Service

The HTTP service now includes:

- Better error normalization
- Prevents multiple concurrent logout attempts
- Suppresses duplicate error toasts for auth failures
- Graceful token refresh handling

### 2. Custom Error Handler Hook

Use the `useApiErrorHandler` hook in components:

```typescript
import { useApiErrorHandler } from '@/hooks/useApiErrorHandler'

function MyComponent() {
   const { handleError } = useApiErrorHandler()

   const fetchData = async () => {
      try {
         const data = await api.getData()
         // Handle success
      } catch (error) {
         handleError(error) // Automatically handles all error types
      }
   }
}
```

### 3. Async Operation Hook

For complex operations with loading states:

```typescript
import { useAsyncOperation } from '@/hooks/useApiErrorHandler'

function MyComponent() {
   const { executeAsync } = useAsyncOperation()

   const saveData = () => {
      executeAsync(() => api.saveData(formData), {
         loadingMessage: 'Saving...',
         successMessage: 'Data saved successfully!',
         onSuccess: (result) => {
            // Handle success
         },
      })
   }
}
```

### 4. Retry Hook

For operations that should be retried:

```typescript
import { useRetry } from '@/hooks/useApiErrorHandler'

function MyComponent() {
   const { retry } = useRetry()

   const fetchDataWithRetry = () => {
      retry(
         () => api.fetchData(),
         3, // max attempts
         1000 // delay between attempts
      )
   }
}
```

## Error Types Handled

| Error Type     | Status Code | User Message                         | Action                 |
| -------------- | ----------- | ------------------------------------ | ---------------------- |
| Authentication | 401         | Session expired, please log in again | Auto logout + redirect |
| Forbidden      | 403         | No permission for this action        | Show error             |
| Not Found      | 404         | Resource not found                   | Show error             |
| Server Error   | 500+        | Server error, try again later        | Show error             |
| Network Error  | -           | Check internet connection            | Show error             |
| Timeout        | -           | Request timed out                    | Show error             |

## Best Practices

### 1. Component Level

```typescript
// ✅ Good: Use error handler hook
const { handleError } = useApiErrorHandler()

// ❌ Avoid: Direct error handling
catch (error) {
   toast.error(error.message) // May show technical messages
}
```

### 2. API Service Level

```typescript
// ✅ Good: Let HTTP service handle errors
try {
   return await httpService.get('/api/data')
} catch (error) {
   throw error // Re-throw to let component handle
}

// ❌ Avoid: Swallowing errors
catch (error) {
   console.error(error)
   return null // Component won't know about error
}
```

### 3. Loading States

```typescript
// ✅ Good: Use async operation hook
const { executeAsync } = useAsyncOperation()

// ❌ Avoid: Manual loading state management
const [loading, setLoading] = useState(false)
const [error, setError] = useState(null)
```

## Debugging Token Issues

### 1. Check Browser Console

Look for these log messages:

- "Token refresh already in progress"
- "No refresh token available"
- "Authentication failure detected"
- "Logout already in progress"

### 2. Check Network Tab

- Failed requests to `/api/v1/auth/get-access-token`
- 401 responses from API calls
- Missing or malformed Authorization headers

### 3. Check Application Storage

- Cookies: `accessToken`, `refreshToken`, `user`
- LocalStorage: May contain cached auth data

## Recovery Actions

### For Users:

1. Refresh the page
2. Clear browser cache/cookies
3. Log out and log back in

### For Developers:

1. Check server-side token validation
2. Verify token refresh endpoint
3. Check token expiration times
4. Validate cookie/storage management

## Configuration

### Environment Variables

```env
# API Base URL
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000

# Token expiration (handled by backend)
# Refresh token expiration (handled by backend)
```

### HTTP Service Configuration

The HTTP service is configured with:

- Automatic token refresh
- Request/response interceptors
- Error normalization
- Graceful logout handling

This documentation should help you understand and resolve token-related errors in the application.
