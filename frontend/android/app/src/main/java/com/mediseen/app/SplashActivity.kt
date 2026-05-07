package com.mediseen.app

import android.content.Intent
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.core.splashscreen.SplashScreen.Companion.installSplashScreen

/**
 * SplashActivity – Native entry point
 *
 * Uses the AndroidX SplashScreen API (no deprecated Handler/delay pattern).
 * setKeepOnScreenCondition returns false immediately so the splash dismisses
 * as soon as the Activity draws – no artificial delays, no flicker.
 *
 * The React layer (page.tsx) handles all routing logic.
 */
class SplashActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        // Install BEFORE super.onCreate so the system splash theme applies
        val splashScreen = installSplashScreen()

        super.onCreate(savedInstanceState)

        // Keep the splash screen visible until we are ready to show MainActivity.
        // We set it to false immediately – the splash icon animation plays
        // for its natural duration (set in res/drawable/ic_splash.xml) and
        // then hands off to MainActivity.
        splashScreen.setKeepOnScreenCondition { false }

        startActivity(Intent(this, MainActivity::class.java))
        finish()
    }
}
