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

Ads are enabled with Google's sample AdMob IDs in `app/src/main/res/values/strings.xml`. These IDs return test ads and are safe during development; they must be replaced before publishing.

Before a production release, replace these XML resources with the IDs created for the MediSeen AdMob account:

- `admob_app_id`
- `admob_banner_splash_ad_unit_id`
- `admob_banner_home_ad_unit_id`
- `admob_banner_diet_ad_unit_id`
- `admob_banner_grocery_ad_unit_id`
- `admob_banner_activity_ad_unit_id`
- `admob_banner_main_navigation_ad_unit_id`
- `admob_native_language_ad_unit_id`
- `admob_native_home_ad_unit_id`
- `admob_native_library_feed_ad_unit_id`
- `admob_native_library_detail_ad_unit_id`
- `admob_native_diet_ad_unit_id`
- `admob_interstitial_library_ad_unit_id`
- `admob_interstitial_navigation_ad_unit_id`
- `admob_app_open_ad_unit_id`
- `admob_rewarded_scan_ad_unit_id`
- `admob_rewarded_assistant_ad_unit_id`

Before release, also set `ADMOB_TEST_MODE` to `false` and create and publish the required privacy message in the AdMob Privacy & messaging console. The app requests consent on launch, waits until ads may be requested, and exposes an **Ad privacy choices** entry in Profile whenever Google requires it.

Phase 2 uses the Home banner only when the Home native placement fails to load. The Library completion interstitial is preloaded while an article is open and is eligible after three completed articles, with a ten-minute cooldown and a maximum of two impressions per day.

The shared Home banner appears on every onboarding page after consent allows ad requests. App-open ads are preloaded in the main app and become eligible after several foreground sessions, never during first-run onboarding. Users receive one free scan per day; an optional rewarded ad grants one additional scan only after Google's reward callback fires.

The timed navigation interstitial becomes eligible after 30 seconds of active use, but the timer never opens an ad by itself. It can show only at a logical transition among Home, Diet, and Library, never on Back, exit, Scan, Assistant, Profile, authentication, or legal screens. It has a 30-second cooldown and a maximum of two impressions per day.

The assistant includes five free questions per day. An optional rewarded ad grants five more questions and never blocks urgent guidance or existing conversation history.
