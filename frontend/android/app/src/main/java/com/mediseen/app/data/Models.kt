package com.mediseen.app.data

import android.net.Uri

data class UserProfile(
    val uid: String = "",
    val name: String = "",
    val email: String = "",
    val age: String = "",
    val gender: String = "prefer_not_to_say",
    val language: String = "en",
)

data class DiagnosisResult(
    val sessionId: String,
    val disease: String,
    val confidence: Double,
    val explanation: String,
    val rootCause: String,
    val managementSteps: List<String>,
    val likelySymptoms: List<String>,
    val heatmapUrl: String?,
    val reportUrl: String?,
)

data class ScanHistoryItem(
    val id: String,
    val disease: String,
    val confidence: Double,
    val summary: String,
    val timestamp: String,
    val heatmapUrl: String? = null,
    val reportUrl: String? = null,
)

data class Meal(val name: String, val items: List<String>, val calories: Double)

data class DietPlan(
    val calories: Double,
    val protein: Double,
    val carbs: Double,
    val fats: Double,
    val meals: List<Meal>,
    val avoid: List<String>,
    val recommended: List<String>,
)

data class MedicalContext(
    val name: String,
    val overview: String,
    val symptoms: List<String>,
    val precautions: List<String>,
    val triggers: List<String>,
    val recommended: List<String>,
    val avoid: List<String>,
)

data class ChatMessage(val role: String, val text: String)
data class DiagnoseInput(val uri: Uri, val symptoms: String, val locale: String)

data class DietInput(
    val disease: String,
    val weight: Double,
    val height: Double,
    val age: Int,
    val gender: String,
    val activityLevel: Double,
    val goal: String,
    val dietType: String,
    val budget: String,
)

sealed interface LoadState<out T> {
    data object Idle : LoadState<Nothing>
    data object Loading : LoadState<Nothing>
    data class Success<T>(val value: T) : LoadState<T>
    data class Error(val message: String) : LoadState<Nothing>
}
