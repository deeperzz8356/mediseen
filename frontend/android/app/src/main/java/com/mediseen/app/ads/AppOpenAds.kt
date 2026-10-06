package com.mediseen.app.ads

import android.app.Activity
import android.content.Context
import android.os.Bundle
import com.google.android.gms.ads.AdError
import com.google.android.gms.ads.AdRequest
import com.google.android.gms.ads.FullScreenContentCallback
import com.google.android.gms.ads.LoadAdError
import com.google.android.gms.ads.appopen.AppOpenAd
import com.google.firebase.analytics.FirebaseAnalytics
import com.mediseen.app.R
import java.lang.ref.WeakReference

object AppOpenAds {
    private const val AD_EXPIRY_MILLIS = 4 * 60 * 60 * 1000L

    private var loadedAd: AppOpenAd? = null
    private var loadTimeMillis = 0L
    private var loading = false
    private var showing = false
    private var suppressForegroundUntilMillis = 0L
    private var pendingShow = false
    private var pendingActivity: WeakReference<Activity>? = null

    @Synchronized
    fun preload(context: Context) {
        if (!AdsRuntime.adsReady || loading || hasFreshAd()) return
        loadedAd = null
        loading = true
        logEvent(context, "ad_request")
        AppOpenAd.load(
            context.applicationContext,
            context.getString(R.string.admob_app_open_ad_unit_id),
            AdRequest.Builder().build(),
            object : AppOpenAd.AppOpenAdLoadCallback() {
                override fun onAdLoaded(ad: AppOpenAd) {
                    loadedAd = ad
                    loadTimeMillis = System.currentTimeMillis()
                    loading = false
                    logEvent(context, "ad_loaded")
                    showPendingAd(context)
                }

                override fun onAdFailedToLoad(error: LoadAdError) {
                    loadedAd = null
                    loading = false
                    logEvent(context, "ad_load_failed", error.code)
                }
            },
        )
    }

    /** Requests an app-open impression whenever the main app becomes available. */
    fun beginMainSession(context: Context) {
        requestShow(context)
    }

    /** Requests another app-open impression whenever the app returns to the foreground. */
    fun onForeground(context: Context) {
        if (!AdsRuntime.adsReady || !isOnboardingComplete(context)) return
        if (showing || System.currentTimeMillis() < suppressForegroundUntilMillis) {
            preload(context)
            return
        }
        if (!FullScreenAdGate.isAvailable()) {
            preload(context)
            return
        }
        requestShow(context)
    }

    private fun requestShow(context: Context) {
        if (!AdsRuntime.adsReady || !isOnboardingComplete(context)) return
        val activity = context.findActivity() ?: return
        pendingShow = true
        pendingActivity = WeakReference(activity)
        if (!showPendingAd(context)) preload(context)
    }

    private fun showPendingAd(context: Context): Boolean {
        if (!pendingShow) return false
        val activity = pendingActivity?.get() ?: return false
        val ad = loadedAd
        if (
            ad == null ||
            !hasFreshAd() ||
            !activity.isReadyForFullScreenAd() ||
            !FullScreenAdGate.tryAcquire()
        ) {
            return false
        }

        pendingShow = false
        pendingActivity = null
        loadedAd = null
        showing = true
        ad.fullScreenContentCallback = object : FullScreenContentCallback() {
            override fun onAdShowedFullScreenContent() {
                logEvent(context, "ad_shown")
            }

            override fun onAdImpression() = logEvent(context, "ad_impression")

            override fun onAdClicked() = logEvent(context, "ad_click")

            override fun onAdDismissedFullScreenContent() {
                showing = false
                suppressForegroundUntilMillis = System.currentTimeMillis() + 2_000L
                logEvent(context, "ad_dismissed")
                FullScreenAdGate.release(0L)
                preload(context)
            }

            override fun onAdFailedToShowFullScreenContent(error: AdError) {
                showing = false
                suppressForegroundUntilMillis = System.currentTimeMillis() + 2_000L
                logEvent(context, "ad_show_failed", error.code)
                FullScreenAdGate.release(0L)
                preload(context)
            }
        }
        ad.show(activity)
        return true
    }

    /** Cancels a deferred impression if the activity leaves the foreground before loading finishes. */
    fun onBackground(context: Context) {
        pendingShow = false
        pendingActivity = null
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
