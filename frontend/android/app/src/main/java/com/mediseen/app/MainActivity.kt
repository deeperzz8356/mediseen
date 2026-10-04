package com.mediseen.app

import android.Manifest
import android.app.Activity
import android.content.Intent
import android.content.pm.PackageManager
import android.content.res.ColorStateList
import android.graphics.Color
import android.graphics.Typeface
import android.graphics.drawable.ColorDrawable
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.text.SpannableString
import android.text.Spanned
import android.text.InputType
import android.text.style.ForegroundColorSpan
import android.util.Patterns
import android.view.Gravity
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.EditText
import android.widget.FrameLayout
import android.widget.ImageButton
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.PopupWindow
import android.widget.ScrollView
import android.widget.TextView
import androidx.activity.ComponentActivity
import androidx.activity.OnBackPressedCallback
import androidx.activity.result.contract.ActivityResultContracts
import androidx.activity.viewModels
import androidx.core.content.ContextCompat
import androidx.core.net.toUri
import androidx.core.view.ViewCompat
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import coil.load
import com.airbnb.lottie.LottieAnimationView
import com.google.android.gms.auth.api.signin.GoogleSignIn
import com.google.android.gms.auth.api.signin.GoogleSignInOptions
import com.google.android.material.button.MaterialButton
import com.google.android.material.dialog.MaterialAlertDialogBuilder
import com.google.android.material.floatingactionbutton.ExtendedFloatingActionButton
import com.mediseen.app.ads.AdsRuntime
import com.mediseen.app.ads.AppOpenAds
import com.mediseen.app.ads.BannerAdPlacement
import com.mediseen.app.ads.LibraryCompletionInterstitial
import com.mediseen.app.ads.NativeAdPlacement
import com.mediseen.app.ads.RewardedScanAd
import com.mediseen.app.ads.ScanAccess
import com.mediseen.app.ads.loadBannerAd
import com.mediseen.app.ads.loadNativeAd
import com.mediseen.app.data.DiagnoseInput
import com.mediseen.app.data.DiagnosisResult
import com.mediseen.app.data.DietInput
import com.mediseen.app.data.DietPlan
import com.mediseen.app.data.LoadState
import com.mediseen.app.data.MedicalContext
import com.mediseen.app.data.UserProfile
import com.mediseen.app.ui.supportedLanguages
import com.mediseen.app.ui.tr
import com.mediseen.app.ui.views.action
import com.mediseen.app.ui.views.body
import com.mediseen.app.ui.views.bullet
import com.mediseen.app.ui.views.choices
import com.mediseen.app.ui.views.dp
import com.mediseen.app.ui.views.error
import com.mediseen.app.ui.views.gap
import com.mediseen.app.ui.views.heading
import com.mediseen.app.ui.views.image
import com.mediseen.app.ui.views.input
import com.mediseen.app.ui.views.loading
import com.mediseen.app.ui.views.panel
import com.mediseen.app.ui.views.rounded
import com.mediseen.app.ui.views.secondaryAction
import com.mediseen.app.ui.views.section
import java.io.File
import java.time.LocalDate
import kotlin.math.max
import kotlin.math.roundToInt

class MainActivity : ComponentActivity(), SensorEventListener {
    private val vm: AppViewModel by viewModels()

    private lateinit var stageHost: FrameLayout
    private lateinit var mainShell: View
    private lateinit var screenHost: FrameLayout
    private lateinit var header: View
    private lateinit var headerTitle: TextView
    private lateinit var headerLanguage: ImageButton
    private lateinit var headerProfile: ImageButton
    private lateinit var bottomNavigation: LinearLayout
    private lateinit var navigationItems: Map<String, LinearLayout>
    private lateinit var assistantFab: ExtendedFloatingActionButton

    private var route = "home"
    private var previousRoute = "home"
    private var welcomeScheduled = false
    private var onboardingPage = 0
    private var selectedLanguage = "en"
    private var adsSessionStarted = false
    private var initialStartHandled = false
    private var rendering = false
    private var renderedStage: AppStage? = null
    private var returningFromProfileEdit = false

    private var authEmail = ""
    private var authPassword = ""
    private var authConfirm = ""
    private var createAccount = false
    private var authAttempted = false
    private var profileName = ""
    private var profileAge = ""
    private var profileGender = "prefer_not_to_say"
    private var profileDraftInitialized = false
    private var profileExpanded = false
    private var chatDraft = ""
    private var libraryQuery = ""
    private var diagnoseImage: Uri? = null
    private var cameraImage: Uri? = null
    private var diagnoseSymptoms = ""
    private var showHistory = false
    private var diagnoseTab = "scan"
    private var diagnoseStep = 1
    private var pendingScanConsumption = false
    private var rewardMessage: String? = null
    private var dietDisease = ""
    private var dietWeight = "70"
    private var dietHeight = "170"
    private var dietAge = "25"
    private var dietGender = "male"
    private var dietGoal = "maintenance"
    private var dietType = "veg"
    private var dietBudget = "medium"
    private var sensorManager: SensorManager? = null
    private var currentSteps = 0
    private var stepsText: TextView? = null
    private var caloriesText: TextView? = null

