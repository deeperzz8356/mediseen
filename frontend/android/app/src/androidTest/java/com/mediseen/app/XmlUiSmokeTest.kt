package com.mediseen.app

import androidx.test.core.app.ActivityScenario
import androidx.test.ext.junit.runners.AndroidJUnit4
import org.junit.Assert.assertNotNull
import org.junit.Test
import org.junit.runner.RunWith

@RunWith(AndroidJUnit4::class)
class XmlUiSmokeTest {
    @Test
    fun activityInflatesXmlApplicationShell() {
        ActivityScenario.launch(MainActivity::class.java).use { scenario ->
            scenario.onActivity { activity ->
                assertNotNull(activity.findViewById<android.view.View>(R.id.app_root))
                assertNotNull(activity.findViewById<android.view.View>(R.id.stage_host))
                assertNotNull(activity.findViewById<android.view.View>(R.id.screen_host))
                assertNotNull(activity.findViewById<android.view.View>(R.id.bottom_navigation))
            }
        }
    }
}
