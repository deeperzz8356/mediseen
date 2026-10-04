package com.mediseen.app.ads

import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class MonetizationRulesTest {
    @Test
    fun `short system UI hops are not foreground sessions`() {
        assertFalse(isRealForegroundTransition(29_999L))
        assertTrue(isRealForegroundTransition(30_000L))
    }

    @Test
    fun `app open waits for third foreground`() {
        assertFalse(isAppOpenEligible(2, Long.MAX_VALUE))
        assertTrue(isAppOpenEligible(3, Long.MAX_VALUE))
    }

    @Test
    fun `app open respects four hour cooldown`() {
        assertFalse(isAppOpenEligible(3, 14_399_999L))
        assertTrue(isAppOpenEligible(3, 14_400_000L))
    }

    @Test
    fun `daily scan is available until used`() {
        assertTrue(hasScanAccess(null, "2026-09-27", 0))
        assertFalse(hasScanAccess("2026-09-27", "2026-09-27", 0))
    }

    @Test
    fun `reward credit restores scan access after daily scan`() {
        assertTrue(hasScanAccess("2026-09-27", "2026-09-27", 1))
    }
}
