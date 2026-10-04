package com.mediseen.app

import android.app.Application
import android.os.Looper
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.viewModelScope
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.GoogleAuthProvider
import com.google.firebase.firestore.FirebaseFirestore
import com.mediseen.app.data.ApiClient
import com.mediseen.app.data.ChatMessage
import com.mediseen.app.data.DiagnoseInput
import com.mediseen.app.data.DiagnosisResult
import com.mediseen.app.data.DietInput
import com.mediseen.app.data.DietPlan
import com.mediseen.app.data.LoadState
import com.mediseen.app.data.MedicalContext
import com.mediseen.app.data.ScanHistoryItem
import com.mediseen.app.data.UserProfile
import kotlinx.coroutines.launch
import org.json.JSONArray
import org.json.JSONObject
import java.time.Instant
import java.util.UUID
import java.util.concurrent.atomic.AtomicLong

enum class AppStage { WELCOME, LANGUAGE, NOTIFICATION, ONBOARDING, AUTH, PROFILE, MAIN }

class AppViewModel(application: Application) : AndroidViewModel(application) {
    private val prefs = application.getSharedPreferences("mediseen_native", 0)
    private val auth = FirebaseAuth.getInstance()
    private val api = ApiClient(application.contentResolver)

    private val revision = AtomicLong(0L)
    private val _changes = MutableLiveData(0L)
    val changes: LiveData<Long> = _changes

    private fun notifyChanged() {
        val nextRevision = revision.incrementAndGet()
        if (Looper.myLooper() == Looper.getMainLooper()) _changes.value = nextRevision
        else _changes.postValue(nextRevision)
    }

    var stage = initialStage()
        private set(value) { field = value; notifyChanged() }
    var locale = prefs.getString("locale", "en") ?: "en"
        private set(value) { field = value; notifyChanged() }
    var profile: UserProfile? = null
        private set(value) { field = value; notifyChanged() }
    var authBusy = false
        private set(value) { field = value; notifyChanged() }
    var authError: String? = null
        private set(value) { field = value; notifyChanged() }

    fun clearAuthError() {
        if (authError != null) authError = null
    }
    var diagnosisState: LoadState<DiagnosisResult> = LoadState.Idle
        private set(value) { field = value; notifyChanged() }
    var diagnosisContextState: LoadState<MedicalContext> = LoadState.Idle
        private set(value) { field = value; notifyChanged() }
    var dietState: LoadState<DietPlan> = LoadState.Idle
        private set(value) { field = value; notifyChanged() }
    var groceryState: LoadState<List<String>> = LoadState.Idle
        private set(value) { field = value; notifyChanged() }
    var libraryState: LoadState<MedicalContext> = LoadState.Idle
        private set(value) { field = value; notifyChanged() }
    var dietPrefillCondition = ""
        private set(value) { field = value; notifyChanged() }
    var chatBusy = false
        private set(value) { field = value; notifyChanged() }
    var chatError: String? = null
        private set(value) { field = value; notifyChanged() }
    val chatMessages = mutableListOf(
        ChatMessage("assistant", "Hello! I’m Mediseen. Ask me a health question and I’ll explain it in plain language."),
    )
    val diagnosisHistory = mutableListOf<ScanHistoryItem>()

    init {
        if (stage == AppStage.MAIN) enterMainApp()
    }

    private fun initialStage(): AppStage = AppEntryPolicy.initialStage(
        welcomeComplete = prefs.getBoolean("welcome_complete", false),
        languageComplete = prefs.getBoolean("language_complete", false),
        notificationComplete = prefs.getBoolean("notification_complete", false),
        onboardingComplete = prefs.getBoolean("onboarding_complete", false),
    )

    fun finishWelcome() {
        prefs.edit().putBoolean("welcome_complete", true).apply()
        stage = AppStage.LANGUAGE
    }

    fun selectLanguage(code: String) {
        locale = code
        prefs.edit().putString("locale", code).putBoolean("language_complete", true).apply()
        if (prefs.getBoolean("onboarding_complete", false)) enterMainApp() else stage = AppStage.NOTIFICATION
    }

