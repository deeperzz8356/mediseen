package com.mediseen.app.ads

import android.app.Activity
import android.content.Context
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import com.google.android.gms.ads.AdError
import com.google.android.gms.ads.AdRequest
import com.google.android.gms.ads.FullScreenContentCallback
import com.google.android.gms.ads.LoadAdError
import com.google.android.gms.ads.interstitial.InterstitialAd
import com.google.android.gms.ads.interstitial.InterstitialAdLoadCallback
import com.google.firebase.analytics.FirebaseAnalytics
import com.mediseen.app.R
import java.lang.ref.WeakReference

private const val INTERSTITIAL_INTERVAL_MILLIS = 30_000L
private const val INTERSTITIAL_RETRY_MILLIS = 1_000L

/**
 * Shows an unlimited recurring interstitial while the main app stays active.
 * A new 30-second interval begins after each dismissal or foreground resume.
 */
object TimedNavigationInterstitial {
    private val handler = Handler(Looper.getMainLooper())
    private var activityReference: WeakReference<Activity>? = null
    private var loadedAd: InterstitialAd? = null
    private var loading = false
    private var showing = false

    private val showRunnable = Runnable { showIfAvailable() }

    fun beginSession(context: Context) {
        resumeSession(context)
    }

    fun resumeSession(context: Context) {
        if (!AdsRuntime.adsReady) return
        val activity = context.findActivity() ?: return
        activityReference = WeakReference(activity)
        preload(context)
        scheduleNext()
    }

    fun pauseSession() {
        handler.removeCallbacks(showRunnable)
        activityReference = null
    }

    @Synchronized
    fun preload(context: Context) {
        if (!AdsRuntime.adsReady || loading || loadedAd != null) return
        loading = true
        logEvent(context, "ad_request")
        InterstitialAd.load(
            context.applicationContext,
            context.getString(R.string.admob_interstitial_navigation_ad_unit_id),
            AdRequest.Builder().build(),
            object : InterstitialAdLoadCallback() {
                override fun onAdLoaded(ad: InterstitialAd) {
                    loadedAd = ad
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

    private fun showIfAvailable() {
        val activity = activityReference?.get()
        if (activity == null || !activity.isReadyForFullScreenAd()) return
        if (showing) {
            scheduleNext()
            return
        }

        val ad = loadedAd
        if (ad == null || !FullScreenAdGate.tryAcquire()) {
            preload(activity)
            scheduleNext(INTERSTITIAL_RETRY_MILLIS)
            return
        }

        loadedAd = null
        showing = true
        ad.fullScreenContentCallback = object : FullScreenContentCallback() {
            override fun onAdShowedFullScreenContent() = logEvent(activity, "ad_shown")

            override fun onAdImpression() = logEvent(activity, "ad_impression")

            override fun onAdClicked() = logEvent(activity, "ad_click")

            override fun onAdDismissedFullScreenContent() {
                showing = false
                FullScreenAdGate.release(INTERSTITIAL_INTERVAL_MILLIS)
                logEvent(activity, "ad_dismissed")
                preload(activity)
                scheduleNext()
            }

            override fun onAdFailedToShowFullScreenContent(error: AdError) {
                showing = false
                FullScreenAdGate.release(INTERSTITIAL_INTERVAL_MILLIS)
                logEvent(activity, "ad_show_failed", error.code)
                preload(activity)
                scheduleNext()
            }
        }
        ad.show(activity)
    }

    private fun scheduleNext(delayMillis: Long = INTERSTITIAL_INTERVAL_MILLIS) {
        handler.removeCallbacks(showRunnable)
        if (activityReference?.get() == null) return
        handler.postDelayed(showRunnable, delayMillis)
    }

    private fun logEvent(context: Context, event: String, errorCode: Int? = null) {
        FirebaseAnalytics.getInstance(context).logEvent(event, Bundle().apply {
            putString("placement", "interstitial_recurring_30s")
            putString("format", "interstitial")
            errorCode?.let { putLong("error_code", it.toLong()) }
        })
    }
}

internal fun isRecurringInterstitialInterval(elapsedMillis: Long): Boolean =
    elapsedMillis >= INTERSTITIAL_INTERVAL_MILLIS
