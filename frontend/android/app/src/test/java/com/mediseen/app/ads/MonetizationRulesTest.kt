package com.mediseen.app.ads

import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class MonetizationRulesTest {
    @Test
    fun `daily scan is available until used`() {
        assertTrue(hasScanAccess(null, "2026-09-27", 0))
        assertFalse(hasScanAccess("2026-09-27", "2026-09-27", 0))
    }

    @Test
    fun `reward credit restores scan access after daily scan`() {
        assertTrue(hasScanAccess("2026-09-27", "2026-09-27", 1))
    }

    @Test
    fun `recurring interstitial interval is thirty seconds`() {
        assertFalse(isRecurringInterstitialInterval(29_999L))
        assertTrue(isRecurringInterstitialInterval(30_000L))
    }

    @Test
    fun `assistant offers five free questions then accepts reward credits`() {
        assertTrue(hasAssistantAccess(4, 0))
        assertFalse(hasAssistantAccess(5, 0))
        assertTrue(hasAssistantAccess(5, 1))
    }
}
