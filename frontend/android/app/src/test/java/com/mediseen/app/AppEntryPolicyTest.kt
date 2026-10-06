package com.mediseen.app

import org.junit.Assert.assertEquals
import org.junit.Test

class AppEntryPolicyTest {
    @Test
    fun completedOnboardingEntersMainAppWithoutAuthentication() {
        assertEquals(
            AppStage.MAIN,
            AppEntryPolicy.initialStage(
                welcomeComplete = true,
                languageComplete = true,
                onboardingComplete = true,
            ),
        )
    }

    @Test
    fun unfinishedOnboardingStagesRemainReachable() {
        assertEquals(AppStage.WELCOME, AppEntryPolicy.initialStage(false, false, false))
        assertEquals(AppStage.LANGUAGE, AppEntryPolicy.initialStage(true, false, false))
        assertEquals(AppStage.ONBOARDING, AppEntryPolicy.initialStage(true, true, false))
    }
}