    private val notificationPermission = registerForActivityResult(ActivityResultContracts.RequestPermission()) { vm.finishNotification() }
    private val activityPermission = registerForActivityResult(ActivityResultContracts.RequestPermission()) { renderApp() }
    private val cameraPermission = registerForActivityResult(ActivityResultContracts.RequestPermission()) { if (it) launchCamera() }
    private val galleryPicker = registerForActivityResult(ActivityResultContracts.GetContent()) { uri ->
        uri?.let { diagnoseImage = it; vm.clearDiagnosis(); renderApp() }
    }
    private val cameraCapture = registerForActivityResult(ActivityResultContracts.TakePicture()) { captured ->
        if (captured) diagnoseImage = cameraImage
        renderApp()
    }
    private val googleSignIn = registerForActivityResult(ActivityResultContracts.StartActivityForResult()) { result ->
        if (result.resultCode == Activity.RESULT_OK) {
            runCatching { GoogleSignIn.getSignedInAccountFromIntent(result.data).result.idToken }
                .getOrNull()?.let(vm::signInWithGoogle)
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        WindowCompat.setDecorFitsSystemWindows(window, false)
        WindowCompat.getInsetsController(window, window.decorView).apply {
            isAppearanceLightStatusBars = true
            isAppearanceLightNavigationBars = true
        }
        setContentView(R.layout.activity_main)
        bindShell()
        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.app_root)) { view, insets ->
            val bars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
            view.setPadding(0, bars.top, 0, bars.bottom)
            insets
        }
        if (savedInstanceState == null) selectedLanguage = vm.locale else restoreUiState(savedInstanceState)
        setupNavigation()
        vm.changes.observe(this) { renderApp() }
        AdsRuntime.adsReadyChanges.observe(this) { ready ->
            if (ready && vm.stage == AppStage.MAIN && !adsSessionStarted) {
                adsSessionStarted = true
                AppOpenAds.beginMainSession(this)
            }
            renderApp()
        }
        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() = handleBack()
        })
        renderApp()
    }

    override fun onStart() {
        super.onStart()
        if (initialStartHandled && vm.stage == AppStage.MAIN) AppOpenAds.onForeground(this)
        initialStartHandled = true
    }

    override fun onSaveInstanceState(outState: Bundle) {
        super.onSaveInstanceState(outState)
        outState.putString("route", route)
        outState.putString("previousRoute", previousRoute)
        outState.putInt("onboardingPage", onboardingPage)
        outState.putString("selectedLanguage", selectedLanguage)
        outState.putString("authEmail", authEmail)
        outState.putString("authPassword", authPassword)
        outState.putString("authConfirm", authConfirm)
        outState.putBoolean("createAccount", createAccount)
        outState.putString("profileName", profileName)
        outState.putString("profileAge", profileAge)
        outState.putString("profileGender", profileGender)
        outState.putBoolean("profileDraftInitialized", profileDraftInitialized)
        outState.putString("chatDraft", chatDraft)
        outState.putString("libraryQuery", libraryQuery)
        outState.putString("diagnoseImage", diagnoseImage?.toString())
        outState.putString("cameraImage", cameraImage?.toString())
        outState.putString("diagnoseSymptoms", diagnoseSymptoms)
        outState.putBoolean("showHistory", showHistory)
        outState.putString("diagnoseTab", diagnoseTab)
        outState.putInt("diagnoseStep", diagnoseStep)
        outState.putString("dietDisease", dietDisease)
        outState.putString("dietWeight", dietWeight)
        outState.putString("dietHeight", dietHeight)
        outState.putString("dietAge", dietAge)
        outState.putString("dietGender", dietGender)
        outState.putString("dietGoal", dietGoal)
        outState.putString("dietType", dietType)
        outState.putString("dietBudget", dietBudget)
    }

    private fun restoreUiState(state: Bundle) {
        route = state.getString("route", route)
        previousRoute = state.getString("previousRoute", previousRoute)
        onboardingPage = state.getInt("onboardingPage", 0).coerceIn(onboardingPages.indices)
        selectedLanguage = state.getString("selectedLanguage", vm.locale)
        authEmail = state.getString("authEmail", "")
        authPassword = state.getString("authPassword", "")
        authConfirm = state.getString("authConfirm", "")
        createAccount = state.getBoolean("createAccount", false)
        profileName = state.getString("profileName", "")
        profileAge = state.getString("profileAge", "")
        profileGender = state.getString("profileGender", "prefer_not_to_say")
        profileDraftInitialized = state.getBoolean("profileDraftInitialized", false)
        chatDraft = state.getString("chatDraft", "")
        libraryQuery = state.getString("libraryQuery", "")
        diagnoseImage = state.getString("diagnoseImage")?.toUri()
        cameraImage = state.getString("cameraImage")?.toUri()
        diagnoseSymptoms = state.getString("diagnoseSymptoms", "")
        showHistory = state.getBoolean("showHistory", false)
        diagnoseTab = state.getString("diagnoseTab", "scan")
        diagnoseStep = state.getInt("diagnoseStep", 1).coerceIn(1, 3)
        dietDisease = state.getString("dietDisease", "")
        dietWeight = state.getString("dietWeight", "70")
        dietHeight = state.getString("dietHeight", "170")
        dietAge = state.getString("dietAge", "25")
        dietGender = state.getString("dietGender", "male")
        dietGoal = state.getString("dietGoal", "maintenance")
        dietType = state.getString("dietType", "veg")
        dietBudget = state.getString("dietBudget", "medium")
    }

    override fun onPause() {
        super.onPause()
        sensorManager?.unregisterListener(this)
    }

    override fun onResume() {
        super.onResume()
        if (vm.stage == AppStage.MAIN && route == "home") startStepTracking()
    }

    private fun bindShell() {
        stageHost = findViewById(R.id.stage_host)
        mainShell = findViewById(R.id.main_shell)
        screenHost = findViewById(R.id.screen_host)
        header = findViewById(R.id.app_header)
        headerTitle = findViewById(R.id.header_title)
        headerLanguage = findViewById(R.id.header_language)
        headerProfile = findViewById(R.id.header_profile)
        bottomNavigation = findViewById(R.id.bottom_navigation)
        navigationItems = mapOf(
            "home" to findViewById(R.id.nav_home),
            "diet" to findViewById(R.id.nav_diet),
            "diagnose" to findViewById(R.id.nav_diagnose),
            "library" to findViewById(R.id.nav_library),
            "profile" to findViewById(R.id.nav_profile),
        )
        assistantFab = findViewById(R.id.assistant_fab)
    }

    private fun setupNavigation() {
        navigationItems.forEach { (destination, item) -> item.setOnClickListener { navigate(destination) } }
        headerProfile.setOnClickListener { navigate("profile") }
        headerLanguage.setOnClickListener { showLanguageMenu(headerLanguage) }
        assistantFab.setOnClickListener { navigate("chat") }
    }

    private fun navigate(next: String) {
        if (next == route) return
        previousRoute = route
        route = next
        renderApp()
    }

    private fun renderApp() {
        if (rendering) return
        rendering = true
        try {
            if (vm.stage == AppStage.MAIN) {
                if (renderedStage != null && renderedStage != AppStage.MAIN) {
                    route = if (returningFromProfileEdit) "profile" else "home"
                    previousRoute = "home"
                    returningFromProfileEdit = false
                }
                stageHost.visibility = View.GONE
                mainShell.visibility = View.VISIBLE
                AdsRuntime.start(this)
                if (AdsRuntime.adsReady && !adsSessionStarted) {
                    adsSessionStarted = true
                    AppOpenAds.beginMainSession(this)
                }
                renderMain()
            } else {
                stopStepTracking()
                mainShell.visibility = View.GONE
                assistantFab.visibility = View.GONE
                stageHost.visibility = View.VISIBLE
                renderStage()
                if (vm.stage in setOf(AppStage.ONBOARDING, AppStage.AUTH, AppStage.PROFILE)) AdsRuntime.start(this)
            }
        } finally {
            renderedStage = vm.stage
            rendering = false
        }
    }

    private fun renderStage() {
        stageHost.removeAllViews()
        when (vm.stage) {
            AppStage.WELCOME -> renderWelcome()
            AppStage.LANGUAGE -> renderLanguage()
            AppStage.NOTIFICATION -> renderNotification()
            AppStage.ONBOARDING -> renderOnboarding()
            AppStage.AUTH -> renderAuth()
            AppStage.PROFILE -> renderProfileForm()
            AppStage.MAIN -> Unit
        }
    }

    private fun renderWelcome() {
        stageHost.addView(LayoutInflater.from(this).inflate(R.layout.screen_welcome, stageHost, false))
        if (!welcomeScheduled) {
            welcomeScheduled = true
            Handler(Looper.getMainLooper()).postDelayed({ if (vm.stage == AppStage.WELCOME) vm.finishWelcome() }, 1450)
        }
    }

    private fun scrollScreen(host: ViewGroup = stageHost): LinearLayout {
        host.removeAllViews()
        val root = LayoutInflater.from(this).inflate(R.layout.screen_scroll, host, false)
        host.addView(root)
        return root.findViewById(R.id.screen_content)
    }

    private fun contentScreen(layout: Int, contentId: Int, host: ViewGroup = stageHost): LinearLayout {
        host.removeAllViews()
        val root = LayoutInflater.from(this).inflate(layout, host, false)
        host.addView(root)
        return root.findViewById(contentId)
    }

    private fun renderLanguage() {
        stageHost.removeAllViews()
        val root = LayoutInflater.from(this).inflate(R.layout.screen_language, stageHost, false)
        stageHost.addView(root)
        root.findViewById<View>(R.id.language_back).setOnClickListener { handleBack() }
        root.findViewById<View>(R.id.language_confirm).setOnClickListener { vm.selectLanguage(selectedLanguage) }
        with(root.findViewById<LinearLayout>(R.id.language_content)) {
        heading("Choose Language")
        body("Select your preferred language for the app interface.")
        gap(14)
        supportedLanguages.forEach { language ->
            val active = selectedLanguage == language.code
            addView(LinearLayout(context).apply {
                orientation = LinearLayout.HORIZONTAL
                gravity = Gravity.CENTER_VERTICAL
                setPadding(dp(14), dp(8), dp(12), dp(8))
                background = rounded(if (active) 0xFFF8F6FF.toInt() else Color.WHITE, 14, ContextCompat.getColor(context, if (active) R.color.brand_violet else R.color.hairline))
                addView(TextView(context).apply {
                    text = when (language.code) { "en" -> "🇬🇧"; "hi", "te" -> "🇮🇳"; "es" -> "🇪🇸"; "fr" -> "🇫🇷"; "ar" -> "🇸🇦"; "de" -> "🇩🇪"; "ko" -> "🇰🇷"; "ja" -> "🇯🇵"; else -> "🇨🇳" }
                    textSize = 25f
                    gravity = Gravity.CENTER
                }, LinearLayout.LayoutParams(dp(38), dp(38)))
                addView(LinearLayout(context).apply {
                    orientation = LinearLayout.VERTICAL
                    setPadding(dp(12), 0, 0, 0)
                    addView(TextView(context).apply { text = language.name; textSize = 16f; setTypeface(typeface, Typeface.BOLD); setTextColor(ContextCompat.getColor(context, R.color.ink)) })
                    addView(TextView(context).apply { text = language.name; textSize = 12f; setTextColor(ContextCompat.getColor(context, R.color.quiet_ink)) })
                }, LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1f))
                addView(TextView(context).apply {
                    text = if (active) "✓" else ""
                    textSize = 16f; gravity = Gravity.CENTER
                    setTextColor(Color.WHITE)
                    background = context.rounded(if (active) ContextCompat.getColor(context, R.color.brand_violet) else Color.WHITE, 24, ContextCompat.getColor(context, if (active) R.color.brand_violet else R.color.hairline))
                }, LinearLayout.LayoutParams(dp(30), dp(30)))
                isSelected = active
                contentDescription = "${language.name}${if (active) ", selected" else ""}"
                setOnClickListener { selectedLanguage = language.code; renderApp() }
            }, LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, dp(62)).apply { bottomMargin = dp(9) })
        }
        }
    }

    private fun renderNotification() = with(contentScreen(R.layout.screen_notification, R.id.notification_content)) {
        val top = LinearLayout(context).apply { orientation = LinearLayout.HORIZONTAL; gravity = Gravity.CENTER_VERTICAL }
        top.addView(topAction("‹") { vm.returnToLanguage() }.apply { setTextColor(ContextCompat.getColor(context, R.color.quiet_ink)) })
        top.addView(View(context), LinearLayout.LayoutParams(0, 1, 1f))
        top.addView(topAction("Skip") { vm.finishNotification() }.apply { contentDescription = "Top notification skip"; setTypeface(typeface, Typeface.NORMAL); setTextColor(ContextCompat.getColor(context, R.color.quiet_ink)) })
        addView(top)
        gap(70)
        addView(FrameLayout(context).apply {
            background = context.rounded(ContextCompat.getColor(context, R.color.brand_violet_soft), 28)
            addView(ImageView(context).apply {
                setImageResource(R.drawable.ic_notifications)
                imageTintList = ContextCompat.getColorStateList(context, R.color.brand_violet)
                contentDescription = "Notifications"
            }, FrameLayout.LayoutParams(dp(38), dp(38), Gravity.CENTER))
        }, LinearLayout.LayoutParams(dp(88), dp(88)).apply { gravity = Gravity.CENTER_HORIZONTAL })
        gap(24)
        heading("Stay on top of\nyour health", 25f).apply { gravity = Gravity.CENTER; layoutParams = LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT) }
        gap(10)
        body("Enable notifications to get timely health reminders\nand alerts.").apply { gravity = Gravity.CENTER; textSize = 14f }
        gap(28)
        listOf(
            Triple("Medicine Reminders", "Never miss a dose with timely reminders", R.color.brand_pink_soft),
            Triple("AI Health Alerts", "Get notified about important health insights", R.color.brand_violet_soft),
            Triple("Daily Health Tips", "Bite-sized tips to improve your well-being", R.color.brand_blue_soft),
        ).forEach { (title, detail, tint) ->
            panel {
                orientation = LinearLayout.HORIZONTAL
                gravity = Gravity.CENTER_VERTICAL
                addView(ImageView(context).apply {
                    setImageResource(if (title == "Daily Health Tips") R.drawable.ic_scan else R.drawable.ic_notifications)
                    imageTintList = ContextCompat.getColorStateList(context, if (title == "Daily Health Tips") R.color.brand_blue else if (title == "Medicine Reminders") R.color.brand_pink else R.color.brand_violet)
                    background = rounded(ContextCompat.getColor(context, tint), 12)
                    setPadding(dp(10), dp(10), dp(10), dp(10))
                }, LinearLayout.LayoutParams(dp(38), dp(38)))
                addView(LinearLayout(context).apply {
                    orientation = LinearLayout.VERTICAL
                    setPadding(dp(14), 0, 0, 0)
                    body(title, muted = false).apply { textSize = 14f; setTypeface(typeface, Typeface.BOLD) }
                    body(detail).apply { textSize = 12f }
                }, LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1f))
            }
        }
        gap(10)
        action("Allow Notifications") {
            if (Build.VERSION.SDK_INT >= 33 && ContextCompat.checkSelfPermission(this@MainActivity, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) notificationPermission.launch(Manifest.permission.POST_NOTIFICATIONS)
            else vm.finishNotification()
        }
        addView(topAction("Skip") { vm.finishNotification() }.apply {
            contentDescription = "Bottom notification skip"
            setTypeface(typeface, Typeface.NORMAL)
            setTextColor(ContextCompat.getColor(context, R.color.quiet_ink))
        }, LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, dp(48)))
    }

    private data class OnboardingPage(val title: String, val subtitle: String, val description: String, val features: List<String>, val animation: Int)

    private val onboardingPages by lazy {
        listOf(
            OnboardingPage("AI Health Insights", "INSTANT HEALTH INSIGHTS", "Upload any health scan or report and our advanced AI scans it in seconds. Get clear, easy-to-understand insights with confidence scores.", listOf("Chest X-Ray scan", "Skin condition insights", "High accuracy"), R.raw.onboarding_insights),
            OnboardingPage("Diet Recommendations", "NUTRITION TAILORED FOR YOU", "Get personalized diet plans based on your diagnosed conditions, age, and health goals. Know exactly what to eat and what to avoid.", listOf("Condition-specific meal plans", "Macro tracking", "Food swap suggestions"), R.raw.onboarding_nutrition),
            OnboardingPage("Health Reports & Tracking", "YOUR HEALTH, VISUALIZED", "Sync with Google Health Connect to track steps, sleep, calories, and heart rate. Generate detailed PDF reports to share with your doctor.", listOf("Health Connect sync", "Visual charts", "Shareable PDF reports"), R.raw.onboarding_reports),
            OnboardingPage("AI Health Assistant", "ASK ANYTHING, ANYTIME", "Ask the assistant about health results and next steps in clear language.", listOf("Health guidance", "Multiple languages", "Clear answers"), R.raw.onboarding_assistant),
        )
    }

    private fun renderOnboarding() = with(contentScreen(R.layout.screen_onboarding, R.id.onboarding_content)) {
        val page = onboardingPages[onboardingPage]
        val accent = when (onboardingPage) { 0 -> R.color.brand_pink; 1 -> R.color.positive; 2 -> R.color.brand_blue; else -> R.color.brand_violet }
        addView(LinearLayout(context).apply {
            gravity = Gravity.CENTER_VERTICAL
            onboardingPages.indices.forEach { index -> addView(View(context).apply {
                background = context.rounded(ContextCompat.getColor(context, if (index == onboardingPage) accent else R.color.hairline), 8)
            }, LinearLayout.LayoutParams(dp(if (index == onboardingPage) 28 else 8), dp(8)).apply { marginEnd = dp(6) }) }
            addView(View(context), LinearLayout.LayoutParams(0, 1, 1f))
            addView(topAction("Skip") { vm.finishOnboarding() })
        })
        addView(LottieAnimationView(context).apply {
            setAnimation(page.animation)
            setRenderMode(com.airbnb.lottie.RenderMode.SOFTWARE)
            progress = 0.35f
            repeatCount = -1
            playAnimation()
            setPadding(dp(8), dp(8), dp(8), dp(8))
            layoutParams = LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, dp(390)).apply {
                topMargin = dp(8)
                bottomMargin = dp(8)
            }
            contentDescription = page.title
        })
        body(page.subtitle, muted = false).apply { textSize = 12f; letterSpacing = 0.08f; setTextColor(ContextCompat.getColor(context, accent)); setTypeface(typeface, Typeface.BOLD) }
        gap(8)
        heading(page.title)
        body(page.description)
        gap(16)
        addView(com.google.android.material.chip.ChipGroup(context).apply {
            page.features.forEach { feature -> addView(com.google.android.material.chip.Chip(context).apply {
                text = feature; isClickable = false; isCheckable = false
                chipBackgroundColor = ContextCompat.getColorStateList(context, R.color.surface_subtle)
                chipStrokeWidth = 0f
            }) }
        })
        if (onboardingPage == onboardingPages.lastIndex && AdsRuntime.adsReady) {
            addView(FrameLayout(context).also { loadBannerAd(context, it, BannerAdPlacement.Onboarding) })
            gap(12)
        }
        gap(16)
        action(if (onboardingPage == onboardingPages.lastIndex) "Get Started" else "Next") {
            if (onboardingPage == onboardingPages.lastIndex) vm.finishOnboarding() else { onboardingPage++; renderApp() }
        }.apply {
            background = ContextCompat.getDrawable(context, when (onboardingPage) {
                0 -> R.drawable.action_insights
                1 -> R.drawable.action_nutrition
                2 -> R.drawable.action_reports
                else -> R.drawable.brand_action
            })
        }
    }

    private fun renderAuth() = with(contentScreen(R.layout.screen_auth, R.id.auth_content)) {
        image(R.mipmap.ic_launcher_foreground, "MediSeen logo", 48)
        heading(if (createAccount) "Create your account" else "Welcome", 24f).apply {
            gravity = Gravity.CENTER
            layoutParams = LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT)
        }
        body(if (createAccount) "Save your health history and continue across devices." else "Login to access the AI health insights platform").apply { gravity = Gravity.CENTER }
        gap(18)
        input("Email address", authEmail, InputType.TYPE_CLASS_TEXT or InputType.TYPE_TEXT_VARIATION_EMAIL_ADDRESS) { authEmail = it; vm.clearAuthError() }
        input("Password", authPassword, InputType.TYPE_CLASS_TEXT or InputType.TYPE_TEXT_VARIATION_PASSWORD) { authPassword = it; vm.clearAuthError() }
        if (createAccount) input("Confirm password", authConfirm, InputType.TYPE_CLASS_TEXT or InputType.TYPE_TEXT_VARIATION_PASSWORD) { authConfirm = it; vm.clearAuthError() }
        val validEmail = Patterns.EMAIL_ADDRESS.matcher(authEmail.trim()).matches()
        val validPassword = if (createAccount) authPassword.length >= 6 else authPassword.isNotBlank()
        val passwordsMatch = !createAccount || authPassword == authConfirm
        if (authAttempted && !validEmail) error("Enter a valid email address")
        if (authAttempted && !validPassword) error(if (createAccount) "Use at least 6 characters" else "Enter your password")
        if (authAttempted && !passwordsMatch) error("Passwords do not match")
        vm.authError?.let(::error)
        if (vm.authBusy) loading("Signing you in…")
        action(if (createAccount) "Create account" else "Sign in") {
            authAttempted = true
            if (validEmail && validPassword && passwordsMatch) {
                if (createAccount) vm.signUp(authEmail.trim(), authPassword) else vm.signIn(authEmail.trim(), authPassword)
            } else renderApp()
        }.isEnabled = !vm.authBusy
        addView(LinearLayout(context).apply {
            gravity = Gravity.CENTER_VERTICAL
            addView(View(context).apply { setBackgroundColor(ContextCompat.getColor(context, R.color.hairline)) }, LinearLayout.LayoutParams(0, dp(1), 1f))
            addView(TextView(context).apply { text = "OR"; textSize = 11f; setTextColor(ContextCompat.getColor(context, R.color.quiet_ink)); setPadding(dp(12), 0, dp(12), 0) })
            addView(View(context).apply { setBackgroundColor(ContextCompat.getColor(context, R.color.hairline)) }, LinearLayout.LayoutParams(0, dp(1), 1f))
        }, LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, dp(36)))
        secondaryAction("G   Continue with Google") {
            val options = GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN).requestIdToken(getString(R.string.default_web_client_id)).requestEmail().build()
            googleSignIn.launch(GoogleSignIn.getClient(this@MainActivity, options).signInIntent)
        }.isEnabled = !vm.authBusy
        secondaryAction("Continue as guest") { vm.continueAsGuest() }
        addView(topAction(if (createAccount) "Already have an account? Sign in" else "New to MediSeen?  Create Account") {
            createAccount = !createAccount
            authAttempted = false
            vm.clearAuthError()
            renderApp()
        }, LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, dp(48)))
        addView(topAction("PRIVACY POLICY") {
            startActivity(Intent(Intent.ACTION_VIEW, Uri.parse("https://sites.google.com/view/sapappsolutionmediseenpolicy/home")))
        }.apply { textSize = 10f; letterSpacing = 0.12f; setTextColor(ContextCompat.getColor(context, R.color.quiet_ink)) }, LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, dp(40)))
    }

    private fun renderProfileForm() = with(contentScreen(R.layout.screen_profile_form, R.id.profile_form_content)) {
        if (!profileDraftInitialized) {
            profileName = vm.profile?.name.orEmpty()
            profileAge = vm.profile?.age.orEmpty()
            profileGender = vm.profile?.gender ?: "prefer_not_to_say"
            profileDraftInitialized = true
        }
        body("ONE LAST STEP", muted = false).apply { setTextColor(ContextCompat.getColor(context, R.color.brand_violet)); setTypeface(typeface, Typeface.BOLD) }
        heading("Complete your profile")
        body("These details help tailor your recommendations. You can update them later.")
        gap(24)
        input("Name", profileName) { profileName = it; vm.clearAuthError() }
        input("Age", profileAge, InputType.TYPE_CLASS_NUMBER) { profileAge = it.filter(Char::isDigit).take(3); vm.clearAuthError() }
        choices("Gender", listOf("male", "female", "other", "prefer_not_to_say"), profileGender) { profileGender = it }
        vm.authError?.let(::error)
        if (vm.authBusy) loading("Saving profile…")
        action("Save and continue") {
            val age = profileAge.toIntOrNull()
            if (profileName.isNotBlank() && age != null && age in 1..120) vm.saveProfile(UserProfile(name = profileName.trim(), age = profileAge, gender = profileGender, language = vm.locale))
            else error("Enter a name and an age from 1 to 120")
        }.isEnabled = !vm.authBusy
        if (returningFromProfileEdit) secondaryAction("Cancel") {
            profileDraftInitialized = false
            vm.cancelProfileEdit()
        }
    }

    private fun renderMain() {
        val legalDetail = route in setOf("privacy", "terms")
        header.visibility = if (legalDetail) View.GONE else View.VISIBLE
        bottomNavigation.visibility = if (legalDetail) View.GONE else View.VISIBLE
        assistantFab.visibility = if (route in setOf("chat", "privacy", "terms", "profile")) View.GONE else View.VISIBLE
        headerTitle.text = tr(vm.locale, if (route == "chat") "chat" else route)
        findViewById<View>(R.id.app_root).layoutDirection = if (vm.locale == "ar") View.LAYOUT_DIRECTION_RTL else View.LAYOUT_DIRECTION_LTR
        val selectedRoute = when (route) {
            "diet", "diagnose", "library" -> route
            "profile", "privacy", "terms" -> "profile"
            else -> "home"
        }
        navigationItems.forEach { (destination, item) ->
            val selected = destination == selectedRoute
            item.background = if (selected) ContextCompat.getDrawable(this, R.drawable.nav_indicator) else null
            item.isSelected = selected
            val icon = item.getChildAt(0) as ImageView
            val label = item.getChildAt(1) as TextView
            val color = ContextCompat.getColor(this, if (selected) android.R.color.white else R.color.muted_ink)
            icon.imageTintList = ColorStateList.valueOf(color)
            label.setTextColor(color)
            label.text = when (destination) {
                "home" -> tr(vm.locale, "home")
                "diet" -> tr(vm.locale, "diet")
                "diagnose" -> "SCAN"
                "library" -> tr(vm.locale, "library")
                else -> tr(vm.locale, "profile")
            }.uppercase()
        }
        renderRoute()
    }

    private fun renderRoute() {
        stopStepTracking()
        when (route) {
            "home" -> renderHome(); "diet" -> renderDiet(); "diagnose" -> renderDiagnose(); "library" -> renderLibrary()
            "chat" -> renderChat(); "profile" -> renderProfile(); "privacy" -> renderPrivacy(); "terms" -> renderTerms()
            else -> { route = "home"; renderHome() }
        }
    }

    private fun renderHome() = with(contentScreen(R.layout.screen_home, R.id.home_content, screenHost)) {
        val hero = panel(Color.TRANSPARENT) {
            background = ContextCompat.getDrawable(context, R.drawable.hero_gradient)
            setPadding(dp(24), dp(38), dp(24), dp(28))
            body("✣  EMPOWERING YOUR HEALTH DECISIONS", muted = false).apply {
                textSize = 10.5f
                letterSpacing = 0.08f
                setTextColor(0xFFF4F0FF.toInt())
                background = rounded(0x22FFFFFF, 18, 0x55FFFFFF)
                setPadding(dp(12), dp(7), dp(12), dp(7))
            }
            gap(18)
            heading("${tr(vm.locale, "hello")},", 29f).setTextColor(Color.WHITE)
            gap(16)
            body("How can I help you today? I’m ready to scan reports or answer questions.", muted = false).setTextColor(0xFFE1E3EE.toInt())
            gap(22)
            secondaryAction("START SCAN   ›") { navigate("diagnose") }.apply {
                textSize = 11f
                letterSpacing = 0.08f
                setPadding(dp(10), 0, dp(10), 0)
                layoutParams = (layoutParams as LinearLayout.LayoutParams).apply {
                    width = dp(136)
                    height = dp(44)
                    gravity = Gravity.START
                }
            }
        }
        hero.layoutParams = (hero.layoutParams as LinearLayout.LayoutParams).apply { height = dp(364) }
        gap(18)
        addView(LinearLayout(context).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.BOTTOM
            addView(LinearLayout(context).apply {
                orientation = LinearLayout.VERTICAL
                heading("What do you need?", 21f)
                body("Choose a tool to get started").apply { textSize = 13f }
            }, LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1f))
            addView(TextView(context).apply {
                text = "View all tools  ›"
                textSize = 12f
                setTypeface(typeface, Typeface.BOLD)
                setTextColor(ContextCompat.getColor(context, R.color.brand_violet))
                setPadding(dp(8), dp(8), 0, dp(4))
                setOnClickListener { navigate("diagnose") }
            })
        })
        gap(12)
        panel {
            addView(TextView(context).apply {
                text = "+"
                textSize = 30f
                gravity = Gravity.CENTER
                setTextColor(Color.WHITE)
                background = rounded(ContextCompat.getColor(context, R.color.brand_pink), 12)
            }, LinearLayout.LayoutParams(dp(42), dp(42)))
            gap(12)
            section(tr(vm.locale, "start_scan"))
            body("Instant AI insights for your health reports.")
            setOnClickListener { navigate("diagnose") }
        }
        panel {
            addView(ImageView(context).apply {
                setImageResource(R.drawable.ic_chat)
                contentDescription = "Ask MediSeen"
                imageTintList = ContextCompat.getColorStateList(context, R.color.brand_violet)
                background = rounded(ContextCompat.getColor(context, R.color.brand_violet_soft), 12)
                setPadding(dp(9), dp(9), dp(9), dp(9))
            }, LinearLayout.LayoutParams(dp(42), dp(42)))
            section("Ask MediSeen")
            body("Get clear answers to health questions")
            setOnClickListener { navigate("chat") }
        }
        if (AdsRuntime.adsReady) {
            addView(FrameLayout(context).also { host ->
                loadNativeAd(context, host, NativeAdPlacement.Home) { loadBannerAd(context, host, BannerAdPlacement.HomeFallback) }
            })
            gap(14)
        }
        section("Today")
        val manager = getSystemService(SENSOR_SERVICE) as SensorManager
        val sensorAvailable = manager.getDefaultSensor(Sensor.TYPE_STEP_COUNTER) != null
        val activityAllowed = Build.VERSION.SDK_INT < 29 || ContextCompat.checkSelfPermission(this@MainActivity, Manifest.permission.ACTIVITY_RECOGNITION) == PackageManager.PERMISSION_GRANTED
        panel {
            stepsText = section(if (activityAllowed && sensorAvailable) "$currentSteps steps" else "Steps —")
            body(if (!sensorAvailable) "Step sensor unavailable" else if (!activityAllowed) "Activity access needed" else "From this device")
            gap(10)
            caloriesText = body("Estimated calories: ${(currentSteps * 0.04).toInt()} kcal", muted = false)
        }
        if (sensorAvailable && !activityAllowed) secondaryAction("Enable step tracking") { activityPermission.launch(Manifest.permission.ACTIVITY_RECOGNITION) }
        val prefs = getSharedPreferences("mediseen_activity", MODE_PRIVATE)
        val today = LocalDate.now().toString()
        val water = if (prefs.getString("water_date", "") == today) prefs.getInt("water", 0) else 0
        panel {
            section("Hydration")
            body("$water of 8 glasses today")
            action(if (water < 8) "Add a glass" else "Daily goal reached") {
                if (water < 8) prefs.edit().putInt("water", water + 1).putString("water_date", today).apply()
                renderApp()
            }.isEnabled = water < 8
        }
        section("Before you scan")
        panel { body("Use a clear, well-lit image without filters.", muted = false); gap(8); body("AI findings are educational. Review concerns with a qualified clinician.") }
        if (activityAllowed && sensorAvailable) startStepTracking()
    }

    private fun renderChat() {
        screenHost.removeAllViews()
        val root = LayoutInflater.from(this).inflate(R.layout.screen_chat, screenHost, false)
        screenHost.addView(root)
        val messages = root.findViewById<LinearLayout>(R.id.chat_messages)
        val shownMessages = if (vm.chatMessages.isEmpty()) listOf(com.mediseen.app.data.ChatMessage("assistant", "Hello! I am your MediSeen. How can I help you today?")) else vm.chatMessages
        shownMessages.forEachIndexed { index, message ->
            val user = message.role == "user"
            messages.addView(TextView(this).apply {
                text = if (index == 0 && !user) "Hello! I am your MediSeen. How can I help you today?" else message.text
                textSize = 13.5f
                setTextColor(if (user) Color.WHITE else ContextCompat.getColor(context, R.color.ink))
                setPadding(dp(15), dp(12), dp(15), dp(12))
                background = rounded(if (user) ContextCompat.getColor(context, R.color.brand_violet) else Color.WHITE, 16, if (user) null else ContextCompat.getColor(context, R.color.hairline))
                maxWidth = dp(320)
            }, LinearLayout.LayoutParams(ViewGroup.LayoutParams.WRAP_CONTENT, ViewGroup.LayoutParams.WRAP_CONTENT).apply { gravity = if (user) Gravity.END else Gravity.START; bottomMargin = dp(10) })
        }
        if (vm.chatBusy) messages.loading("Thinking…")
        vm.chatError?.let(messages::error)
        val input = root.findViewById<EditText>(R.id.chat_input)
        input.setText(chatDraft)
        input.setSelection(chatDraft.length)
        input.addTextChangedListener(object : android.text.TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) = Unit
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) { chatDraft = s?.toString().orEmpty() }
            override fun afterTextChanged(s: android.text.Editable?) = Unit
        })
        root.findViewById<MaterialButton>(R.id.chat_send).apply {
            isEnabled = !vm.chatBusy
            setOnClickListener { val text = chatDraft; chatDraft = ""; vm.sendChat(text) }
        }
        input.setOnEditorActionListener { _, actionId, _ ->
            if (actionId == android.view.inputmethod.EditorInfo.IME_ACTION_SEND && chatDraft.isNotBlank() && !vm.chatBusy) {
                val text = chatDraft
                chatDraft = ""
                vm.sendChat(text)
                true
            } else false
        }
        root.findViewById<View>(R.id.chat_close).setOnClickListener { navigate(previousRoute.takeIf { it != "chat" } ?: "home") }
        root.findViewById<ScrollView>(R.id.chat_scroll).post { root.findViewById<ScrollView>(R.id.chat_scroll).fullScroll(View.FOCUS_DOWN) }
    }

    private fun renderDiet() = with(contentScreen(R.layout.screen_diet, R.id.diet_content, screenHost)) {
        if (dietAge == "25" && !vm.profile?.age.isNullOrBlank()) dietAge = vm.profile?.age.orEmpty()
        if (vm.dietPrefillCondition.isNotBlank() && dietDisease.isBlank()) dietDisease = vm.dietPrefillCondition
        when (val state = vm.dietState) {
            is LoadState.Success -> renderDietPlan(this, state.value)
            else -> {
                body("♢  NUTRITION ENGINE", muted = false).apply { textSize = 11f; letterSpacing = 0.08f; setTypeface(typeface, Typeface.BOLD); setTextColor(ContextCompat.getColor(context, R.color.brand_violet)) }
                gap(12)
                val nutritionTitle = SpannableString("Your Health & Nutrition").apply {
                    setSpan(ForegroundColorSpan(ContextCompat.getColor(context, R.color.brand_violet)), 12, length, Spanned.SPAN_EXCLUSIVE_EXCLUSIVE)
                }
                heading(nutritionTitle.toString(), 28f).apply { text = nutritionTitle }
                body("Actionable food, lifestyle, and habit plans to help you\nfeel your best.")
                gap(18)
                panel {
                    body("⌕  TARGETED DISEASE", muted = false).apply {
                        textSize = 12f; letterSpacing = 0.09f
                        setTextColor(ContextCompat.getColor(context, R.color.brand_violet))
                        setTypeface(typeface, Typeface.BOLD)
                    }
                    gap(10)
                    input("Target condition", dietDisease) { dietDisease = it }
                    addView(LinearLayout(context).apply {
                        orientation = LinearLayout.HORIZONTAL
                        listOf(
                            Triple("Weight (kg)", dietWeight) { value: String -> dietWeight = value },
                            Triple("Height (cm)", dietHeight) { value: String -> dietHeight = value },
                            Triple("Age", dietAge) { value: String -> dietAge = value },
                        ).forEachIndexed { index, (label, value, changed) ->
                            addView(LinearLayout(context).apply {
                                orientation = LinearLayout.VERTICAL
                                input(label, value, InputType.TYPE_CLASS_NUMBER or InputType.TYPE_NUMBER_FLAG_DECIMAL, onChanged = changed)
                            }, LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1f).apply {
                                if (index > 0) marginStart = dp(7)
                            })
                        }
                    })
                    gap(8)
                    choices("Dietary preferences", listOf("veg", "non-veg"), dietType) { dietType = it }
                    choices("Budget level", listOf("low", "medium", "high"), dietBudget) { dietBudget = it }
                    gap(8)
                    action("↻   CREATE MY PLAN") {
                        val weight = dietWeight.toDoubleOrNull(); val height = dietHeight.toDoubleOrNull(); val age = dietAge.toIntOrNull()
                        if (dietDisease.isNotBlank() && weight != null && weight > 0 && height != null && height > 0 && age != null && age in 1..120) vm.generateDiet(DietInput(dietDisease.trim(), weight, height, age, dietGender, 1.375, dietGoal, dietType, dietBudget))
                        else error("Enter a condition and valid measurements")
                    }.isEnabled = state !is LoadState.Loading
                }
                when (state) { LoadState.Loading -> loading("Building your nutrition plan…"); is LoadState.Error -> error(state.message); else -> Unit }
            }
        }
    }

    private fun renderDietPlan(content: LinearLayout, plan: DietPlan) = with(content) {
        secondaryAction("‹ Edit plan details") { vm.clearDiet() }
        heading("Your nutrition plan")
        body("A practical meal schedule based on the details you provided.")
        gap(16)
        macroCard("Daily target", "${plan.calories.roundToInt()} kcal", ContextCompat.getColor(context, R.color.ink), Color.WHITE)
        macroCard("Protein", "${plan.protein.roundToInt()}g", Color.WHITE, ContextCompat.getColor(context, R.color.positive))
        macroCard("Carbs", "${plan.carbs.roundToInt()}g", Color.WHITE, ContextCompat.getColor(context, R.color.brand_violet))
        macroCard("Fats", "${plan.fats.roundToInt()}g", Color.WHITE, ContextCompat.getColor(context, R.color.brand_pink))
        section("Daily meal schedule")
        plan.meals.forEach { meal -> panel { section("${meal.name.replaceFirstChar(Char::uppercase)}  ·  ${meal.calories.roundToInt()} kcal"); meal.items.forEach(::bullet) } }
        if (plan.recommended.isNotEmpty()) panel(0xFFE8F8F2.toInt()) { section("Recommended foods"); plan.recommended.forEach(::bullet) }
        if (plan.avoid.isNotEmpty()) panel(ContextCompat.getColor(context, R.color.brand_pink_soft)) { section("Foods to limit"); plan.avoid.forEach(::bullet) }
        action("Create grocery list") { vm.loadGroceryList(plan) }
        when (val groceries = vm.groceryState) {
            LoadState.Loading -> loading("Preparing grocery list…")
            is LoadState.Error -> error(groceries.message)
            is LoadState.Success -> panel { section("Grocery list"); groceries.value.forEach(::bullet) }
            else -> Unit
        }
        if (AdsRuntime.adsReady) {
            addView(FrameLayout(context).also { loadNativeAd(context, it, NativeAdPlacement.DietPlan) })
            gap(14)
        }
        body("This plan is general guidance. Check food changes with your clinician if you have a medical condition.")
    }

    private fun LinearLayout.macroCard(label: String, value: String, background: Int, accent: Int) {
        panel(background) {
            body(label.uppercase(), muted = false).apply { textSize = 12f; letterSpacing = 0.08f; setTypeface(typeface, Typeface.BOLD); setTextColor(accent) }
            gap(8)
            heading(value, 32f).setTextColor(if (background == ContextCompat.getColor(context, R.color.ink)) Color.WHITE else ContextCompat.getColor(context, R.color.ink))
        }
    }

    private fun renderLibrary() = with(contentScreen(R.layout.screen_library, R.id.library_content, screenHost)) {
        when (val state = vm.libraryState) {
            is LoadState.Success -> renderMedicalContext(this, state.value)
            else -> {
                body("▣  HEALTH KNOWLEDGE BASE", muted = false).apply { gravity = Gravity.CENTER; textSize = 11f; setTypeface(typeface, Typeface.BOLD); setTextColor(ContextCompat.getColor(context, R.color.brand_violet)) }
                gap(14)
                heading(tr(vm.locale, "library_title"), 28f).apply { gravity = Gravity.CENTER }
                gap(10)
                body("Search conditions or use our quick-access health\nshortcuts.").apply { gravity = Gravity.CENTER; textSize = 16f }
                gap(24)
                input("Search symptoms or conditions", libraryQuery) { libraryQuery = it }.apply {
                    isSingleLine = true
                    imeOptions = android.view.inputmethod.EditorInfo.IME_ACTION_SEARCH
                    setOnEditorActionListener { _, actionId, _ ->
                        if (actionId == android.view.inputmethod.EditorInfo.IME_ACTION_SEARCH && libraryQuery.isNotBlank() && state !is LoadState.Loading) {
                            vm.searchLibrary(libraryQuery)
                            true
                        } else false
                    }
                }
                gap(16)
                addView(LinearLayout(context).apply {
                    orientation = LinearLayout.HORIZONTAL
                    addView(TextView(context).apply { text = "HEALTH SHORTCUTS"; textSize = 11f; letterSpacing = 0.08f; setTypeface(typeface, Typeface.BOLD); setTextColor(ContextCompat.getColor(context, R.color.muted_ink)) }, LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1f))
                    addView(TextView(context).apply { text = "8 CURATED CONDITIONS"; textSize = 9f; setTextColor(ContextCompat.getColor(context, R.color.quiet_ink)) })
                })
                gap(14)
                val topicIcons = mapOf("Diabetes" to "🩸", "PCOS" to "🧬", "Hypertension" to "💗", "Acidity" to "🍋", "Anemia" to "🩸", "Obesity" to "⚖", "Thyroid" to "♢", "IBS" to "◉")
                listOf("Diabetes", "PCOS", "Hypertension", "Acidity", "Anemia", "Obesity", "Thyroid", "IBS").chunked(2).forEachIndexed { rowIndex, topics ->
                    addView(LinearLayout(context).apply {
                        orientation = LinearLayout.HORIZONTAL
                        topics.forEachIndexed { column, topic ->
                            val card = panel {
                                addView(TextView(context).apply {
                                    text = topicIcons[topic]
                                    textSize = 21f
                                    gravity = Gravity.CENTER
                                    background = rounded(ContextCompat.getColor(context, if (column == 0) R.color.brand_pink_soft else R.color.brand_violet_soft), 12)
                                }, LinearLayout.LayoutParams(dp(38), dp(38)))
                                gap(10)
                                section(topic)
                                gap(10)
                                body("VIEW DATA  ›", muted = false).apply {
                                    textSize = 12f; letterSpacing = 0.04f
                                    setTextColor(ContextCompat.getColor(context, R.color.muted_ink))
                                    setTypeface(typeface, Typeface.BOLD)
                                }
                                setOnClickListener { libraryQuery = topic; vm.searchLibrary(topic) }
                            }
                            card.layoutParams = LinearLayout.LayoutParams(0, dp(122), 1f).apply {
                                bottomMargin = dp(14)
                                if (column > 0) marginStart = dp(10)
                            }
                        }
                    })
                    if (rowIndex == 2 && AdsRuntime.adsReady) {
                        addView(FrameLayout(context).also { loadNativeAd(context, it, NativeAdPlacement.LibraryFeed) })
                        gap(14)
                    }
                }
                when (state) {
                    LoadState.Loading -> loading("Loading medical context…")
                    is LoadState.Error -> error(state.message)
                    LoadState.Idle -> panel(ContextCompat.getColor(context, R.color.brand_blue_soft)) { section("Choose a condition to explore"); body("Search above or use a quick topic.") }
                    else -> Unit
                }
            }
        }
    }

    private fun renderMedicalContext(content: LinearLayout, medical: MedicalContext) = with(content) {
        if (AdsRuntime.adsReady) LibraryCompletionInterstitial.preload(this@MainActivity)
        panel(Color.TRANSPARENT) {
            background = ContextCompat.getDrawable(context, R.drawable.hero_gradient)
            body("✣  VERIFIED HEALTH DATA", muted = false).apply { textSize = 10f; letterSpacing = 0.08f; setTextColor(0xFFE6DCF9.toInt()) }
            gap(16)
            heading(medical.name, 30f).setTextColor(Color.WHITE)
            gap(10)
            body(medical.overview.ifBlank { "Comprehensive therapeutic overview and management guidance." }, muted = false).setTextColor(0xFFE5E7F1.toInt())
        }
        if (medical.symptoms.isNotEmpty()) panel { section("⚠  Symptoms"); medical.symptoms.forEach { item -> body("•  $item", muted = false).apply { background = rounded(ContextCompat.getColor(context, R.color.surface_subtle), 10); setPadding(dp(12), dp(10), dp(12), dp(10)) }; gap(6) } }
        if (medical.precautions.isNotEmpty()) panel { section("♢  Precautions"); medical.precautions.forEach { item -> body("›  $item", muted = false).apply { background = rounded(0xFFF3FCF9.toInt(), 10); setPadding(dp(12), dp(10), dp(12), dp(10)) }; gap(6) } }
        panel(ContextCompat.getColor(context, R.color.brand_violet)) {
            heading("Nutrition Strategy").setTextColor(Color.WHITE)
            if (medical.recommended.isNotEmpty()) { body("THERAPEUTIC FAVORITES", muted = false).setTextColor(Color.WHITE); medical.recommended.forEach { bullet(it, Color.WHITE) } }
            if (medical.avoid.isNotEmpty()) { gap(8); body("STRICTLY AVOID", muted = false).setTextColor(Color.WHITE); medical.avoid.forEach { bullet(it, Color.WHITE) } }
            gap(14)
            secondaryAction("GENERATE PERSONALIZED DIET PLAN  →") { vm.setDietPrefill(medical.name); navigate("diet") }
        }
        addView(topAction("CLEAR RESULTS & SEARCH AGAIN") { completeLibraryArticle() }, LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, dp(48)))
        if (AdsRuntime.adsReady) {
            gap(14)
            addView(FrameLayout(context).also { loadNativeAd(context, it, NativeAdPlacement.LibraryDetail) })
        }
    }

    private fun completeLibraryArticle() {
        if (BuildConfig.ADS_ENABLED) {
            LibraryCompletionInterstitial.onArticleCompleted(this) { vm.clearLibrary() }
        } else {
            vm.clearLibrary()
        }
    }

    private fun renderDiagnose() = with(contentScreen(R.layout.screen_diagnose, R.id.diagnose_content, screenHost)) {
        val resultState = vm.diagnosisState
        if (pendingScanConsumption && resultState is LoadState.Success) { ScanAccess.consumeScan(this@MainActivity); pendingScanConsumption = false }
        else if (pendingScanConsumption && resultState is LoadState.Error) pendingScanConsumption = false

        val scanTitle = SpannableString("HEALTH ASISTANT").apply {
            setSpan(ForegroundColorSpan(ContextCompat.getColor(context, R.color.brand_pink)), 7, length, Spanned.SPAN_EXCLUSIVE_EXCLUSIVE)
        }
        heading(scanTitle.toString(), 25f).apply { text = scanTitle }
        body("Upload your health scan, and our assistant will help you understand it in\nseconds.")
        gap(16)
        renderDiagnoseTabs()

        if (diagnoseTab == "activity") {
            renderScanActivity()
            return@with
        }

        if (resultState is LoadState.Success) {
            if (vm.diagnosisContextState == LoadState.Idle) vm.loadDiagnosisContext(resultState.value.disease)
            renderDiagnosisResult(this, resultState.value)
            return@with
        }

        renderScanStepper()
        when (diagnoseStep) {
            1 -> renderUploadStep()
            2 -> renderSymptomsStep()
            else -> renderReviewStep(resultState)
        }
    }

    private fun LinearLayout.renderDiagnoseTabs() {
        addView(LinearLayout(context).apply {
            orientation = LinearLayout.HORIZONTAL
            val scan = secondaryAction(tr(vm.locale, "scan_report")) { diagnoseTab = "scan"; renderApp() }
            scan.contentDescription = "Open scan report workflow"
            scan.layoutParams = LinearLayout.LayoutParams(0, dp(48), 1f).apply { marginEnd = dp(8) }
            val activity = secondaryAction(tr(vm.locale, "activity")) { diagnoseTab = "activity"; renderApp() }
            activity.contentDescription = "Open daily activity"
            activity.layoutParams = LinearLayout.LayoutParams(0, dp(48), 1f)
            val active = if (diagnoseTab == "scan") scan else activity
            active.setTextColor(Color.WHITE)
            active.background = context.rounded(Color.BLACK, 16)
        })
        gap(18)
    }

    private fun LinearLayout.renderScanStepper() {
        panel {
            addView(LinearLayout(context).apply {
                orientation = LinearLayout.HORIZONTAL
                gravity = Gravity.CENTER_VERTICAL
                (1..3).forEach { step ->
                    addView(TextView(context).apply {
                        text = step.toString()
                        gravity = Gravity.CENTER
                        textSize = 15f
                        setTypeface(typeface, Typeface.BOLD)
                        setTextColor(if (step == diagnoseStep) Color.WHITE else ContextCompat.getColor(context, R.color.muted_ink))
                        background = context.rounded(if (step == diagnoseStep) Color.BLACK else ContextCompat.getColor(context, R.color.surface_subtle), 14)
                        contentDescription = "Step $step of 3${if (step == diagnoseStep) ", current" else ""}"
                    }, LinearLayout.LayoutParams(dp(38), dp(38)))
                    if (step < 3) addView(TextView(context).apply {
                        text = "›"; gravity = Gravity.CENTER; textSize = 24f
                        setTextColor(ContextCompat.getColor(context, R.color.quiet_ink))
                    }, LinearLayout.LayoutParams(0, dp(38), 1f))
                }
            })
        }
    }

    private fun LinearLayout.renderUploadStep() {
        panel {
            section("1. UPLOAD REPORT")
            body("SELECT YOUR HEALTH IMAGE OR SCAN").apply { textSize = 11f; letterSpacing = 0.08f }
            gap(24)
            addView(LinearLayout(context).apply {
                orientation = LinearLayout.VERTICAL
                gravity = Gravity.CENTER
                background = context.rounded(ContextCompat.getColor(context, R.color.surface_subtle), 16, ContextCompat.getColor(context, R.color.hairline))
                addView(ImageView(context).apply {
                    contentDescription = if (diagnoseImage == null) "Upload health image" else "Selected health image"
                    if (diagnoseImage != null) load(diagnoseImage) else setImageResource(android.R.drawable.stat_sys_upload)
                    imageTintList = ContextCompat.getColorStateList(context, R.color.quiet_ink)
                    background = rounded(Color.WHITE, 28)
                    setPadding(dp(12), dp(12), dp(12), dp(12))
                }, LinearLayout.LayoutParams(dp(52), dp(52)))
                gap(14)
                body(if (diagnoseImage == null) "Tap to browse or take a photo" else "Image selected — tap to replace", muted = false).apply { gravity = Gravity.CENTER; setTypeface(typeface, Typeface.BOLD) }
                gap(8)
                body("PNG, JPG OR HEIC").apply { gravity = Gravity.CENTER; textSize = 11f; letterSpacing = 0.12f }
                setOnClickListener {
                    MaterialAlertDialogBuilder(this@MainActivity).setItems(arrayOf("Choose from gallery", "Take a photo")) { _, which ->
                        if (which == 0) galleryPicker.launch("image/*")
                        else if (ContextCompat.checkSelfPermission(this@MainActivity, Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED) launchCamera()
                        else cameraPermission.launch(Manifest.permission.CAMERA)
                    }.show()
                }
            }, LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, dp(220)))
            gap(24)
            body("2. DESCRIBE SYMPTOMS").apply { textSize = 12f; letterSpacing = 0.08f; setTypeface(typeface, Typeface.BOLD) }
        }
        if (diagnoseImage != null) action("Continue to symptoms") { diagnoseStep = 2; renderApp() }
        if (showHistory) {
            if (vm.diagnosisHistory.isEmpty()) panel(ContextCompat.getColor(context, R.color.brand_blue_soft)) { body("Your previous scans will appear here after your first analysis.") }
            vm.diagnosisHistory.forEach { item -> panel { section(item.disease); body("Confidence ${(item.confidence * if (item.confidence <= 1) 100 else 1).toInt()}%", muted = false); body(item.summary) } }
        }
    }

    private fun LinearLayout.renderSymptomsStep() {
        panel {
            section("2. Describe symptoms")
            body("Add optional symptoms or context to help explain the image.")
            gap(12)
            input("Symptoms or context", diagnoseSymptoms, maxLines = 5) { diagnoseSymptoms = it.take(2000) }
            body("${diagnoseSymptoms.length} / 2000 characters")
        }
        action("Review scan") { diagnoseStep = 3; renderApp() }
        secondaryAction("Back to upload") { diagnoseStep = 1; renderApp() }
    }

    private fun LinearLayout.renderReviewStep(resultState: LoadState<DiagnosisResult>) {
        panel {
            section("3. Review and analyze")
            body("Image selected")
            body(if (diagnoseSymptoms.isBlank()) "No symptoms added" else diagnoseSymptoms, muted = false)
            gap(10)
            body("AI findings are educational and are not a medical diagnosis.")
        }
        val scanAvailable = !BuildConfig.ADS_ENABLED || ScanAccess.hasAvailableScan(this@MainActivity)
        if (BuildConfig.ADS_ENABLED && AdsRuntime.adsReady) RewardedScanAd.preload(this@MainActivity)
        action(if (scanAvailable) "Analyze image" else "Watch ad to unlock 1 scan") {
            val selected = diagnoseImage ?: return@action
            if (scanAvailable) {
                rewardMessage = null
                pendingScanConsumption = true
                vm.diagnose(DiagnoseInput(selected, diagnoseSymptoms, vm.locale))
            } else RewardedScanAd.show(this@MainActivity,
                onClosed = { earned -> rewardMessage = if (earned) "One scan unlocked. Tap Analyze image when you're ready." else "Finish the rewarded ad to unlock a scan."; renderApp() },
                onUnavailable = { rewardMessage = "A reward ad isn't ready yet. Please try again shortly."; renderApp() })
        }.isEnabled = diagnoseImage != null && resultState !is LoadState.Loading
        secondaryAction("Back to symptoms") { diagnoseStep = 2; renderApp() }
        rewardMessage?.let(::body)
        when (resultState) { LoadState.Loading -> loading("Analyzing your image…"); is LoadState.Error -> { error(resultState.message); secondaryAction("Try again") { vm.clearDiagnosis(); renderApp() } }; else -> Unit }
    }

    private fun LinearLayout.renderScanActivity() {
        section("Today's activity")
        body("Activity is processed on this device and can be enabled or disabled at any time.")
        gap(14)
        val manager = getSystemService(SENSOR_SERVICE) as SensorManager
        val sensorAvailable = manager.getDefaultSensor(Sensor.TYPE_STEP_COUNTER) != null
        val activityAllowed = Build.VERSION.SDK_INT < 29 || ContextCompat.checkSelfPermission(this@MainActivity, Manifest.permission.ACTIVITY_RECOGNITION) == PackageManager.PERMISSION_GRANTED
        panel(ContextCompat.getColor(context, R.color.ink)) {
            body("DAILY STEPS", muted = false).setTextColor(0xFFCDD5E7.toInt())
            stepsText = heading(if (activityAllowed && sensorAvailable) currentSteps.toString() else "—", 34f).apply { setTextColor(Color.WHITE) }
            body(if (!sensorAvailable) "Step sensor unavailable" else if (!activityAllowed) "Activity access needed" else "Estimated ${(currentSteps * 0.04).toInt()} kcal", muted = false).setTextColor(Color.WHITE)
        }
        if (sensorAvailable && !activityAllowed) action("Enable activity access") { activityPermission.launch(Manifest.permission.ACTIVITY_RECOGNITION) }
        panel { section("Scan history"); body("Review completed analyses from the Scan report tab."); secondaryAction("Open scan history") { diagnoseTab = "scan"; diagnoseStep = 1; showHistory = true; vm.loadHistory(); renderApp() } }
        if (activityAllowed && sensorAvailable) startStepTracking()
    }

    private fun renderDiagnosisResult(content: LinearLayout, result: DiagnosisResult) = with(content) {
        secondaryAction("‹ New scan") { vm.clearDiagnosis(); diagnoseImage = null; diagnoseSymptoms = ""; diagnoseStep = 1 }
        val confidence = (result.confidence * if (result.confidence <= 1) 100 else 1).coerceIn(0.0, 100.0).toInt()
        panel(ContextCompat.getColor(context, R.color.ink)) { body("SCAN OUTCOME", muted = false).setTextColor(0xFFCDD5E7.toInt()); heading(result.disease, 28f).setTextColor(Color.WHITE); body("Model confidence $confidence%", muted = false).setTextColor(0xFFE5E7F1.toInt()) }
        panel { section("What the scan suggests"); body(result.explanation.ifBlank { "No explanation was returned for this scan." }) }
        if (result.likelySymptoms.isNotEmpty()) panel(0xFFE8F8F2.toInt()) { section("Symptom markers"); result.likelySymptoms.forEach(::bullet) }
        val medical = (vm.diagnosisContextState as? LoadState.Success)?.value
        if (medical != null && medical.recommended.isNotEmpty()) panel(0xFFE8F8F2.toInt()) { section("Recommended foods"); medical.recommended.forEach(::bullet) }
        if (medical != null && medical.avoid.isNotEmpty()) panel(ContextCompat.getColor(context, R.color.brand_pink_soft)) { section("Foods to limit"); medical.avoid.forEach(::bullet) }
        if (result.rootCause.isNotBlank()) panel { section("Clinical explanation"); body(result.rootCause) }
        if (result.managementSteps.isNotEmpty()) panel { section("Suggested next steps"); result.managementSteps.forEachIndexed { index, step -> bullet("${index + 1}. $step") } }
        result.heatmapUrl?.let { url -> panel { section("Visual explanation"); addView(ImageView(context).apply { contentDescription = "AI heatmap"; scaleType = ImageView.ScaleType.CENTER_INSIDE; load(url) }, LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, dp(250))) } }
        result.reportUrl?.let { url -> secondaryAction("Open full report") { startActivity(Intent(Intent.ACTION_VIEW, url.toUri())) } }
        panel(ContextCompat.getColor(context, R.color.brand_pink_soft)) { body("This AI result is educational and is not a medical diagnosis. Seek qualified medical advice before changing care.", muted = false) }
        action("Start a new scan") { vm.clearDiagnosis(); diagnoseImage = null; diagnoseSymptoms = ""; diagnoseStep = 1 }
    }

    private fun renderProfile() = with(contentScreen(R.layout.screen_profile, R.id.profile_content, screenHost)) {
        panel {
            addView(LinearLayout(context).apply {
                orientation = LinearLayout.HORIZONTAL
                section("Profile Information")
                addView(View(context), LinearLayout.LayoutParams(0, 1, 1f))
                addView(TextView(context).apply { text = if (profileExpanded) "⌄" else "›"; textSize = 24f; setTextColor(ContextCompat.getColor(context, R.color.quiet_ink)) })
            })
            body(if (profileExpanded) "Update your name, age, and gender." else "Tap to change your profile details.")
            gap(16)
            if (!profileExpanded) {
                addView(LinearLayout(context).apply {
                    orientation = LinearLayout.HORIZONTAL
                    gravity = Gravity.CENTER_VERTICAL
                    background = rounded(ContextCompat.getColor(context, R.color.surface_subtle), 14)
                    setPadding(dp(14), dp(12), dp(12), dp(12))
                    addView(LinearLayout(context).apply { orientation = LinearLayout.VERTICAL; section(vm.profile?.name?.ifBlank { "Guest" } ?: "Guest").apply { textSize = 14f }; body("Open the dropdown to edit your\nprofile.").apply { textSize = 12f } }, LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1f))
                    addView(TextView(context).apply { text = "CHANGE\nPROFILE"; contentDescription = "Change profile"; gravity = Gravity.CENTER; textSize = 11f; letterSpacing = 0.08f; setTypeface(typeface, Typeface.BOLD); setTextColor(Color.WHITE); background = rounded(ContextCompat.getColor(context, R.color.navy), 12); setOnClickListener { profileExpanded = true; profileDraftInitialized = false; renderApp() } }, LinearLayout.LayoutParams(dp(108), dp(48)))
                })
            } else {
                if (!profileDraftInitialized) { profileName = vm.profile?.name ?: "Guest"; profileAge = vm.profile?.age.orEmpty(); profileGender = vm.profile?.gender ?: "prefer_not_to_say"; profileDraftInitialized = true }
                input("FULL NAME", profileName) { profileName = it }
                input("AGE", profileAge, InputType.TYPE_CLASS_NUMBER) { profileAge = it.filter(Char::isDigit).take(3) }
                choices("GENDER", listOf("male", "female", "other", "prefer_not_to_say"), profileGender) { profileGender = it }
                action("▣  Save Profile") {
                    val age = profileAge.toIntOrNull()
                    if (profileName.isNotBlank() && age != null && age in 1..120) { vm.saveProfile(UserProfile(name = profileName.trim(), age = profileAge, gender = profileGender, language = vm.locale)); profileExpanded = false }
                }
            }
        }
        panel {
            orientation = LinearLayout.HORIZONTAL; gravity = Gravity.CENTER_VERTICAL
            addView(ImageView(context).apply { setImageResource(R.drawable.ic_language); imageTintList = ContextCompat.getColorStateList(context, R.color.brand_violet); background = rounded(ContextCompat.getColor(context, R.color.brand_violet_soft), 12); setPadding(dp(9), dp(9), dp(9), dp(9)) }, LinearLayout.LayoutParams(dp(38), dp(38)))
            addView(LinearLayout(context).apply { orientation = LinearLayout.VERTICAL; setPadding(dp(12), 0, 0, 0); section(tr(vm.locale, "language")).apply { textSize = 15f }; body(supportedLanguages.firstOrNull { it.code == vm.locale }?.name ?: vm.locale).apply { textSize = 12f } }, LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1f))
            addView(TextView(context).apply { text = "›"; textSize = 24f; setTextColor(ContextCompat.getColor(context, R.color.quiet_ink)) })
            setOnClickListener { showLanguageMenu(headerLanguage) }
        }
        panel {
            section("Legal & Support")
            gap(12)
            body("Terms and Conditions\nRead our service agreement        ›", muted = false).apply { contentDescription = "Terms and Conditions"; background = rounded(ContextCompat.getColor(context, R.color.surface_subtle), 12); setPadding(dp(12), dp(10), dp(12), dp(10)); setOnClickListener { navigate("terms") } }
            gap(10)
            body("Privacy Policy\nHow we handle your data           ›", muted = false).apply { background = rounded(ContextCompat.getColor(context, R.color.surface_subtle), 12); setPadding(dp(12), dp(10), dp(12), dp(10)); setOnClickListener { navigate("privacy") } }
        }
        if (AdsRuntime.privacyOptionsRequired) panel { section("Ad privacy choices"); body("Review advertising consent choices"); setOnClickListener { AdsRuntime.showPrivacyOptions(this@MainActivity) } }
        section(tr(vm.locale, "account"))
        if (vm.profile?.uid?.startsWith("guest_") == true) secondaryAction("Login / Sign up") { vm.logout() }
        else {
            secondaryAction("Sign out") { vm.logout() }
            secondaryAction("Delete account") {
                MaterialAlertDialogBuilder(this@MainActivity).setTitle("Delete account?").setMessage("This permanently removes your account and stored health data. This action cannot be undone.").setNegativeButton("Cancel", null).setPositiveButton("Delete permanently") { _, _ -> vm.deleteAccount() }.show()
            }
        }
    }

    private fun renderPrivacy() = with(contentScreen(R.layout.screen_legal, R.id.legal_content, screenHost)) {
        secondaryAction("‹ Back") { navigate("profile") }
        heading(tr(vm.locale, "privacy")); body("Your health information deserves careful handling."); gap(16)
        panel { section("What the app accesses"); body("Camera and photos are accessed only when you choose an image. Activity access is used for the on-device step counter. Notification access is optional.") }
        panel { section("How analysis works"); body("Selected images and the symptoms you enter are sent securely to the Mediseen Python API for analysis. Signed-in results may be stored in your account history.") }
        panel { section("Your control"); body("You can use guest mode, deny optional permissions, sign out, or permanently delete your account and stored cloud records from the profile screen.") }
        panel { section("Medical disclaimer"); body("Mediseen provides educational information and AI-assisted observations. It does not replace diagnosis, treatment, or emergency services from qualified professionals.") }
        secondaryAction("View full privacy policy") { startActivity(Intent(Intent.ACTION_VIEW, Uri.parse("https://sites.google.com/view/sapappsolutionmediseenpolicy/home"))) }
    }

    private fun renderTerms() = with(contentScreen(R.layout.screen_legal, R.id.legal_content, screenHost)) {
        secondaryAction("‹ Back") { navigate("profile") }
        heading(tr(vm.locale, "terms"))
        body("The terms for using MediSeen's educational health tools.")
        gap(16)
        panel { section("Educational use"); body("MediSeen provides AI-assisted educational information and does not diagnose, prescribe, or replace professional medical care.") }
        panel { section("Your responsibility"); body("Use clear, lawful images that you are permitted to upload. Seek emergency services for urgent symptoms and qualified clinical advice before changing treatment.") }
        panel { section("Account and data"); body("You are responsible for keeping your sign-in details secure. You may use guest mode, sign out, or delete your signed-in account from Profile.") }
        panel { section("Service availability"); body("Network services and AI results may occasionally be delayed or unavailable. Retry later if a request cannot be completed.") }
        secondaryAction("View complete terms online") { startActivity(Intent(Intent.ACTION_VIEW, Uri.parse("https://sites.google.com/view/sapappsolutionmediseenpolicy/home"))) }
    }

    private fun showLanguageMenu(anchor: View) {
        val root = LayoutInflater.from(this).inflate(R.layout.popup_language, screenHost, false)
        val content = root.findViewById<LinearLayout>(R.id.language_popup_content)
        lateinit var popup: PopupWindow
        supportedLanguages.forEach { language ->
            val active = language.code == vm.locale
            content.addView(LinearLayout(this).apply {
                orientation = LinearLayout.HORIZONTAL
                gravity = Gravity.CENTER_VERTICAL
                minimumHeight = dp(40)
                setPadding(dp(8), dp(4), dp(8), dp(4))
                background = rounded(if (active) ContextCompat.getColor(context, R.color.navy) else Color.WHITE, 14)
                contentDescription = "${language.name}${if (active) ", selected" else ""}"
                isSelected = active
                val flag = flagForLanguage(language.code)
                if (flag != 0) addView(ImageView(context).apply {
                    setImageResource(flag); scaleType = ImageView.ScaleType.CENTER_CROP
                    contentDescription = null
                }, LinearLayout.LayoutParams(dp(20), dp(20)))
                addView(TextView(context).apply {
                    text = language.nativeName
                    textSize = 13f
                    setTypeface(typeface, if (active) Typeface.BOLD else Typeface.NORMAL)
                    setTextColor(if (active) Color.WHITE else ContextCompat.getColor(context, R.color.ink))
                    setPadding(dp(12), 0, dp(8), 0)
                }, LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1f))
                if (active) addView(TextView(context).apply { text = "•"; textSize = 22f; setTextColor(ContextCompat.getColor(context, R.color.brand_pink)) })
                setOnClickListener { vm.updateLanguage(language.code); popup.dismiss() }
            }, LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, dp(42)).apply { bottomMargin = dp(2) })
        }
        popup = PopupWindow(root, dp(148), dp(430), true).apply {
            setBackgroundDrawable(ColorDrawable(Color.WHITE))
            isOutsideTouchable = true
            elevation = dp(10).toFloat()
            showAsDropDown(anchor, -dp(112), dp(4))
        }
    }

    private fun flagForLanguage(code: String): Int = when (code) {
        "en" -> R.drawable.flag_en
        "hi" -> R.drawable.flag_hi
        "es" -> R.drawable.flag_es
        "fr" -> R.drawable.flag_fr
        "ar" -> R.drawable.flag_ar
        "te" -> R.drawable.flag_te
        else -> 0
    }

    private fun topAction(label: String, onClick: () -> Unit): TextView = TextView(this).apply {
        text = label
        textSize = 15f
        gravity = Gravity.CENTER
        setTextColor(ContextCompat.getColor(context, R.color.brand_violet))
        setTypeface(typeface, Typeface.BOLD)
        setPadding(dp(14), 0, dp(14), 0)
        minHeight = dp(48)
        minWidth = dp(64)
        background = ContextCompat.getDrawable(context, android.R.drawable.list_selector_background)
        setOnClickListener { onClick() }
    }

    private fun showLanguageDialog() {
        MaterialAlertDialogBuilder(this).setTitle("Choose language").setItems(supportedLanguages.map { it.nativeName }.toTypedArray()) { _, which -> vm.updateLanguage(supportedLanguages[which].code) }.show()
    }

    private fun launchCamera() {
        val file = File.createTempFile("mediseen_", ".jpg", File(cacheDir, "camera").apply { mkdirs() })
        val output = androidx.core.content.FileProvider.getUriForFile(this, "$packageName.fileprovider", file)
        cameraImage = output
        cameraCapture.launch(output)
    }

    private fun handleBack() {
        when {
            vm.stage == AppStage.NOTIFICATION -> vm.returnToLanguage()
            vm.stage == AppStage.ONBOARDING && onboardingPage > 0 -> { onboardingPage--; renderApp() }
            vm.stage == AppStage.PROFILE && returningFromProfileEdit -> {
                profileDraftInitialized = false
                vm.cancelProfileEdit()
            }
            vm.stage != AppStage.MAIN -> finish()
            route in setOf("privacy", "terms") -> navigate("profile")
            route == "library" && vm.libraryState is LoadState.Success -> completeLibraryArticle()
            route == "diet" && vm.dietState is LoadState.Success -> vm.clearDiet()
            route == "diagnose" && vm.diagnosisState is LoadState.Success -> {
                vm.clearDiagnosis(); diagnoseImage = null; diagnoseSymptoms = ""; diagnoseStep = 1
            }
            route == "diagnose" && diagnoseTab == "activity" -> { diagnoseTab = "scan"; renderApp() }
            route == "diagnose" && diagnoseStep > 1 -> { diagnoseStep--; renderApp() }
            route == "chat" -> navigate(previousRoute.takeIf { it != "chat" } ?: "home")
            route == "profile" && profileExpanded -> { profileExpanded = false; renderApp() }
            route != "home" -> navigate("home")
            else -> finish()
        }
    }

    private fun startStepTracking() {
        if (Build.VERSION.SDK_INT >= 29 && ContextCompat.checkSelfPermission(this, Manifest.permission.ACTIVITY_RECOGNITION) != PackageManager.PERMISSION_GRANTED) return
        val manager = getSystemService(SENSOR_SERVICE) as SensorManager
        val sensor = manager.getDefaultSensor(Sensor.TYPE_STEP_COUNTER) ?: return
        sensorManager = manager
        manager.unregisterListener(this)
        manager.registerListener(this, sensor, SensorManager.SENSOR_DELAY_NORMAL)
    }

    private fun stopStepTracking() { sensorManager?.unregisterListener(this) }

    override fun onSensorChanged(event: SensorEvent) {
        val total = event.values.firstOrNull()?.toInt() ?: return
        val prefs = getSharedPreferences("mediseen_activity", MODE_PRIVATE)
        val today = LocalDate.now().toString()
        var baseline = prefs.getInt("step_baseline", -1)
        if (baseline < 0 || total < baseline || prefs.getString("step_date", "") != today) {
            baseline = total
            prefs.edit().putInt("step_baseline", baseline).putString("step_date", today).apply()
        }
        val steps = max(0, total - baseline)
        if (steps != currentSteps) {
            currentSteps = steps
            if (route == "home") {
                stepsText?.text = "$currentSteps steps"
                caloriesText?.text = "Estimated calories: ${(currentSteps * 0.04).toInt()} kcal"
            }
        }
    }

    override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) = Unit
}
