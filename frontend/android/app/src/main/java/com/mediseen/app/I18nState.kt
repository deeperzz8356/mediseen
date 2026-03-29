package com.mediseen.app

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue

object I18nState {
    var currentLanguage by mutableStateOf("English")

    private val translations = mapOf(
        "English" to mapOf(
            "app_tagline" to "Agentic Health Intelligence",
            "app_intro" to "Meet Mediseen. High-impact diagnostics and empathetic AI guidance, ready for your next move.",
            "get_started" to "Get Started",
            "choose_language" to "Choose your language",
            "use_language" to "Use %s",
            "auth_title" to "Choose a sign-in method",
            "auth_subtitle" to "Continue with email or Google to access your health dashboard.",
            "continue_google" to "Continue with Google",
            "continue_email" to "Continue with Email",
            "email_label" to "Email",
            "password_label" to "Password",
            "name_label" to "Name",
            "switch_sign_up" to "Need an account? Create one",
            "switch_sign_in" to "Already have an account? Sign in",
            "email_submit_sign_in" to "Sign in with Email",
            "email_submit_sign_up" to "Create account with Email",
            "auth_cancelled" to "Google sign-in was cancelled.",
            "auth_failed" to "Authentication failed.",
            "hello_speaker" to "Hello, %s speaker",
            "dashboard_intro" to "Responsive health metrics adjust across devices. Tap the agent if you need context-aware coaching.",
            "agent_title" to "Agent Mediseen",
            "agent_context" to "Current context: Dashboard · Language %s · Healthy trends trending up.",
            "agent_copy" to "Agent: Let me know if you'd like a deeper report, a hydration reminder, or to scan a document.",
            "close" to "Close",
            "scan_report" to "Scan Report",
            "scan_copy" to "Capture a medical document and share the context with the Agent.",
            "capture" to "Capture",
            "camera_permission_denied" to "Camera permission is required to capture a document."
        ),
        "Hindi" to mapOf(
            "app_tagline" to "\u090f\u091c\u0947\u0902\u091f\u093f\u0915 \u0939\u0947\u0932\u094d\u0925 \u0907\u0902\u091f\u0947\u0932\u093f\u091c\u0947\u0902\u0938",
            "app_intro" to "\u092e\u0947\u0921\u093f\u0938\u0940\u0928 \u0938\u0947 \u092e\u093f\u0932\u093f\u090f. \u0924\u0947\u091c \u0928\u093f\u0926\u093e\u0928 \u0914\u0930 \u0938\u0939\u093e\u0928\u0941\u092d\u0942\u0924\u093f\u092a\u0942\u0930\u094d\u0923 AI \u092e\u093e\u0930\u094d\u0917\u0926\u0930\u094d\u0936\u0928, \u0905\u0917\u0932\u0947 \u0915\u0926\u092e \u0915\u0947 \u0932\u093f\u090f \u0924\u0948\u092f\u093e\u0930.",
            "get_started" to "\u0936\u0941\u0930\u0942 \u0915\u0930\u0947\u0902",
            "choose_language" to "\u0905\u092a\u0928\u0940 \u092d\u093e\u0937\u093e \u091a\u0941\u0928\u0947\u0902",
            "use_language" to "%s \u0915\u093e \u0909\u092a\u092f\u094b\u0917 \u0915\u0930\u0947\u0902",
            "auth_title" to "\u0938\u093e\u0907\u0928-\u0907\u0928 \u0924\u0930\u0940\u0915\u093e \u091a\u0941\u0928\u0947\u0902",
            "auth_subtitle" to "\u0905\u092a\u0928\u0947 \u0939\u0947\u0932\u094d\u0925 \u0921\u0948\u0936\u092c\u094b\u0930\u094d\u0921 \u0924\u0915 \u092a\u0939\u0941\u0901\u091a\u0928\u0947 \u0915\u0947 \u0932\u093f\u090f \u0908\u092e\u0947\u0932 \u092f\u093e Google \u0938\u0947 \u091c\u093e\u0930\u0940 \u0930\u0916\u0947\u0902.",
            "continue_google" to "Google \u0915\u0947 \u0938\u093e\u0925 \u091c\u093e\u0930\u0940 \u0930\u0916\u0947\u0902",
            "continue_email" to "\u0908\u092e\u0947\u0932 \u0915\u0947 \u0938\u093e\u0925 \u091c\u093e\u0930\u0940 \u0930\u0916\u0947\u0902",
            "email_label" to "\u0908\u092e\u0947\u0932",
            "password_label" to "\u092a\u093e\u0938\u0935\u0930\u094d\u0921",
            "name_label" to "\u0928\u093e\u092e",
            "switch_sign_up" to "\u0916\u093e\u0924\u093e \u0928\u0939\u0940\u0902 \u0939\u0948? \u0928\u092f\u093e \u092c\u0928\u093e\u090f\u0902",
            "switch_sign_in" to "\u092a\u0939\u0932\u0947 \u0938\u0947 \u0916\u093e\u0924\u093e \u0939\u0948? \u0938\u093e\u0907\u0928 \u0907\u0928 \u0915\u0930\u0947\u0902",
            "email_submit_sign_in" to "\u0908\u092e\u0947\u0932 \u0938\u0947 \u0938\u093e\u0907\u0928 \u0907\u0928",
            "email_submit_sign_up" to "\u0908\u092e\u0947\u0932 \u0938\u0947 \u0916\u093e\u0924\u093e \u092c\u0928\u093e\u090f\u0902",
            "auth_cancelled" to "Google \u0938\u093e\u0907\u0928-\u0907\u0928 \u0930\u0926\u094d\u0926 \u0915\u0930 \u0926\u093f\u092f\u093e \u0917\u092f\u093e.",
            "auth_failed" to "\u092a\u094d\u0930\u092e\u093e\u0923\u0940\u0915\u0930\u0923 \u0935\u093f\u092b\u0932 \u0930\u0939\u093e.",
            "hello_speaker" to "\u0928\u092e\u0938\u094d\u0924\u0947, %s \u092d\u093e\u0937\u093e \u092c\u094b\u0932\u0928\u0947 \u0935\u093e\u0932\u0947",
            "dashboard_intro" to "\u0930\u093f\u0938\u094d\u092a\u0949\u0928\u094d\u0938\u093f\u0935 \u0939\u0947\u0932\u094d\u0925 \u092e\u0947\u091f\u094d\u0930\u093f\u0915\u094d\u0938 \u0939\u0930 \u0921\u093f\u0935\u093e\u0907\u0938 \u092a\u0930 \u0905\u0928\u0941\u0915\u0942\u0932\u093f\u0924 \u0939\u094b\u0924\u0947 \u0939\u0948\u0902. \u0915\u0949\u0928\u094d\u091f\u0947\u0915\u094d\u0938\u094d\u091f-\u0905\u0935\u0947\u092f\u0930 \u0917\u093e\u0907\u0921\u0947\u0902\u0938 \u0915\u0947 \u0932\u093f\u090f \u090f\u091c\u0947\u0902\u091f \u092a\u0930 \u091f\u0948\u092a \u0915\u0930\u0947\u0902.",
            "agent_title" to "\u090f\u091c\u0947\u0902\u091f \u092e\u0947\u0921\u093f\u0938\u0940\u0928",
            "agent_context" to "\u0935\u0930\u094d\u0924\u092e\u093e\u0928 \u0938\u0902\u0926\u0930\u094d\u092d: \u0921\u0948\u0936\u092c\u094b\u0930\u094d\u0921 \u00b7 \u092d\u093e\u0937\u093e %s \u00b7 \u0938\u094d\u0935\u0938\u094d\u0925 \u0930\u0941\u091d\u093e\u0928 \u092c\u0947\u0939\u0924\u0930 \u0939\u094b \u0930\u0939\u0947 \u0939\u0948\u0902.",
            "agent_copy" to "\u090f\u091c\u0947\u0902\u091f: \u0905\u0917\u0930 \u0906\u092a \u0917\u0939\u0930\u0940 \u0930\u093f\u092a\u094b\u0930\u094d\u091f, \u0939\u093e\u0907\u0921\u094d\u0930\u0947\u0936\u0928 \u0930\u093f\u092e\u093e\u0907\u0902\u0921\u0930, \u092f\u093e \u0921\u0949\u0915\u094d\u092f\u0941\u092e\u0947\u0902\u091f \u0938\u094d\u0915\u0948\u0928 \u091a\u093e\u0939\u093f\u090f \u0924\u094b \u092e\u0941\u091d\u0947 \u092c\u0924\u093e\u090f\u0902.",
            "close" to "\u092c\u0902\u0926 \u0915\u0930\u0947\u0902",
            "scan_report" to "\u0930\u093f\u092a\u094b\u0930\u094d\u091f \u0938\u094d\u0915\u0948\u0928 \u0915\u0930\u0947\u0902",
            "scan_copy" to "\u0915\u094b\u0908 \u092e\u0947\u0921\u093f\u0915\u0932 \u0921\u0949\u0915\u094d\u092f\u0941\u092e\u0947\u0902\u091f \u0915\u0948\u092a\u094d\u091a\u0930 \u0915\u0930\u0947\u0902 \u0914\u0930 \u090f\u091c\u0947\u0902\u091f \u0915\u0947 \u0938\u093e\u0925 \u0938\u0902\u0926\u0930\u094d\u092d \u0938\u093e\u091d\u093e \u0915\u0930\u0947\u0902.",
            "capture" to "\u0915\u0948\u092a\u094d\u091a\u0930",
            "camera_permission_denied" to "\u0921\u0949\u0915\u094d\u092f\u0941\u092e\u0947\u0902\u091f \u0915\u0948\u092a\u094d\u091a\u0930 \u0915\u0930\u0928\u0947 \u0915\u0947 \u0932\u093f\u090f \u0915\u0948\u092e\u0930\u093e \u0905\u0928\u0941\u092e\u0924\u093f \u091c\u0930\u0942\u0930\u0940 \u0939\u0948."
        )
    )

    fun t(key: String): String {
        return translations[currentLanguage]?.get(key)
            ?: translations["English"]?.get(key)
            ?: key
    }

    fun tf(key: String, vararg args: Any): String = t(key).format(*args)
}
