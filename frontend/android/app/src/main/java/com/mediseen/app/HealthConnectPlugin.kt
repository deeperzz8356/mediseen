package com.mediseen.app

import android.content.Intent
import androidx.health.connect.client.HealthConnectClient
import androidx.health.connect.client.permission.HealthPermission
import androidx.health.connect.client.records.HeartRateRecord
import androidx.health.connect.client.records.SleepSessionRecord
import androidx.health.connect.client.records.StepsRecord
import androidx.health.connect.client.records.TotalCaloriesBurnedRecord
import androidx.health.connect.client.request.ReadRecordsRequest
import androidx.health.connect.client.time.TimeRangeFilter
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import java.time.Instant
import java.time.ZonedDateTime

/**
 * HealthConnectPlugin – Capacitor bridge for Google Health Connect
 *
 * Compatibility:
 * - Always check SDK availability before calling getOrCreate()
 * - Availability codes: SDK_UNAVAILABLE, SDK_UNAVAILABLE_PROVIDER_UPDATE_REQUIRED, SDK_AVAILABLE
 * - Never crashes app on unsupported devices – returns graceful error payloads
 * - Requires minSdk 26 (Android 8+) for Instant / ZonedDateTime
 */
@CapacitorPlugin(name = "HealthConnect")
class HealthConnectPlugin : Plugin() {

    private val scope = CoroutineScope(Dispatchers.IO)

    private val permissions = setOf(
        HealthPermission.getReadPermission(StepsRecord::class),
        HealthPermission.getReadPermission(TotalCaloriesBurnedRecord::class),
        HealthPermission.getReadPermission(SleepSessionRecord::class),
        HealthPermission.getReadPermission(HeartRateRecord::class)
    )

    // ── Availability check ────────────────────────────────────────────
    @PluginMethod
    fun checkAvailability(call: PluginCall) {
        val status = HealthConnectClient.getSdkStatus(context)
        val res = JSObject()
        res.put("status", status)                        // 0=unavailable, 1=update needed, 2=available
        res.put("available", status == HealthConnectClient.SDK_AVAILABLE)
        res.put("needsUpdate", status == HealthConnectClient.SDK_UNAVAILABLE_PROVIDER_UPDATE_REQUIRED)
        call.resolve(res)
    }

    // ── Permission request ────────────────────────────────────────────
    @PluginMethod
    fun requestHealthPermissions(call: PluginCall) {
        if (!isAvailable()) {
            call.resolve(unavailablePayload())
            return
        }

        scope.launch {
            try {
                val client = HealthConnectClient.getOrCreate(context)
                val granted = client.permissionController.getGrantedPermissions()

                val res = JSObject()
                if (granted.containsAll(permissions)) {
                    res.put("granted", true)
                    call.resolve(res)
                } else {
                    // Launch Health Connect settings so user can grant permissions
                    val intent = Intent(HealthConnectClient.ACTION_HEALTH_CONNECT_SETTINGS)
                    bridge.activity.startActivity(intent)
                    res.put("granted", false)
                    res.put("message", "Redirecting to Health Connect settings")
                    call.resolve(res)
                }
            } catch (e: Exception) {
                val res = JSObject()
                res.put("granted", false)
                res.put("error", e.message ?: "Unknown error")
                call.resolve(res)
            }
        }
    }

    // ── Fetch health data ─────────────────────────────────────────────
    @PluginMethod
    fun fetchHealthData(call: PluginCall) {
        if (!isAvailable()) {
            call.resolve(unavailablePayload())
            return
        }

        val startTime = ZonedDateTime.now().minusDays(1).toInstant()
        val endTime = Instant.now()

        scope.launch {
            try {
                val client = HealthConnectClient.getOrCreate(context)
                val response = JSObject()

                // Steps
                val steps = client.readRecords(
                    ReadRecordsRequest(StepsRecord::class, TimeRangeFilter.between(startTime, endTime))
                ).records.sumOf { it.count }
                response.put("steps", steps)

                // Calories
                val calories = client.readRecords(
                    ReadRecordsRequest(TotalCaloriesBurnedRecord::class, TimeRangeFilter.between(startTime, endTime))
                ).records.sumOf { it.energy.inKilocalories }
                response.put("caloriesBurned", calories)

                // Sleep
                val sleepRecords = client.readRecords(
                    ReadRecordsRequest(SleepSessionRecord::class, TimeRangeFilter.between(startTime, endTime))
                ).records
                val sleepHours = if (sleepRecords.isNotEmpty()) {
                    java.time.Duration.between(
                        sleepRecords.last().startTime, sleepRecords.last().endTime
                    ).toMinutes() / 60.0
                } else 0.0
                response.put("sleepHours", sleepHours)

                response.put("available", true)
                call.resolve(response)

            } catch (e: Exception) {
                val res = JSObject()
                res.put("available", true)
                res.put("error", e.message ?: "Failed to read health data")
                call.resolve(res)
            }
        }
    }

    // ── Helpers ───────────────────────────────────────────────────────
    private fun isAvailable(): Boolean =
        HealthConnectClient.getSdkStatus(context) == HealthConnectClient.SDK_AVAILABLE

    private fun unavailablePayload(): JSObject {
        val res = JSObject()
        res.put("available", false)
        res.put("granted", false)
        res.put("steps", 0)
        res.put("caloriesBurned", 0)
        res.put("sleepHours", 0)
        res.put("message", "Health Connect is not available on this device")
        return res
    }
}
