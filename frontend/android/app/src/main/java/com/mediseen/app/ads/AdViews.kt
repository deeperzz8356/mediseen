package com.mediseen.app.ads

import android.content.Context
import android.graphics.Color
import android.graphics.Typeface
import android.graphics.drawable.GradientDrawable
import android.os.Bundle
import android.view.Gravity
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.TextView
import androidx.annotation.StringRes
import com.google.android.gms.ads.AdListener
import com.google.android.gms.ads.AdLoader
import com.google.android.gms.ads.AdRequest
import com.google.android.gms.ads.AdSize
import com.google.android.gms.ads.AdView
import com.google.android.gms.ads.LoadAdError
import com.google.android.gms.ads.nativead.MediaView
import com.google.android.gms.ads.nativead.NativeAd
import com.google.android.gms.ads.nativead.NativeAdOptions
import com.google.android.gms.ads.nativead.NativeAdView
import com.google.firebase.analytics.FirebaseAnalytics
import com.mediseen.app.R
import androidx.lifecycle.DefaultLifecycleObserver
import androidx.lifecycle.LifecycleOwner

enum class BannerAdPlacement(@StringRes val adUnitRes: Int, val analyticsName: String) {
    Splash(R.string.admob_banner_splash_ad_unit_id, "banner_splash"),
    HomeFallback(R.string.admob_banner_home_ad_unit_id, "banner_home_fallback"),
    Onboarding(R.string.admob_banner_home_ad_unit_id, "banner_onboarding_fallback"),
    DietInput(R.string.admob_banner_diet_ad_unit_id, "banner_diet_input"),
    GroceryList(R.string.admob_banner_grocery_ad_unit_id, "banner_grocery_list"),
    Activity(R.string.admob_banner_activity_ad_unit_id, "banner_activity"),
    MainNavigation(R.string.admob_banner_main_navigation_ad_unit_id, "banner_all"),
}

enum class NativeAdPlacement(@StringRes val adUnitRes: Int, val analyticsName: String) {
    Language(R.string.admob_native_language_ad_unit_id, "native_language"),
    Onboarding(R.string.admob_native_onboarding_ad_unit_id, "native_onboarding"),
    Home(R.string.admob_native_home_ad_unit_id, "native_home_content"),
    LibraryFeed(R.string.admob_native_library_feed_ad_unit_id, "native_library_feed"),
    LibraryDetail(R.string.admob_native_library_detail_ad_unit_id, "native_library_end"),
    DietPlan(R.string.admob_native_diet_ad_unit_id, "native_diet_plan_end"),
}

fun loadBannerAd(
    context: Context,
    container: ViewGroup,
    placement: BannerAdPlacement,
    maxHeightDp: Int = 60,
) {
    if (!AdsRuntime.adsReady) return
    val width = (context.resources.displayMetrics.widthPixels / context.resources.displayMetrics.density).toInt().coerceAtLeast(1)
    val view = AdView(context).apply {
        adUnitId = context.getString(placement.adUnitRes)
        setAdSize(AdSize.getInlineAdaptiveBannerAdSize(width, maxHeightDp.coerceAtLeast(32)))
        adListener = analyticsListener(context, placement.analyticsName, "banner")
    }
    val owner = context as? LifecycleOwner
    val observer = object : DefaultLifecycleObserver {
        override fun onResume(owner: LifecycleOwner) = view.resume()
        override fun onPause(owner: LifecycleOwner) = view.pause()
        override fun onDestroy(owner: LifecycleOwner) = view.destroy()
    }
    owner?.lifecycle?.addObserver(observer)
    view.addOnAttachStateChangeListener(object : View.OnAttachStateChangeListener {
        override fun onViewAttachedToWindow(v: View) = Unit
        override fun onViewDetachedFromWindow(v: View) {
            owner?.lifecycle?.removeObserver(observer)
            view.destroy()
        }
    })
    container.addView(view, ViewGroup.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT))
    logAd(context, "ad_request", placement.analyticsName, "banner")
    view.loadAd(AdRequest.Builder().build())
}

fun loadNativeAd(
    context: Context,
    container: ViewGroup,
    placement: NativeAdPlacement,
    fillContainer: Boolean = false,
    onFailure: (() -> Unit)? = null,
) {
    if (!AdsRuntime.adsReady) return
    logAd(context, "ad_request", placement.analyticsName, "native")
    AdLoader.Builder(context, context.getString(placement.adUnitRes))
        .forNativeAd { ad ->
            val view = createNativeAdView(context, fillContainer)
            bindNativeAd(view, ad)
            view.addOnAttachStateChangeListener(object : View.OnAttachStateChangeListener {
                override fun onViewAttachedToWindow(v: View) = Unit
                override fun onViewDetachedFromWindow(v: View) = ad.destroy()
            })
            container.removeAllViews()
            container.addView(view)
        }
        .withNativeAdOptions(NativeAdOptions.Builder().setAdChoicesPlacement(NativeAdOptions.ADCHOICES_TOP_RIGHT).build())
        .withAdListener(object : AdListener() {
            override fun onAdLoaded() = logAd(context, "ad_loaded", placement.analyticsName, "native")
            override fun onAdImpression() = logAd(context, "ad_impression", placement.analyticsName, "native")
            override fun onAdClicked() = logAd(context, "ad_click", placement.analyticsName, "native")
            override fun onAdFailedToLoad(error: LoadAdError) {
                logAd(context, "ad_load_failed", placement.analyticsName, "native", error.code)
                onFailure?.invoke()
            }
        }).build().loadAd(AdRequest.Builder().build())
}

