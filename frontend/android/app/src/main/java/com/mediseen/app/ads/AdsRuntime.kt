package com.mediseen.app.ads

import android.app.Activity
import android.content.Context
import android.content.ContextWrapper
import android.util.Log
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import com.google.android.gms.ads.MobileAds
import com.google.android.gms.ads.RequestConfiguration
import com.google.android.ump.ConsentInformation
import com.google.android.ump.ConsentRequestParameters
import com.google.android.ump.UserMessagingPlatform
import com.mediseen.app.BuildConfig

/**
 * Owns consent collection and Mobile Ads initialization for the native app.
 * Ads are deliberately unavailable until UMP confirms they can be requested.
 */
object AdsRuntime {
    private val _adsReadyChanges = MutableLiveData(false)
    val adsReadyChanges: LiveData<Boolean> = _adsReadyChanges
    var adsReady = false
        private set(value) { field = value; _adsReadyChanges.value = value }

    var privacyOptionsRequired = false
        private set(value) {
            field = value
            _adsReadyChanges.value = adsReady
        }

    private var consentRequested = false
    private var initializationStarted = false

    fun start(context: Context) {
        if (!BuildConfig.ADS_ENABLED) return
        val activity = context.findActivity() ?: return
        if (consentRequested) return
        consentRequested = true
        if (BuildConfig.ADMOB_TEST_MODE) {
            Log.i("MediSeenAds", "AdMob test mode enabled; Google sample ad units are in use.")
        }

        val consentInformation = UserMessagingPlatform.getConsentInformation(activity)
        val params = ConsentRequestParameters.Builder().build()

        consentInformation.requestConsentInfoUpdate(
            activity,
            params,
            {
                updatePrivacyOptionsState(consentInformation)
                initializeIfAllowed(activity, consentInformation)
                UserMessagingPlatform.loadAndShowConsentFormIfRequired(activity) {
                    updatePrivacyOptionsState(consentInformation)
                    initializeIfAllowed(activity, consentInformation)
                }
            },
            {
                updatePrivacyOptionsState(consentInformation)
                initializeIfAllowed(activity, consentInformation)
            },
        )
    }

    fun showPrivacyOptions(context: Context) {
        if (!BuildConfig.ADS_ENABLED) return
        val activity = context.findActivity() ?: return
        UserMessagingPlatform.showPrivacyOptionsForm(activity) {
            val consentInformation = UserMessagingPlatform.getConsentInformation(activity)
            updatePrivacyOptionsState(consentInformation)
            initializeIfAllowed(activity, consentInformation)
        }
    }

    private fun updatePrivacyOptionsState(consentInformation: ConsentInformation) {
        privacyOptionsRequired =
            consentInformation.privacyOptionsRequirementStatus ==
                ConsentInformation.PrivacyOptionsRequirementStatus.REQUIRED
    }

    private fun initializeIfAllowed(context: Context, consentInformation: ConsentInformation) {
        if (!consentInformation.canRequestAds() || initializationStarted) return
        initializationStarted = true

        val requestConfiguration = MobileAds.getRequestConfiguration()
            .toBuilder()
            .setMaxAdContentRating(RequestConfiguration.MAX_AD_CONTENT_RATING_PG)
            .setPublisherPrivacyPersonalizationState(
                RequestConfiguration.PublisherPrivacyPersonalizationState.DISABLED,
            )
            .build()

        MobileAds.setRequestConfiguration(requestConfiguration)
        MobileAds.putPublisherFirstPartyIdEnabled(false)
        MobileAds.initialize(context.applicationContext) {
            adsReady = true
        }
    }
}
internal tailrec fun Context.findActivity(): Activity? = when (this) {
    is Activity -> this
    is ContextWrapper -> baseContext.findActivity()
    else -> null
}
