package com.mediseen.app

import android.content.Context
import android.view.LayoutInflater
import androidx.test.core.app.ActivityScenario
import androidx.test.core.app.ApplicationProvider
import androidx.test.espresso.Espresso.onView
import androidx.test.espresso.Espresso.pressBack
import androidx.test.espresso.action.ViewActions.click
import androidx.test.espresso.assertion.ViewAssertions.matches
import androidx.test.espresso.matcher.ViewMatchers.isDisplayed
import androidx.test.espresso.matcher.ViewMatchers.withId
import androidx.test.espresso.matcher.ViewMatchers.withText
import androidx.test.ext.junit.runners.AndroidJUnit4
import org.junit.After
import org.junit.Assert.assertNotNull
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.hamcrest.Matchers.allOf

@RunWith(AndroidJUnit4::class)
class XmlUiSmokeTest {
    private val context: Context get() = ApplicationProvider.getApplicationContext()

    @Before
    @After
    fun resetState() {
        context.getSharedPreferences("mediseen_native", 0).edit().clear().commit()
    }

    @Test
    fun allConvertedScreenLayoutsInflate() {
        ActivityScenario.launch(MainActivity::class.java).use { scenario ->
            scenario.onActivity { activity ->
                val inflater = LayoutInflater.from(activity)
                listOf(
                    R.layout.screen_welcome,
                    R.layout.screen_language,
                    R.layout.screen_notification,
                    R.layout.screen_onboarding,
                    R.layout.screen_auth,
                    R.layout.screen_profile_form,
                    R.layout.screen_home,
                    R.layout.screen_diagnose,
                    R.layout.screen_diet,
                    R.layout.screen_library,
                    R.layout.screen_profile,
                    R.layout.screen_legal,
                    R.layout.screen_chat,
                    R.layout.popup_language,
                ).forEach { layout -> assertNotNull(inflater.inflate(layout, null, false)) }
            }
        }
    }

    @Test
    fun firstRunFlowReachesAuthentication() {
        context.getSharedPreferences("mediseen_native", 0).edit().putBoolean("welcome_complete", true).commit()
        ActivityScenario.launch(MainActivity::class.java).use {
            onView(withId(R.id.language_confirm)).perform(click())
            onView(withText("Skip")).perform(click())
            repeat(3) { onView(withText("Next")).perform(click()) }
            onView(withText("Get Started")).perform(click())
            onView(withText("Welcome")).check(matches(isDisplayed()))
            onView(withText("Continue as guest")).check(matches(isDisplayed()))
        }
    }

    @Test
    fun primaryAndNestedNavigationRemainReachable() {
        context.getSharedPreferences("mediseen_native", 0).edit()
            .putBoolean("welcome_complete", true)
            .putBoolean("language_complete", true)
            .putBoolean("notification_complete", true)
            .putBoolean("onboarding_complete", true)
            .putBoolean("guest_active", true)
            .commit()

        ActivityScenario.launch(MainActivity::class.java).use {
            onView(withId(R.id.home_scroll)).check(matches(isDisplayed()))
            onView(withId(R.id.nav_diagnose)).perform(click())
            onView(withId(R.id.diagnose_scroll)).check(matches(isDisplayed()))
            onView(withText("Activity")).perform(click())
            onView(withText("Today's activity")).check(matches(isDisplayed()))
            pressBack()
            onView(withText("1. Upload report")).check(matches(isDisplayed()))

            onView(withId(R.id.nav_diet)).perform(click())
            onView(withId(R.id.diet_scroll)).check(matches(isDisplayed()))
            onView(withId(R.id.nav_library)).perform(click())
            onView(withId(R.id.library_scroll)).check(matches(isDisplayed()))
            onView(withId(R.id.nav_profile)).perform(click())
            onView(withId(R.id.profile_scroll)).check(matches(isDisplayed()))
            onView(withText("Terms and Conditions")).perform(click())
            onView(withId(R.id.legal_scroll)).check(matches(isDisplayed()))
            pressBack()
            onView(withId(R.id.profile_scroll)).check(matches(isDisplayed()))

            onView(withId(R.id.nav_home)).perform(click())
            onView(withId(R.id.assistant_fab)).perform(click())
            onView(withId(R.id.chat_close)).check(matches(isDisplayed())).perform(click())
            onView(withId(R.id.home_scroll)).check(matches(isDisplayed()))
        }
    }

    @Test
    fun profileEditBackAndLanguageSwitchStayInsideTheApp() {
        context.getSharedPreferences("mediseen_native", 0).edit()
            .putBoolean("welcome_complete", true)
            .putBoolean("language_complete", true)
            .putBoolean("notification_complete", true)
            .putBoolean("onboarding_complete", true)
            .putBoolean("guest_active", true)
            .commit()

        ActivityScenario.launch(MainActivity::class.java).use {
            onView(withId(R.id.nav_profile)).perform(click())
            onView(withText("Change")).perform(click())
            onView(withId(R.id.profile_form_scroll)).check(matches(isDisplayed()))
            pressBack()
            onView(withId(R.id.profile_scroll)).check(matches(isDisplayed()))

            onView(withId(R.id.nav_home)).perform(click())
            onView(withId(R.id.header_language)).perform(click())
            onView(withText("हिन्दी")).perform(click())
            onView(allOf(withText("होम"), isDisplayed())).check(matches(isDisplayed()))
        }
    }
}