private data class NativeAssets(val icon: ImageView, val headline: TextView, val advertiser: TextView, val body: TextView, val media: MediaView, val action: Button)

private fun bindNativeAd(view: NativeAdView, ad: NativeAd) {
    val assets = view.tag as NativeAssets
    assets.headline.text = ad.headline
    assets.advertiser.text = ad.advertiser.orEmpty()
    assets.advertiser.visibility = if (ad.advertiser.isNullOrBlank()) View.GONE else View.VISIBLE
    assets.body.text = ad.body.orEmpty()
    assets.body.visibility = if (ad.body.isNullOrBlank()) View.GONE else View.VISIBLE
    assets.icon.setImageDrawable(ad.icon?.drawable)
    assets.icon.visibility = if (ad.icon == null) View.GONE else View.VISIBLE
    assets.media.mediaContent = ad.mediaContent
    assets.media.visibility = if (ad.mediaContent == null) View.GONE else View.VISIBLE
    assets.action.text = ad.callToAction.orEmpty()
    assets.action.visibility = if (ad.callToAction.isNullOrBlank()) View.GONE else View.VISIBLE
    view.setNativeAd(ad)
}

private fun createNativeAdView(context: Context, fillContainer: Boolean): NativeAdView {
    val density = context.resources.displayMetrics.density
    fun dp(value: Int) = (value * density).toInt()
    fun background(fill: Int, stroke: Int? = null) = GradientDrawable().apply {
        setColor(fill); cornerRadius = dp(16).toFloat(); stroke?.let { setStroke(dp(1), it) }
    }
    val icon = ImageView(context)
    val headline = TextView(context)
    val advertiser = TextView(context)
    val body = TextView(context)
    val media = MediaView(context)
    val action = Button(context)
    return NativeAdView(context).apply {
        layoutParams = ViewGroup.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            if (fillContainer) ViewGroup.LayoutParams.MATCH_PARENT else ViewGroup.LayoutParams.WRAP_CONTENT,
        )
        this.background = background(Color.WHITE, 0xFFE3E7F0.toInt())
        setPadding(dp(16), dp(16), dp(16), dp(16))
        val content = LinearLayout(context).apply {
            orientation = LinearLayout.VERTICAL
            layoutParams = ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                if (fillContainer) ViewGroup.LayoutParams.MATCH_PARENT else ViewGroup.LayoutParams.WRAP_CONTENT,
            )
        }
        content.addView(TextView(context).apply { text = "Sponsored"; textSize = 12f; setTextColor(0xFF536079.toInt()); setTypeface(typeface, Typeface.BOLD) })
        media.minimumWidth = dp(120)
        media.minimumHeight = dp(120)
        media.layoutParams = LinearLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            if (fillContainer) 0 else dp(150),
            if (fillContainer) 1f else 0f,
        ).apply { topMargin = dp(10); bottomMargin = dp(12) }
        content.addView(media)
        val identity = LinearLayout(context).apply { orientation = LinearLayout.HORIZONTAL; gravity = Gravity.CENTER_VERTICAL }
        identity.addView(icon, LinearLayout.LayoutParams(dp(48), dp(48)).apply { marginEnd = dp(12) })
        identity.addView(LinearLayout(context).apply {
            orientation = LinearLayout.VERTICAL
            addView(headline.apply { textSize = 17f; setTextColor(0xFF182033.toInt()); setTypeface(typeface, Typeface.BOLD) })
            addView(advertiser.apply { textSize = 12f; setTextColor(0xFF536079.toInt()) })
        }, LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1f))
        content.addView(identity)
        content.addView(body.apply { textSize = 14f; setTextColor(0xFF536079.toInt()); setPadding(0, dp(12), 0, dp(12)) })
        content.addView(action.apply { isAllCaps = false; setTextColor(Color.WHITE); setTypeface(typeface, Typeface.BOLD); this.background = background(0xFF6840D9.toInt()) }, LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, dp(48)))
        addView(content)
        headlineView = headline; advertiserView = advertiser; bodyView = body; iconView = icon; mediaView = media; callToActionView = action
        tag = NativeAssets(icon, headline, advertiser, body, media, action)
    }
}

private fun analyticsListener(context: Context, placement: String, format: String) = object : AdListener() {
    override fun onAdLoaded() = logAd(context, "ad_loaded", placement, format)
    override fun onAdImpression() = logAd(context, "ad_impression", placement, format)
    override fun onAdClicked() = logAd(context, "ad_click", placement, format)
    override fun onAdFailedToLoad(error: LoadAdError) = logAd(context, "ad_load_failed", placement, format, error.code)
}

private fun logAd(context: Context, event: String, placement: String, format: String, errorCode: Int? = null) {
    FirebaseAnalytics.getInstance(context).logEvent(event, Bundle().apply {
        putString("placement", placement); putString("format", format); errorCode?.let { putLong("error_code", it.toLong()) }
    })
}
