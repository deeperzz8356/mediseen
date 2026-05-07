import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.mediseen.app',
  appName: 'MediSeen',
  webDir: 'out',

  // ── Android WebView stability ──────────────────────────────────────
  android: {
    // Use AndroidX WebView (stable on Android 8+)
    useLegacyBridge: false,
    // Minimum log level for production (reduces noise)
    loggingBehavior: 'none',
  },

  // ── Plugin configurations ─────────────────────────────────────────
  plugins: {
    // Firebase Auth
    FirebaseAuthentication: {
      skipNativeAuth: false,
      providers: ['google.com', 'email'],
    },

    // Camera – permissions requested lazily (only on tap)
    Camera: {
      // No upfront permission config; handled in lib/permissions.ts
    },

    // Local Notifications – permissions explained before requesting
    LocalNotifications: {
      smallIcon: 'ic_stat_icon_config_sample',
      iconColor: '#8B5CF6',
      sound: 'beep.wav',
    },

    // Preferences (replaces deprecated Storage)
    Preferences: {
      group: 'NativeStorage',
    },

    // SplashScreen – disabled; native SplashActivity handles it
    SplashScreen: {
      launchShowDuration: 0,
    },
  },
}

export default config
