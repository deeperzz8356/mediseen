package com.mediseen.app.data

import android.content.ContentResolver
import com.mediseen.app.BuildConfig
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.MultipartBody
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.asRequestBody
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONArray
import org.json.JSONObject
import java.io.File
import java.util.concurrent.TimeUnit

class ApiClient(private val contentResolver: ContentResolver) {
    private val jsonType = "application/json; charset=utf-8".toMediaType()
    private val client = OkHttpClient.Builder()
        .connectTimeout(20, TimeUnit.SECONDS)
        .readTimeout(90, TimeUnit.SECONDS)
        .writeTimeout(30, TimeUnit.SECONDS)
        .build()
    private val baseUrl = BuildConfig.API_BASE_URL.trimEnd('/')

    suspend fun verifyProfile(token: String): UserProfile? = withContext(Dispatchers.IO) {
        val json = executeJson(request("/auth/verify", token).post(ByteArray(0).toRequestBody()).build())
        if (!json.optBoolean("has_profile")) return@withContext null
        val profile = json.optJSONObject("profile") ?: JSONObject()
        UserProfile(
            uid = json.optString("uid"),
            name = profile.optString("name"),
            email = profile.optString("email"),
            age = profile.opt("age")?.toString().orEmpty(),
            gender = profile.optString("gender", "prefer_not_to_say"),
            language = profile.optString("language", "en"),
        )
    }

    suspend fun saveProfile(token: String, profile: UserProfile) = withContext(Dispatchers.IO) {
        val body = JSONObject()
            .put("name", profile.name)
            .put("age", profile.age.toIntOrNull())
            .put("gender", profile.gender)
            .put("language", profile.language)
        executeJson(request("/auth/register", token).post(body.toString().toRequestBody(jsonType)).build())
        Unit
    }

    suspend fun deleteAccount(token: String) = withContext(Dispatchers.IO) {
        executeJson(request("/auth/delete-account", token).post(ByteArray(0).toRequestBody()).build())
        Unit
    }

    suspend fun diagnose(token: String, input: DiagnoseInput): DiagnosisResult = withContext(Dispatchers.IO) {
        val mime = contentResolver.getType(input.uri) ?: "image/jpeg"
        val suffix = when (mime) { "image/png" -> ".png"; "image/webp" -> ".webp"; else -> ".jpg" }
        val temp = File.createTempFile("mediseen-upload-", suffix)
        try {
            contentResolver.openInputStream(input.uri)?.use { source ->
                temp.outputStream().use { target -> source.copyTo(target) }
            } ?: error("Unable to read the selected image")
            val multipart = MultipartBody.Builder().setType(MultipartBody.FORM)
                .addFormDataPart("symptoms", input.symptoms.ifBlank { "No symptoms provided" })
                .addFormDataPart("locale", input.locale)
                .addFormDataPart("image", temp.name, temp.asRequestBody(mime.toMediaTypeOrNull()))
                .build()
            val json = executeJson(request("/diagnose", token).header("X-Client-Platform", "android-native").post(multipart).build())
            DiagnosisResult(
                sessionId = json.optString("session_id"),
                disease = json.optString("disease_identification", "Unknown condition"),
                confidence = json.optDouble("confidence", 0.0),
                explanation = json.optString("patient_friendly_explanation", "Analysis completed."),
                rootCause = json.optString("root_cause_reason"),
                managementSteps = json.stringList("steps_to_understand_and_manage"),
                likelySymptoms = json.stringList("likely_symptoms"),
                heatmapUrl = absoluteUrl(json.optString("heatmap_url").takeIf(String::isNotBlank)),
                reportUrl = absoluteUrl(json.optString("report_url").takeIf(String::isNotBlank)),
            )
        } finally {
            temp.delete()
        }
    }

    suspend fun chat(token: String, messages: List<ChatMessage>): String = withContext(Dispatchers.IO) {
        val items = JSONArray().apply {
            messages.forEach { put(JSONObject().put("role", it.role).put("content", it.text)) }
        }
        val body = JSONObject().put("messages", items).toString().toRequestBody(jsonType)
        executeText(request("/chat", token).post(body).build())
    }

    suspend fun generateDiet(uid: String, input: DietInput): DietPlan = withContext(Dispatchers.IO) {
        val body = JSONObject()
            .put("user_id", uid)
            .put("disease", input.disease)
            .put("weight", input.weight)
            .put("height", input.height)
            .put("age", input.age)
            .put("gender", input.gender)
            .put("activity_level", input.activityLevel)
            .put("goal", input.goal)
            .put("diet_type", input.dietType)
            .put("budget", input.budget)
        parseDiet(executeJson(request("/diet/generate").post(body.toString().toRequestBody(jsonType)).build()))
    }

    suspend fun groceryList(plan: DietPlan, locale: String): List<String> = withContext(Dispatchers.IO) {
        val meals = JSONArray().apply {
            plan.meals.forEach { meal ->
                put(JSONObject().put("meal", meal.name).put("items", JSONArray(meal.items)).put("calories", meal.calories))
            }
        }
        val body = JSONObject().put("meal_plan", meals).put("locale", locale)
        executeJson(request("/diet/grocery").post(body.toString().toRequestBody(jsonType)).build()).stringList("items")
    }

    suspend fun medicalContext(disease: String): MedicalContext = withContext(Dispatchers.IO) {
        val encoded = java.net.URLEncoder.encode(disease, "UTF-8")
        val json = executeJson(request("/medical/context?disease=$encoded").get().build())
        val diet = json.optJSONObject("diet") ?: JSONObject()
        MedicalContext(
            name = json.optString("disease", disease),
            overview = diet.optString("plan"),
            symptoms = json.stringList("symptoms"),
            precautions = json.stringList("precautions"),
            triggers = emptyList(),
            recommended = diet.stringList("recommended"),
            avoid = diet.stringList("avoid"),
        )
    }

    private fun parseDiet(json: JSONObject): DietPlan {
        val macros = json.optJSONObject("macros") ?: JSONObject()
        val meals = json.optJSONArray("meals") ?: JSONArray()
        return DietPlan(
            calories = json.optDouble("calories"),
            protein = macros.optDouble("protein"),
            carbs = macros.optDouble("carbs"),
            fats = macros.optDouble("fats"),
            meals = (0 until meals.length()).map { index ->
                val item = meals.getJSONObject(index)
                Meal(item.optString("meal"), item.stringList("items"), item.optDouble("calories"))
            },
            avoid = json.stringList("avoid"),
            recommended = json.stringList("recommended"),
        )
    }

    private fun request(path: String, token: String? = null): Request.Builder = Request.Builder()
        .url("$baseUrl$path")
        .apply { if (!token.isNullOrBlank()) header("Authorization", "Bearer $token") }

    private fun executeJson(request: Request): JSONObject = ApiResponseDecoder.json(executeText(request))

    private fun executeText(request: Request): String = client.newCall(request).execute().use { response ->
        val text = response.body?.string().orEmpty()
        if (!response.isSuccessful) {
            error(ApiResponseDecoder.errorMessage(response.code, text))
        }
        text
    }

    private fun absoluteUrl(path: String?): String? = when {
        path == null -> null
        path.startsWith("http://") || path.startsWith("https://") -> path
        else -> "$baseUrl/${path.trimStart('/')}"
    }
}

private fun JSONObject.stringList(key: String): List<String> {
    val array = optJSONArray(key) ?: return emptyList()
    return (0 until array.length()).mapNotNull { array.optString(it).takeIf(String::isNotBlank) }
}
