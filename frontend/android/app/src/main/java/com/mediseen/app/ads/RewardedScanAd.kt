package com.mediseen.app.ads

import android.content.Context
import android.os.Bundle
import androidx.core.content.edit
import com.google.android.gms.ads.AdError
import com.google.android.gms.ads.AdRequest
import com.google.android.gms.ads.FullScreenContentCallback
import com.google.android.gms.ads.LoadAdError
import com.google.android.gms.ads.rewarded.RewardedAd
import com.google.android.gms.ads.rewarded.RewardedAdLoadCallback
import com.google.firebase.analytics.FirebaseAnalytics
import com.mediseen.app.BuildConfig
import java.time.LocalDate

object ScanAccess {
    private const val PREFS_NAME = "mediseen_scan_access"
    private const val FREE_SCAN_DATE_KEY = "free_scan_used_date"
    private const val REWARDED_CREDITS_KEY = "rewarded_scan_credits"

    fun hasAvailableScan(context: Context): Boolean {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        return hasScanAccess(
            freeScanUsedDate = prefs.getString(FREE_SCAN_DATE_KEY, null),
            today = LocalDate.now().toString(),
            rewardedCredits = prefs.getInt(REWARDED_CREDITS_KEY, 0),
        )
    }

    fun consumeScan(context: Context): Boolean {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val today = LocalDate.now().toString()
        if (prefs.getString(FREE_SCAN_DATE_KEY, null) != today) {
            prefs.edit { putString(FREE_SCAN_DATE_KEY, today) }
            return true
        }
        val credits = prefs.getInt(REWARDED_CREDITS_KEY, 0)
        if (credits <= 0) return false
        prefs.edit { putInt(REWARDED_CREDITS_KEY, credits - 1) }
        return true
    }

    internal fun grantRewardedScan(context: Context) {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val credits = prefs.getInt(REWARDED_CREDITS_KEY, 0)
        prefs.edit { putInt(REWARDED_CREDITS_KEY, credits + 1) }
    }
}

internal fun hasScanAccess(
    freeScanUsedDate: String?,
    today: String,
    rewardedCredits: Int,
): Boolean = freeScanUsedDate != today || rewardedCredits > 0

object RewardedScanAd {
    var isReady = false
        private set

    private var loadedAd: RewardedAd? = null
    private var loading = false

    @Synchronized
    fun preload(context: Context) {
        if (!AdsRuntime.adsReady || loading || loadedAd != null) return
        loading = true
        logEvent(context, "ad_request")
        RewardedAd.load(
            context.applicationContext,
            BuildConfig.ADMOB_REWARDED_SCAN_ID,
            AdRequest.Builder().build(),
            object : RewardedAdLoadCallback() {
                override fun onAdLoaded(ad: RewardedAd) {
                    loadedAd = ad
                    loading = false
                    isReady = true
                    logEvent(context, "ad_loaded")
                }

                override fun onAdFailedToLoad(error: LoadAdError) {
                    loadedAd = null
                    loading = false
                    isReady = false
                    logEvent(context, "ad_load_failed", error.code)
                }
            },
        )
    }

    fun show(
        context: Context,
        onClosed: (rewardEarned: Boolean) -> Unit,
        onUnavailable: () -> Unit,
    ) {
        val activity = context.findActivity()
        val ad = loadedAd
        if (activity == null || ad == null || !FullScreenAdGate.tryAcquire()) {
            onUnavailable()
            preload(context)
            return
        }

        loadedAd = null
        isReady = false
        var rewardEarned = false
        ad.fullScreenContentCallback = object : FullScreenContentCallback() {
            override fun onAdShowedFullScreenContent() = logEvent(context, "ad_shown")

            override fun onAdImpression() = logEvent(context, "ad_impression")

            override fun onAdClicked() = logEvent(context, "ad_click")

            override fun onAdDismissedFullScreenContent() {
                logEvent(context, "ad_dismissed")
                FullScreenAdGate.release(60_000L)
                onClosed(rewardEarned)
                preload(context)
            }

            override fun onAdFailedToShowFullScreenContent(error: AdError) {
                logEvent(context, "ad_show_failed", error.code)
                FullScreenAdGate.release(60_000L)
                onClosed(false)
                preload(context)
            }
        }
        ad.show(activity) { reward ->
            rewardEarned = true
            ScanAccess.grantRewardedScan(context)
            logEvent(context, "ad_reward_earned", rewardAmount = reward.amount, rewardType = reward.type)
        }
    }

    private fun logEvent(
        context: Context,
        event: String,
        errorCode: Int? = null,
        rewardAmount: Int? = null,
        rewardType: String? = null,
    ) {
        FirebaseAnalytics.getInstance(context).logEvent(event, Bundle().apply {
            putString("placement", "rewarded_scan_unlock")
            putString("format", "rewarded")
            errorCode?.let { putLong("error_code", it.toLong()) }
            rewardAmount?.let { putLong("reward_amount", it.toLong()) }
            rewardType?.let { putString("reward_type", it) }
        })
    }
}
