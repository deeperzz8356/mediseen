package com.mediseen.app.ads

import android.content.Context
import android.os.Bundle
import androidx.core.content.edit
import com.google.android.gms.ads.AdError
import com.google.android.gms.ads.AdRequest
import com.google.android.gms.ads.FullScreenContentCallback
import com.google.android.gms.ads.LoadAdError
import com.google.android.gms.ads.appopen.AppOpenAd
import com.google.firebase.analytics.FirebaseAnalytics
import com.mediseen.app.BuildConfig

object AppOpenAds {
    private const val PREFS_NAME = "mediseen_ad_frequency"
    private const val FOREGROUND_COUNT_KEY = "app_open_foreground_count"
    private const val LAST_SHOWN_KEY = "app_open_last_shown"
    private const val BACKGROUNDED_AT_KEY = "app_open_backgrounded_at"
    private const val MIN_BACKGROUND_MILLIS = 30_000L
    private const val AD_EXPIRY_MILLIS = 4 * 60 * 60 * 1000L

    private var loadedAd: AppOpenAd? = null
    private var loadTimeMillis = 0L
    private var loading = false

    @Synchronized
    fun preload(context: Context) {
        if (!AdsRuntime.adsReady || loading || hasFreshAd()) return
        loadedAd = null
        loading = true
        logEvent(context, "ad_request")
        AppOpenAd.load(
            context.applicationContext,
            BuildConfig.ADMOB_APP_OPEN_ID,
            AdRequest.Builder().build(),
            object : AppOpenAd.AppOpenAdLoadCallback() {
                override fun onAdLoaded(ad: AppOpenAd) {
                    loadedAd = ad
                    loadTimeMillis = System.currentTimeMillis()
                    loading = false
                    logEvent(context, "ad_loaded")
                }

                override fun onAdFailedToLoad(error: LoadAdError) {
                    loadedAd = null
                    loading = false
                    logEvent(context, "ad_load_failed", error.code)
                }
            },
        )
    }

    /** Called once when the main app first becomes available; it preloads but never shows. */
    fun beginMainSession(context: Context) {
        if (!AdsRuntime.adsReady) return
        incrementForegroundCount(context)
        preload(context)
    }

    /** Called only for later foreground transitions while the main app is visible. */
    fun onForeground(context: Context) {
        if (!AdsRuntime.adsReady || !isOnboardingComplete(context)) return
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val backgroundedAt = prefs.getLong(BACKGROUNDED_AT_KEY, 0L)
        val backgroundDuration = System.currentTimeMillis() - backgroundedAt
        if (backgroundedAt == 0L || !isRealForegroundTransition(backgroundDuration)) {
            preload(context)
            return
        }
        prefs.edit { remove(BACKGROUNDED_AT_KEY) }
        val count = incrementForegroundCount(context)
        val cooldownElapsed = System.currentTimeMillis() - prefs.getLong(LAST_SHOWN_KEY, 0L)
        val ad = loadedAd
        val activity = context.findActivity()
        if (
            !isAppOpenEligible(count, cooldownElapsed) ||
            ad == null ||
            !hasFreshAd() ||
            activity == null ||
            !FullScreenAdGate.tryAcquire()
        ) {
            preload(context)
            return
        }

        loadedAd = null
        ad.fullScreenContentCallback = object : FullScreenContentCallback() {
            override fun onAdShowedFullScreenContent() {
                prefs.edit { putLong(LAST_SHOWN_KEY, System.currentTimeMillis()) }
                logEvent(context, "ad_shown")
            }

            override fun onAdImpression() = logEvent(context, "ad_impression")

            override fun onAdClicked() = logEvent(context, "ad_click")

            override fun onAdDismissedFullScreenContent() {
                logEvent(context, "ad_dismissed")
                FullScreenAdGate.release()
                preload(context)
            }

            override fun onAdFailedToShowFullScreenContent(error: AdError) {
                logEvent(context, "ad_show_failed", error.code)
                FullScreenAdGate.release()
                preload(context)
            }
        }
        ad.show(activity)
    }

    /** Records a genuine app background transition without treating short system UI hops as new sessions. */
    fun onBackground(context: Context) {
        if (!AdsRuntime.adsReady || !isOnboardingComplete(context)) return
        context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE).edit {
            putLong(BACKGROUNDED_AT_KEY, System.currentTimeMillis())
        }
    }

    private fun incrementForegroundCount(context: Context): Int {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val count = prefs.getInt(FOREGROUND_COUNT_KEY, 0) + 1
        prefs.edit { putInt(FOREGROUND_COUNT_KEY, count) }
        return count
    }

    private fun isOnboardingComplete(context: Context): Boolean =
        context.getSharedPreferences("mediseen_native", Context.MODE_PRIVATE)
            .getBoolean("onboarding_complete", false)

    private fun hasFreshAd(): Boolean = loadedAd != null &&
        System.currentTimeMillis() - loadTimeMillis < AD_EXPIRY_MILLIS

    private fun logEvent(context: Context, event: String, errorCode: Int? = null) {
        FirebaseAnalytics.getInstance(context).logEvent(event, Bundle().apply {
            putString("placement", "app_open_main_foreground")
            putString("format", "app_open")
            errorCode?.let { putLong("error_code", it.toLong()) }
        })
    }
}

internal fun isAppOpenEligible(foregroundCount: Int, elapsedSinceLastShowMillis: Long): Boolean =
    foregroundCount >= 3 && elapsedSinceLastShowMillis >= 4 * 60 * 60 * 1000L

internal fun isRealForegroundTransition(backgroundDurationMillis: Long): Boolean =
    backgroundDurationMillis >= 30_000L
