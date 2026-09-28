package com.mediseen.app.ui

data class LanguageOption(val code: String, val name: String, val nativeName: String)

val supportedLanguages = listOf(
    LanguageOption("en", "English", "English"),
    LanguageOption("hi", "Hindi", "हिन्दी"),
    LanguageOption("es", "Spanish", "Español"),
    LanguageOption("fr", "French", "Français"),
    LanguageOption("ar", "Arabic", "العربية"),
    LanguageOption("te", "Telugu", "తెలుగు"),
    LanguageOption("de", "German", "Deutsch"),
    LanguageOption("ko", "Korean", "한국어"),
    LanguageOption("ja", "Japanese", "日本語"),
    LanguageOption("zh", "Chinese", "中文"),
)

private val translations = mapOf(
    "hi" to mapOf("home" to "होम", "diagnose" to "जाँच", "diet" to "आहार", "library" to "लाइब्रेरी", "chat" to "सहायक", "profile" to "प्रोफ़ाइल"),
    "es" to mapOf("home" to "Inicio", "diagnose" to "Diagnóstico", "diet" to "Dieta", "library" to "Biblioteca", "chat" to "Asistente", "profile" to "Perfil"),
    "fr" to mapOf("home" to "Accueil", "diagnose" to "Diagnostic", "diet" to "Nutrition", "library" to "Bibliothèque", "chat" to "Assistant", "profile" to "Profil"),
    "ar" to mapOf("home" to "الرئيسية", "diagnose" to "التشخيص", "diet" to "الغذاء", "library" to "المكتبة", "chat" to "المساعد", "profile" to "الملف"),
    "te" to mapOf("home" to "హోమ్", "diagnose" to "నిర్ధారణ", "diet" to "ఆహారం", "library" to "లైబ్రరీ", "chat" to "సహాయకుడు", "profile" to "ప్రొఫైల్"),
    "de" to mapOf("home" to "Start", "diagnose" to "Diagnose", "diet" to "Ernährung", "library" to "Bibliothek", "chat" to "Assistent", "profile" to "Profil"),
    "ko" to mapOf("home" to "홈", "diagnose" to "진단", "diet" to "식단", "library" to "라이브러리", "chat" to "도우미", "profile" to "프로필"),
    "ja" to mapOf("home" to "ホーム", "diagnose" to "診断", "diet" to "食事", "library" to "ライブラリ", "chat" to "アシスタント", "profile" to "プロフィール"),
    "zh" to mapOf("home" to "主页", "diagnose" to "诊断", "diet" to "饮食", "library" to "资料库", "chat" to "助手", "profile" to "个人资料"),
)

fun tr(locale: String, key: String): String = translations[locale]?.get(key) ?: when (key) {
    "home" -> "Home"
    "diagnose" -> "Diagnose"
    "diet" -> "Diet"
    "library" -> "Library"
    "chat" -> "Assistant"
    "profile" -> "Profile"
    else -> key
}