    fun returnToLanguage() { stage = AppStage.LANGUAGE }

    fun finishNotification() {
        prefs.edit().putBoolean("notification_complete", true).apply()
        stage = AppStage.ONBOARDING
    }

    fun finishOnboarding() {
        prefs.edit().putBoolean("onboarding_complete", true).apply()
        enterMainApp()
    }

    fun beginLogin() {
        authError = null
        stage = AppStage.AUTH
    }

    fun cancelLogin() {
        authBusy = false
        authError = null
        continueAsGuest()
    }

    fun signIn(email: String, password: String) {
        if (email.isBlank() || password.isBlank()) return updateAuthError("Enter your email and password")
        authBusy = true
        authError = null
        auth.signInWithEmailAndPassword(email.trim(), password).addOnCompleteListener { result ->
            if (stage != AppStage.AUTH) {
                if (result.isSuccessful) auth.signOut()
                return@addOnCompleteListener
            }
            authBusy = false
            if (result.isSuccessful) {
                prefs.edit().putBoolean("guest_active", false).apply()
                loadRemoteProfile()
            } else updateAuthError(result.exception?.localizedMessage)
        }
    }

    fun signUp(email: String, password: String) {
        if (email.isBlank() || password.length < 6) return updateAuthError("Use a valid email and at least 6 password characters")
        authBusy = true
        authError = null
        auth.createUserWithEmailAndPassword(email.trim(), password).addOnCompleteListener { result ->
            if (stage != AppStage.AUTH) {
                if (result.isSuccessful) auth.signOut()
                return@addOnCompleteListener
            }
            authBusy = false
            if (result.isSuccessful) {
                prefs.edit().putBoolean("guest_active", false).apply()
                profile = UserProfile(uid = auth.currentUser?.uid.orEmpty(), email = email.trim(), language = locale)
                stage = AppStage.PROFILE
            } else updateAuthError(result.exception?.localizedMessage)
        }
    }

    fun signInWithGoogle(idToken: String) {
        authBusy = true
        authError = null
        auth.signInWithCredential(GoogleAuthProvider.getCredential(idToken, null)).addOnCompleteListener { result ->
            if (stage != AppStage.AUTH) {
                if (result.isSuccessful) auth.signOut()
                return@addOnCompleteListener
            }
            authBusy = false
            if (result.isSuccessful) {
                prefs.edit().putBoolean("guest_active", false).apply()
                loadRemoteProfile()
            } else updateAuthError(result.exception?.localizedMessage)
        }
    }

    fun continueAsGuest() {
        prefs.edit().putBoolean("guest_active", true).apply()
        val uid = prefs.getString("guest_uid", null) ?: "guest_${UUID.randomUUID()}".also {
            prefs.edit().putString("guest_uid", it).apply()
        }
        profile = UserProfile(
            uid = uid,
            name = prefs.getString("guest_name", "Guest") ?: "Guest",
            age = prefs.getString("guest_age", "") ?: "",
            gender = prefs.getString("guest_gender", "prefer_not_to_say") ?: "prefer_not_to_say",
            language = locale,
        )
        loadHistory()
        stage = AppStage.MAIN
    }

    fun editProfile() { stage = AppStage.PROFILE }

    fun cancelProfileEdit() { stage = AppStage.MAIN }

    fun saveProfile(updated: UserProfile, stayOnCurrentScreen: Boolean = false) {
        val current = auth.currentUser
        if (current == null || profile?.uid?.startsWith("guest_") == true) {
            profile = updated.copy(uid = profile?.uid.orEmpty())
            prefs.edit().putString("guest_name", updated.name).putString("guest_age", updated.age)
                .putString("guest_gender", updated.gender).apply()
            if (!stayOnCurrentScreen) stage = AppStage.MAIN
            return
        }
        authBusy = true
        authError = null
        current.getIdToken(true).addOnSuccessListener { tokenResult ->
            viewModelScope.launch {
                runCatching { api.saveProfile(tokenResult.token.orEmpty(), updated.copy(uid = current.uid, email = current.email.orEmpty())) }
                    .onSuccess {
                        profile = updated.copy(uid = current.uid, email = current.email.orEmpty())
                        authBusy = false
                        if (!stayOnCurrentScreen) stage = AppStage.MAIN
                    }
                    .onFailure { authBusy = false; updateAuthError(it.message) }
            }
        }.addOnFailureListener { authBusy = false; updateAuthError(it.message) }
    }

