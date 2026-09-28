package com.mediseen.app.ads

import android.content.Context
import android.os.Bundle
import androidx.core.content.edit
import com.google.android.gms.ads.AdError
import com.google.android.gms.ads.AdRequest
import com.google.android.gms.ads.FullScreenContentCallback
import com.google.android.gms.ads.LoadAdError
import com.google.android.gms.ads.interstitial.InterstitialAd
import com.google.android.gms.ads.interstitial.InterstitialAdLoadCallback
import com.google.firebase.analytics.FirebaseAnalytics
import com.mediseen.app.BuildConfig
import java.time.LocalDate
import java.util.concurrent.atomic.AtomicBoolean

private const val LIBRARY_COMPLETIONS_REQUIRED = 3
private const val LIBRARY_MAX_DAILY_IMPRESSIONS = 2
private const val LIBRARY_INTERSTITIAL_COOLDOWN_MILLIS = 10 * 60 * 1000L

/**
 * Owns the single Phase 2 interstitial placement.
 * It is shown only at the explicit "finished reading" transition in Library.
 */
object LibraryCompletionInterstitial {
    private const val PREFS_NAME = "mediseen_ad_frequency"
    private const val COMPLETIONS_KEY = "library_article_completions"
    private const val LAST_SHOWN_KEY = "library_interstitial_last_shown"
    private const val SHOWN_DATE_KEY = "library_interstitial_shown_date"
    private const val SHOWN_TODAY_KEY = "library_interstitial_shown_today"
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
            BuildConfig.ADMOB_INTERSTITIAL_LIBRARY_ID,
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
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val completions = prefs.getInt(COMPLETIONS_KEY, 0) + 1
        prefs.edit { putInt(COMPLETIONS_KEY, completions) }

        val activity = context.findActivity()
        val ad = loadedAd
        if (
            activity == null ||
            ad == null ||
            !isEligible(context, completions) ||
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
                recordImpression(context)
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

    private fun isEligible(context: Context, completions: Int): Boolean {
        if (completions < LIBRARY_COMPLETIONS_REQUIRED) return false
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val today = LocalDate.now().toString()
        val shownToday = if (prefs.getString(SHOWN_DATE_KEY, null) == today) {
            prefs.getInt(SHOWN_TODAY_KEY, 0)
        } else {
            0
        }
        val lastShown = prefs.getLong(LAST_SHOWN_KEY, 0L)
        return isLibraryInterstitialEligible(
            completions = completions,
            shownToday = shownToday,
            elapsedSinceLastShowMillis = System.currentTimeMillis() - lastShown,
        )
    }

    private fun recordImpression(context: Context) {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val today = LocalDate.now().toString()
        val shownToday = if (prefs.getString(SHOWN_DATE_KEY, null) == today) {
            prefs.getInt(SHOWN_TODAY_KEY, 0)
        } else {
            0
        }
        prefs.edit {
            putInt(COMPLETIONS_KEY, 0)
            putLong(LAST_SHOWN_KEY, System.currentTimeMillis())
            putString(SHOWN_DATE_KEY, today)
            putInt(SHOWN_TODAY_KEY, shownToday + 1)
        }
    }

    private fun logEvent(context: Context, event: String, errorCode: Int? = null) {
        FirebaseAnalytics.getInstance(context).logEvent(event, Bundle().apply {
            putString("placement", "interstitial_library_completion")
            putString("format", "interstitial")
            errorCode?.let { putLong("error_code", it.toLong()) }
        })
    }
}

internal fun isLibraryInterstitialEligible(
    completions: Int,
    shownToday: Int,
    elapsedSinceLastShowMillis: Long,
): Boolean = completions >= LIBRARY_COMPLETIONS_REQUIRED &&
    shownToday < LIBRARY_MAX_DAILY_IMPRESSIONS &&
    elapsedSinceLastShowMillis >= LIBRARY_INTERSTITIAL_COOLDOWN_MILLIS
