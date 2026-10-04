package com.mediseen.app.data

import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class ApiResponseDecoderTest {
    @Test
    fun emptySuccessfulResponseHasActionableFailure() {
        val failure = runCatching { ApiResponseDecoder.json("") }.exceptionOrNull()

        assertTrue(failure is IllegalStateException)
        assertEquals("The server returned an empty response. Please try again.", failure?.message)
    }

    @Test
    fun nonJsonSuccessfulResponseHasActionableFailure() {
        val failure = runCatching { ApiResponseDecoder.json("service temporarily unavailable") }.exceptionOrNull()

        assertTrue(failure is IllegalStateException)
        assertEquals("The server returned an invalid response. Please try again.", failure?.message)
    }

    @Test
    fun structuredServerErrorUsesItsDetail() {
        assertEquals("Image format is not supported", ApiResponseDecoder.errorMessage(400, "{\"detail\":\"Image format is not supported\"}"))
    }
}
