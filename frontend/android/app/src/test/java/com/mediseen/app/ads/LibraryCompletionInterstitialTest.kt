package com.mediseen.app.ads

import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class LibraryCompletionInterstitialTest {
    @Test
    fun `requires three completed articles`() {
        assertFalse(isLibraryInterstitialEligible(2, 0, Long.MAX_VALUE))
        assertTrue(isLibraryInterstitialEligible(3, 0, Long.MAX_VALUE))
    }

    @Test
    fun `enforces ten minute cooldown`() {
        assertFalse(isLibraryInterstitialEligible(3, 0, 599_999L))
        assertTrue(isLibraryInterstitialEligible(3, 0, 600_000L))
    }

    @Test
    fun `limits impressions to two per day`() {
        assertTrue(isLibraryInterstitialEligible(3, 1, Long.MAX_VALUE))
        assertFalse(isLibraryInterstitialEligible(3, 2, Long.MAX_VALUE))
    }
}