    fun updateLanguage(code: String) {
        locale = code
        profile = profile?.copy(language = code)
        prefs.edit().putString("locale", code).apply()
    }

    fun diagnose(input: DiagnoseInput) {
        diagnosisState = LoadState.Loading
        diagnosisContextState = LoadState.Idle
        withToken { token ->
            viewModelScope.launch {
                diagnosisState = runCatching { api.diagnose(token, input) }.fold(
                    {
                        if (profile?.uid?.startsWith("guest_") == true) saveGuestHistory(it) else loadHistory()
                        LoadState.Success(it)
                    },
                    { LoadState.Error(it.message ?: "Diagnosis failed") },
                )
            }
        }
    }

    fun clearDiagnosis() {
        diagnosisState = LoadState.Idle
        diagnosisContextState = LoadState.Idle
    }

    fun loadDiagnosisContext(disease: String) {
        if (disease.isBlank()) return
        diagnosisContextState = LoadState.Loading
        viewModelScope.launch {
            val response = runCatching { api.medicalContext(disease) }.fold(
                { LoadState.Success(it) }, { LoadState.Error(it.message ?: "Nutrition context is unavailable") },
            )
            if ((diagnosisState as? LoadState.Success)?.value?.disease == disease) diagnosisContextState = response
        }
    }

    fun loadHistory() {
        val uid = profile?.uid ?: return
        if (uid.startsWith("guest_")) {
            val array = runCatching { JSONArray(prefs.getString("guest_history", "[]")) }.getOrDefault(JSONArray())
            diagnosisHistory.clear()
            (0 until array.length()).mapNotNullTo(diagnosisHistory) { index ->
                val item = array.optJSONObject(index) ?: return@mapNotNullTo null
                ScanHistoryItem(
                    id = item.optString("id"), disease = item.optString("disease"), confidence = item.optDouble("confidence"),
                    summary = item.optString("summary"), timestamp = item.optString("timestamp"),
                    heatmapUrl = item.optString("heatmapUrl").takeIf(String::isNotBlank),
                    reportUrl = item.optString("reportUrl").takeIf(String::isNotBlank),
                )
            }
            notifyChanged()
            return
        }
        FirebaseFirestore.getInstance().collection("diagnosis_records").whereEqualTo("uid", uid).get()
            .addOnSuccessListener { snapshot ->
                diagnosisHistory.clear()
                snapshot.documents.map { document ->
                    val knowledge = document.get("deep_knowledge") as? Map<*, *>
                    ScanHistoryItem(
                        id = document.id,
                        disease = document.getString("diagnosis") ?: "Unknown result",
                        confidence = document.getDouble("confidence") ?: 0.0,
                        summary = knowledge?.get("simple_explanation")?.toString() ?: knowledge?.get("reason")?.toString() ?: "Scan completed.",
                        timestamp = document.get("timestamp")?.toString().orEmpty(),
                        heatmapUrl = document.getString("heatmap_url"),
                        reportUrl = document.getString("report_url"),
                    )
                }.sortedByDescending { it.timestamp }.take(10).forEach(diagnosisHistory::add)
                notifyChanged()
            }
    }

    fun generateDiet(input: DietInput) {
        dietState = LoadState.Loading
        groceryState = LoadState.Idle
        viewModelScope.launch {
            dietState = runCatching { api.generateDiet(profile?.uid ?: "anonymous", input) }.fold(
                { LoadState.Success(it) }, { LoadState.Error(it.message ?: "Unable to generate a diet plan") },
            )
        }
    }

    fun clearDiet() {
        dietState = LoadState.Idle
        groceryState = LoadState.Idle
    }

