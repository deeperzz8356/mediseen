package com.mediseen.app

import com.mediseen.app.data.DietInput
import org.junit.Assert.assertEquals
import org.junit.Test

class ModelsTest {
    @Test
    fun dietInputPreservesUserPreferences() {
        val input = DietInput("Diabetes", 70.0, 170.0, 25, "female", 1.375, "maintenance", "veg", "medium")
        assertEquals("Diabetes", input.disease)
        assertEquals("veg", input.dietType)
        assertEquals("medium", input.budget)
    }
}
