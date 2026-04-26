package com.mediseen.app

import android.content.Intent
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import androidx.activity.ComponentActivity
import androidx.core.splashscreen.SplashScreen.Companion.installSplashScreen

class SplashActivity : ComponentActivity() {
    private val splashDuration = 1_200L
    private val handler = Handler(Looper.getMainLooper())
    private var keepOnScreen = true
    private val finishRunnable = Runnable {
        keepOnScreen = false
        startActivity(Intent(this, MainActivity::class.java))
        finish()
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        val splash = installSplashScreen()
        super.onCreate(savedInstanceState)
        splash.setKeepOnScreenCondition { keepOnScreen }
        handler.postDelayed(finishRunnable, splashDuration)
    }

    override fun onDestroy() {
        handler.removeCallbacks(finishRunnable)
        super.onDestroy()
    }
}
