# Firebase reCAPTCHA 400 Error - Root Cause & Fix

## Problem
You're seeing `400 Bad Request` errors in browser console:
```
POST https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=... 400 (Bad Request)
POST https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=... 400 (Bad Request)
```

Stack trace shows: `handleRecaptchaFlow @ recaptcha_enterprise_verifier.ts:262`

## Root Cause: reCAPTCHA Enterprise Verification

Firebase SDK automatically tries to verify requests using **reCAPTCHA Enterprise**. Your Firebase project has this enabled but **not properly configured**, so:
1. Firebase sends the auth request ✅
2. Firebase tries to verify with reCAPTCHA → Gets 400 ❌
3. Firebase continues with auth anyway ✅

**Result:** Your authentication WORKS (accounts ARE being created) but you see 400 errors in console.

## ✅ Quick Fix - Disable reCAPTCHA for Development

1. Open [Firebase Console](https://console.firebase.google.com/)
2. Select your project → **Authentication** → **Settings** tab
3. Scroll down to **App Verification**
4. Find **reCAPTCHA Enterprise**
5. Click the **⋮ (three-dot menu)** → **Disable**
6. Confirm the action

Done! Your app will work perfectly without reCAPTCHA.

## After Disabling reCAPTCHA

1. Return to your app in browser
2. Open DevTools Console (F12)
3. Try signing up or logging in
4. **No more 400 errors** — clean authentication!

## For Production

If you want reCAPTCHA enabled in production:

1. Go to Firebase Console → Your Project → Settings → reCAPTCHA Enterprise
2. Configure with your production domain
3. Set up proper verification tokens
4. Redeploy your frontend with the updated config

For now in development, just disable it — it's completely optional and your app works fine without it.
