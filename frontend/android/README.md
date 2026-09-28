# Mediseen Android

The Android client is a fully native Kotlin application built with XML layouts and Android Views. It does not load the Next.js client in a WebView and does not require Capacitor.

## Open and run

1. Open this `android` directory in Android Studio.
2. Let Gradle sync and select an Android 8.0 (API 26) or newer device.
3. Run the `app` configuration.

From PowerShell, build a debug APK with:

```powershell
.\gradlew.bat :app:assembleDebug
```

The APK is created at `app/build/outputs/apk/dev/debug/app-dev-debug.apk`. The debug build installs as `com.mediseen.health`, a separate package from `com.mediseen.app`, so installing it does not require uninstalling a differently signed release app.

## Architecture

- `MainActivity.kt` hosts the XML/View UI, navigation, permissions, and screen controllers.
- `AppViewModel.kt` owns authentication and feature state.
- `data/ApiClient.kt` connects to the existing Python/FastAPI backend.
- `res/layout` contains the application shell and reusable screen layouts.
- `ui/views` contains reusable Android View builders used for dynamic result lists and cards.

The production API URL is defined by `BuildConfig.API_BASE_URL` in `app/build.gradle`. The existing Next.js source remains available as the independent web client.

## AdMob configuration

Ads are currently disabled in all Android variants (`ADS_ENABLED = false`). The app does not initialize the Mobile Ads SDK, request consent, show ad placements, or require rewarded ads to use scans. Existing AdMob IDs and test-mode configuration are retained for a future opt-in; enabling ads requires explicitly setting `ADS_ENABLED` to `true` in `app/build.gradle` and reviewing the consent and placement behavior below.

Before a production release, provide these values either as Gradle properties or environment variables:

- `ADMOB_APP_ID`
- `ADMOB_NATIVE_HOME_ID`
- `ADMOB_NATIVE_LIBRARY_FEED_ID`
- `ADMOB_NATIVE_LIBRARY_DETAIL_ID`
- `ADMOB_NATIVE_DIET_ID`
- `ADMOB_BANNER_HOME_ID`
- `ADMOB_INTERSTITIAL_LIBRARY_ID`
- `ADMOB_BANNER_ONBOARDING_ID`
- `ADMOB_APP_OPEN_ID`
- `ADMOB_REWARDED_SCAN_ID`

When ads are re-enabled, create and publish the required privacy message in the AdMob Privacy & messaging console. The app's existing flow requests consent on launch, waits until ads may be requested, and exposes an **Ad privacy choices** entry in Profile whenever Google requires it.

Phase 2 uses the Home banner only when the Home native placement fails to load. The Library completion interstitial is preloaded while an article is open and is eligible after three completed articles, with a ten-minute cooldown and a maximum of two impressions per day.

The onboarding banner appears only on the final onboarding page after consent allows ad requests. App-open ads are preloaded in the main app and become eligible after several foreground sessions, never during first-run onboarding. Users receive one free scan per day; an optional rewarded ad grants one additional scan only after Google's reward callback fires.
