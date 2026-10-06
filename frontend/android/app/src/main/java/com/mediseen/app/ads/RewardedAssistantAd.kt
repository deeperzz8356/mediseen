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
import com.mediseen.app.R
import java.time.LocalDate

private const val FREE_ASSISTANT_QUESTIONS_PER_DAY = 5
private const val REWARDED_ASSISTANT_QUESTIONS = 5

object AssistantAccess {
    private const val PREFS_NAME = "mediseen_assistant_access"
    private const val USAGE_DATE_KEY = "assistant_usage_date"
    private const val USED_TODAY_KEY = "assistant_used_today"
    private const val REWARDED_CREDITS_KEY = "assistant_rewarded_credits"

    fun hasAvailableQuestion(context: Context): Boolean {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val today = LocalDate.now().toString()
        val usedToday = if (prefs.getString(USAGE_DATE_KEY, null) == today) {
            prefs.getInt(USED_TODAY_KEY, 0)
        } else {
            0
        }
        return hasAssistantAccess(
            usedToday = usedToday,
            rewardedCredits = prefs.getInt(REWARDED_CREDITS_KEY, 0),
        )
    }

    fun consumeQuestion(context: Context): Boolean {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val today = LocalDate.now().toString()
        val credits = prefs.getInt(REWARDED_CREDITS_KEY, 0)
        if (credits > 0) {
            prefs.edit { putInt(REWARDED_CREDITS_KEY, credits - 1) }
            return true
        }
        val usedToday = if (prefs.getString(USAGE_DATE_KEY, null) == today) {
            prefs.getInt(USED_TODAY_KEY, 0)
        } else {
            0
        }
        if (usedToday >= FREE_ASSISTANT_QUESTIONS_PER_DAY) return false
        prefs.edit {
            putString(USAGE_DATE_KEY, today)
            putInt(USED_TODAY_KEY, usedToday + 1)
        }
        return true
    }

    internal fun grantReward(context: Context) {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        prefs.edit {
            putInt(
                REWARDED_CREDITS_KEY,
                prefs.getInt(REWARDED_CREDITS_KEY, 0) + REWARDED_ASSISTANT_QUESTIONS,
            )
        }
    }
}

internal fun hasAssistantAccess(usedToday: Int, rewardedCredits: Int): Boolean =
    usedToday < FREE_ASSISTANT_QUESTIONS_PER_DAY || rewardedCredits > 0

object RewardedAssistantAd {
    private var loadedAd: RewardedAd? = null
    private var loading = false

    @Synchronized
    fun preload(context: Context) {
        if (!AdsRuntime.adsReady || loading || loadedAd != null) return
        loading = true
        logEvent(context, "ad_request")
        RewardedAd.load(
            context.applicationContext,
            context.getString(R.string.admob_rewarded_assistant_ad_unit_id),
            AdRequest.Builder().build(),
            object : RewardedAdLoadCallback() {
                override fun onAdLoaded(ad: RewardedAd) {
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
        var rewardEarned = false
        ad.fullScreenContentCallback = object : FullScreenContentCallback() {
            override fun onAdShowedFullScreenContent() = logEvent(context, "ad_shown")
            override fun onAdImpression() = logEvent(context, "ad_impression")
            override fun onAdClicked() = logEvent(context, "ad_click")

            override fun onAdDismissedFullScreenContent() {
                FullScreenAdGate.release(60_000L)
                logEvent(context, "ad_dismissed")
                onClosed(rewardEarned)
                preload(context)
            }

            override fun onAdFailedToShowFullScreenContent(error: AdError) {
                FullScreenAdGate.release(60_000L)
                logEvent(context, "ad_show_failed", errorCode = error.code)
                onClosed(false)
                preload(context)
            }
        }
        ad.show(activity) { reward ->
            rewardEarned = true
            AssistantAccess.grantReward(context)
            logEvent(
                context,
                "ad_reward_earned",
                rewardAmount = reward.amount,
                rewardType = reward.type,
            )
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
            putString("placement", "reward_assistant_bonus")
            putString("format", "rewarded")
            errorCode?.let { putLong("error_code", it.toLong()) }
            rewardAmount?.let { putLong("reward_amount", it.toLong()) }
            rewardType?.let { putString("reward_type", it) }
        })
    }
}
