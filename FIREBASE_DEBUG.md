# Firebase Email/Password Auth 400 Error - Debugging Guide

## Issue
Firebase Identity Toolkit is returning `400 Bad Request` errors for both sign-in and sign-up requests:
- `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword → 400`
- `https://identitytoolkit.googleapis.com/v1/accounts:signUp → 400`

## Root Causes (Priority Order)

### 1. ❌ Missing/Invalid Firebase Configuration (MOST LIKELY)
**Symptom:** Environment variables not set

**Fix:**
1. Copy your Firebase project credentials from [Firebase Console](https://console.firebase.google.com/)
   - Project Settings → General tab
2. Update `frontend/.env.local`:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
   ```
3. Restart the frontend dev server: `npm run dev`

### 2. ❌ Email/Password Auth Not Enabled in Firebase
**Symptom:** Error code `auth/operation-not-allowed`

**Fix:**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Your project → Authentication → Sign-in method
3. Ensure "Email/Password" is **ENABLED** (green toggle)
4. Save changes

### 3. ❌ API Key Restrictions Block Identity Toolkit
**Symptom:** 400 error even with valid config

**Fix:**
1. Firebase Console → Your project → Settings → API keys
2. Click your API key
3. Under "API restrictions":
   - Select "Restrict key" (if set to "None")
   - Add "Identity Toolkit API" to the list
4. Save changes

### 4. ❌ Malformed Request Payload
**Symptom:** 400 error with valid Firebase config

**Check:**
- Email must be valid format (e.g., `test@example.com`)
- Password must be at least 6 characters
- No special characters causing JSON issues

## Debugging Steps

### Step 1: Check Console Errors
Open browser DevTools (F12) and check Console tab for:
- `Firebase Auth Error: { code, message, customData }`
- Any CORS errors
- Network errors to identitytoolkit.googleapis.com

### Step 2: Verify Firebase Initialization
In browser console, run:
```javascript
import { auth } from '@/lib/firebase'
console.log('Auth configured:', auth !== null)
console.log('Auth app:', auth?.app?.options)
```

### Step 3: Check Environment Variables
In browser console, run:
```javascript
console.log('NEXT_PUBLIC_FIREBASE_API_KEY:', process.env.NEXT_PUBLIC_FIREBASE_API_KEY)
console.log('NEXT_PUBLIC_FIREBASE_PROJECT_ID:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID)
```

### Step 4: Test Firebase Directly
In browser console:
```javascript
import { auth } from '@/lib/firebase'
import { signInWithEmailAndPassword } from 'firebase/auth'

// Try with test credentials
const result = await signInWithEmailAndPassword(
  auth, 
  'test@example.com', 
  'password123'
)
```

## Next Steps

1. **Update `.env.local`** with your Firebase credentials
2. **Enable Email/Password** in Firebase Console
3. **Verify API key restrictions** allow Identity Toolkit
4. **Restart dev server** and test signup/login again
5. **Check browser console** for detailed error messages

## For Production (Hugging Face Space)

Set these in your Space **Variables** (public, loaded at build time):
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

Then rebuild the Space.

## Error Message Improvements

Enhanced error logging is now in place:
- Signup: Shows `auth/operation-not-allowed` if auth method disabled
- Login: Shows `auth/operation-not-allowed` if auth method disabled
- Both: Show the full Firebase error message for debugging

Check console DevTools for the full error details.