    fun setDietPrefill(condition: String) {
        dietPrefillCondition = condition
        clearDiet()
    }

    fun loadGroceryList(plan: DietPlan) {
        groceryState = LoadState.Loading
        viewModelScope.launch {
            groceryState = runCatching { api.groceryList(plan, locale) }.fold(
                { LoadState.Success(it) }, { LoadState.Error(it.message ?: "Unable to create grocery list") },
            )
        }
    }

    fun searchLibrary(query: String) {
        if (query.isBlank()) return
        libraryState = LoadState.Loading
        viewModelScope.launch {
            libraryState = runCatching { api.medicalContext(query.trim()) }.fold(
                { LoadState.Success(it) }, { LoadState.Error(it.message ?: "Medical information is unavailable") },
            )
        }
    }

    fun clearLibrary() { libraryState = LoadState.Idle }

    fun sendChat(text: String) {
        if (text.isBlank() || chatBusy) return
        chatMessages += ChatMessage("user", text.trim())
        chatBusy = true
        chatError = null
        withToken { token ->
            viewModelScope.launch {
                runCatching { api.chat(token, chatMessages.toList()) }
                    .onSuccess { chatMessages += ChatMessage("assistant", it); chatBusy = false }
                    .onFailure { chatError = it.message; chatBusy = false }
            }
        }
    }

    fun logout() {
        auth.signOut()
        profile = null
        continueAsGuest()
    }

    fun deleteAccount() {
        val user = auth.currentUser ?: return logout()
        authBusy = true
        withToken { token ->
            viewModelScope.launch {
                runCatching { api.deleteAccount(token) }
                    .onSuccess { user.delete(); authBusy = false; logout() }
                    .onFailure { authBusy = false; updateAuthError(it.message) }
            }
        }
    }

    private fun enterMainApp() {
        if (auth.currentUser != null && !prefs.getBoolean("guest_active", false)) loadRemoteProfile()
        else continueAsGuest()
    }

    private fun loadRemoteProfile() {
        val user = auth.currentUser ?: return
        authBusy = true
        user.getIdToken(false).addOnSuccessListener { result ->
            viewModelScope.launch {
                runCatching { api.verifyProfile(result.token.orEmpty()) }
                    .onSuccess { remote ->
                        profile = remote ?: UserProfile(uid = user.uid, email = user.email.orEmpty(), language = locale)
                        authBusy = false
                        stage = if (remote == null) AppStage.PROFILE else AppStage.MAIN.also { loadHistory() }
                    }
                    .onFailure { authBusy = false; updateAuthError(it.message) }
            }
        }.addOnFailureListener { authBusy = false; updateAuthError(it.message) }
    }

    private fun withToken(block: (String) -> Unit) {
        val guest = profile?.uid?.takeIf { it.startsWith("guest_") }
        if (guest != null) return block(guest)
        val user = auth.currentUser
        if (user == null) {
            block("dev")
            return
        }
        user.getIdToken(false).addOnSuccessListener { block(it.token.orEmpty()) }
            .addOnFailureListener { updateAuthError(it.message) }
    }

    private fun saveGuestHistory(result: DiagnosisResult) {
        val item = ScanHistoryItem(
            id = result.sessionId, disease = result.disease, confidence = result.confidence,
            summary = result.explanation, timestamp = Instant.now().toString(),
            heatmapUrl = result.heatmapUrl, reportUrl = result.reportUrl,
        )
        diagnosisHistory.add(0, item)
        while (diagnosisHistory.size > 10) diagnosisHistory.removeAt(diagnosisHistory.lastIndex)
        val array = JSONArray().apply {
            diagnosisHistory.forEach {
                put(JSONObject().put("id", it.id).put("disease", it.disease).put("confidence", it.confidence)
                    .put("summary", it.summary).put("timestamp", it.timestamp).put("heatmapUrl", it.heatmapUrl).put("reportUrl", it.reportUrl))
            }
        }
        prefs.edit().putString("guest_history", array.toString()).apply()
    }

    private fun updateAuthError(message: String?) { authError = message ?: "Authentication failed" }
}
