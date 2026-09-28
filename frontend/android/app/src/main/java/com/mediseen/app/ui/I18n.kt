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
    "hi" to mapOf("home" to "होम", "diagnose" to "जाँच", "diet" to "आहार", "library" to "लाइब्रेरी", "chat" to "सहायक", "profile" to "प्रोफ़ाइल", "hello" to "नमस्ते", "health_assistant" to "स्वास्थ्य सहायक", "nutrition" to "आपका स्वास्थ्य और पोषण", "library_title" to "मेडिसीन लाइब्रेरी", "profile_title" to "आपकी प्रोफ़ाइल", "start_scan" to "स्कैन शुरू करें", "scan_report" to "स्कैन रिपोर्ट", "activity" to "गतिविधि", "create_plan" to "भोजन योजना बनाएँ", "language" to "भाषा", "terms" to "नियम और शर्तें", "privacy" to "गोपनीयता नीति", "account" to "खाता"),
    "es" to mapOf("home" to "Inicio", "diagnose" to "Diagnóstico", "diet" to "Dieta", "library" to "Biblioteca", "chat" to "Asistente", "profile" to "Perfil", "hello" to "Hola", "health_assistant" to "Asistente de salud", "nutrition" to "Tu salud y nutrición", "library_title" to "Biblioteca MediSeen", "profile_title" to "Tu perfil", "start_scan" to "Iniciar escaneo", "scan_report" to "Informe de escaneo", "activity" to "Actividad", "create_plan" to "Crear plan de comidas", "language" to "Idioma", "terms" to "Términos y condiciones", "privacy" to "Política de privacidad", "account" to "Cuenta"),
    "fr" to mapOf("home" to "Accueil", "diagnose" to "Diagnostic", "diet" to "Nutrition", "library" to "Bibliothèque", "chat" to "Assistant", "profile" to "Profil", "hello" to "Bonjour", "health_assistant" to "Assistant santé", "nutrition" to "Votre santé et nutrition", "library_title" to "Bibliothèque MediSeen", "profile_title" to "Votre profil", "start_scan" to "Démarrer l’analyse", "scan_report" to "Rapport d’analyse", "activity" to "Activité", "create_plan" to "Créer un plan de repas", "language" to "Langue", "terms" to "Conditions générales", "privacy" to "Politique de confidentialité", "account" to "Compte"),
    "ar" to mapOf("home" to "الرئيسية", "diagnose" to "التشخيص", "diet" to "الغذاء", "library" to "المكتبة", "chat" to "المساعد", "profile" to "الملف", "hello" to "مرحبًا", "health_assistant" to "المساعد الصحي", "nutrition" to "صحتك وتغذيتك", "library_title" to "مكتبة ميديسين", "profile_title" to "ملفك الشخصي", "start_scan" to "بدء الفحص", "scan_report" to "تقرير الفحص", "activity" to "النشاط", "create_plan" to "إنشاء خطة وجبات", "language" to "اللغة", "terms" to "الشروط والأحكام", "privacy" to "سياسة الخصوصية", "account" to "الحساب"),
    "te" to mapOf("home" to "హోమ్", "diagnose" to "నిర్ధారణ", "diet" to "ఆహారం", "library" to "లైబ్రరీ", "chat" to "సహాయకుడు", "profile" to "ప్రొఫైల్", "hello" to "నమస్కారం", "health_assistant" to "ఆరోగ్య సహాయకుడు", "nutrition" to "మీ ఆరోగ్యం మరియు పోషణ", "library_title" to "మెడిసీన్ లైబ్రరీ", "profile_title" to "మీ ప్రొఫైల్", "start_scan" to "స్కాన్ ప్రారంభించండి", "scan_report" to "స్కాన్ నివేదిక", "activity" to "కార్యాచరణ", "create_plan" to "భోజన ప్రణాళిక సృష్టించండి", "language" to "భాష", "terms" to "నిబంధనలు", "privacy" to "గోప్యతా విధానం", "account" to "ఖాతా"),
    "de" to mapOf("home" to "Start", "diagnose" to "Diagnose", "diet" to "Ernährung", "library" to "Bibliothek", "chat" to "Assistent", "profile" to "Profil", "hello" to "Hallo", "health_assistant" to "Gesundheitsassistent", "nutrition" to "Gesundheit und Ernährung", "library_title" to "MediSeen Bibliothek", "profile_title" to "Ihr Profil", "start_scan" to "Scan starten", "scan_report" to "Scanbericht", "activity" to "Aktivität", "create_plan" to "Essensplan erstellen", "language" to "Sprache", "terms" to "Nutzungsbedingungen", "privacy" to "Datenschutz", "account" to "Konto"),
    "ko" to mapOf("home" to "홈", "diagnose" to "진단", "diet" to "식단", "library" to "라이브러리", "chat" to "도우미", "profile" to "프로필", "hello" to "안녕하세요", "health_assistant" to "건강 도우미", "nutrition" to "건강과 영양", "library_title" to "MediSeen 라이브러리", "profile_title" to "내 프로필", "start_scan" to "스캔 시작", "scan_report" to "스캔 보고서", "activity" to "활동", "create_plan" to "식단 만들기", "language" to "언어", "terms" to "이용 약관", "privacy" to "개인정보 처리방침", "account" to "계정"),
    "ja" to mapOf("home" to "ホーム", "diagnose" to "診断", "diet" to "食事", "library" to "ライブラリ", "chat" to "アシスタント", "profile" to "プロフィール", "hello" to "こんにちは", "health_assistant" to "健康アシスタント", "nutrition" to "健康と栄養", "library_title" to "MediSeenライブラリ", "profile_title" to "プロフィール", "start_scan" to "スキャン開始", "scan_report" to "スキャンレポート", "activity" to "アクティビティ", "create_plan" to "食事プランを作成", "language" to "言語", "terms" to "利用規約", "privacy" to "プライバシーポリシー", "account" to "アカウント"),
    "zh" to mapOf("home" to "主页", "diagnose" to "诊断", "diet" to "饮食", "library" to "资料库", "chat" to "助手", "profile" to "个人资料", "hello" to "你好", "health_assistant" to "健康助手", "nutrition" to "您的健康与营养", "library_title" to "MediSeen资料库", "profile_title" to "您的个人资料", "start_scan" to "开始扫描", "scan_report" to "扫描报告", "activity" to "活动", "create_plan" to "创建膳食计划", "language" to "语言", "terms" to "条款与条件", "privacy" to "隐私政策", "account" to "账户"),
)

fun tr(locale: String, key: String): String = translations[locale]?.get(key) ?: when (key) {
    "home" -> "Home"
    "diagnose" -> "Diagnose"
    "diet" -> "Diet"
    "library" -> "Library"
    "chat" -> "Assistant"
    "profile" -> "Profile"
    "hello" -> "Hello"
    "health_assistant" -> "Health assistant"
    "nutrition" -> "Your health & nutrition"
    "library_title" -> "MediSeen Library"
    "profile_title" -> "Your profile"
    "start_scan" -> "Start scan"
    "scan_report" -> "Scan report"
    "activity" -> "Activity"
    "create_plan" -> "Create meal plan"
    "language" -> "Language"
    "terms" -> "Terms and Conditions"
    "privacy" -> "Privacy Policy"
    "account" -> "Account"
    else -> key
}
