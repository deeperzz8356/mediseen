package com.mediseen.app.ads

import android.content.Context
import android.os.Bundle
import com.google.android.gms.ads.AdError
import com.google.android.gms.ads.AdRequest
import com.google.android.gms.ads.FullScreenContentCallback
import com.google.android.gms.ads.LoadAdError
import com.google.android.gms.ads.interstitial.InterstitialAd
import com.google.android.gms.ads.interstitial.InterstitialAdLoadCallback
import com.google.firebase.analytics.FirebaseAnalytics
import com.mediseen.app.R
import java.util.concurrent.atomic.AtomicBoolean

/**
 * Shows an interstitial after every completed Library article when an ad is ready.
 */
object LibraryCompletionInterstitial {
    private var loadedAd: InterstitialAd? = null
    private var loading = false
    private var showing = false

    @Synchronized
    fun preload(context: Context) {
        if (!AdsRuntime.adsReady || loading || loadedAd != null) return
        loading = true
        logEvent(context, "ad_request")
        InterstitialAd.load(
            context.applicationContext,
            context.getString(R.string.admob_interstitial_library_ad_unit_id),
            AdRequest.Builder().build(),
            object : InterstitialAdLoadCallback() {
                override fun onAdLoaded(ad: InterstitialAd) {
                    loading = false
                    loadedAd = ad
                    logEvent(context, "ad_loaded")
                }

                override fun onAdFailedToLoad(error: LoadAdError) {
                    loading = false
                    loadedAd = null
                    logEvent(context, "ad_load_failed", error.code)
                }
            },
        )
    }

    fun onArticleCompleted(context: Context, onContinue: () -> Unit) {
        if (showing) return
        val activity = context.findActivity()
        val ad = loadedAd
        if (
            activity == null ||
            ad == null ||
            !FullScreenAdGate.tryAcquire()
        ) {
            onContinue()
            preload(context)
            return
        }

        val continued = AtomicBoolean(false)
        fun continueOnce() {
            if (continued.compareAndSet(false, true)) onContinue()
        }

        ad.fullScreenContentCallback = object : FullScreenContentCallback() {
            override fun onAdShowedFullScreenContent() {
                logEvent(context, "ad_shown")
            }

            override fun onAdImpression() = logEvent(context, "ad_impression")

            override fun onAdClicked() = logEvent(context, "ad_click")

            override fun onAdDismissedFullScreenContent() {
                showing = false
                FullScreenAdGate.release()
                logEvent(context, "ad_dismissed")
                continueOnce()
                preload(context)
            }

            override fun onAdFailedToShowFullScreenContent(error: AdError) {
                showing = false
                FullScreenAdGate.release()
                logEvent(context, "ad_show_failed", error.code)
                continueOnce()
                preload(context)
            }
        }
        showing = true
        loadedAd = null
        ad.show(activity)
    }

    private fun logEvent(context: Context, event: String, errorCode: Int? = null) {
        FirebaseAnalytics.getInstance(context).logEvent(event, Bundle().apply {
            putString("placement", "interstitial_library_completion")
            putString("format", "interstitial")
            errorCode?.let { putLong("error_code", it.toLong()) }
        })
    }
}
