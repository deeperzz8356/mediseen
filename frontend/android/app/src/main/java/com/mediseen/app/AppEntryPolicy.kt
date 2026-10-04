package com.mediseen.app

internal object AppEntryPolicy {
    fun initialStage(
        welcomeComplete: Boolean,
        languageComplete: Boolean,
        notificationComplete: Boolean,
        onboardingComplete: Boolean,
    ): AppStage = when {
        !welcomeComplete -> AppStage.WELCOME
        !languageComplete -> AppStage.LANGUAGE
        !onboardingComplete && !notificationComplete -> AppStage.NOTIFICATION
        !onboardingComplete -> AppStage.ONBOARDING
        else -> AppStage.MAIN
    }
}
