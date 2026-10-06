package com.mediseen.app

internal object AppEntryPolicy {
    fun initialStage(
        welcomeComplete: Boolean,
        languageComplete: Boolean,
        onboardingComplete: Boolean,
    ): AppStage = when {
        !welcomeComplete -> AppStage.WELCOME
        !languageComplete -> AppStage.LANGUAGE
        !onboardingComplete -> AppStage.ONBOARDING
        else -> AppStage.MAIN
    }
}
