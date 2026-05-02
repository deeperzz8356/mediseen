package com.mediseen.app

import android.content.Intent
import android.net.Uri
import androidx.health.connect.client.HealthConnectClient
import androidx.health.connect.client.permission.HealthPermission
import androidx.health.connect.client.records.StepsRecord
import androidx.health.connect.client.records.TotalCaloriesBurnedRecord
import androidx.health.connect.client.records.SleepSessionRecord
import androidx.health.connect.client.records.HeartRateRecord
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
import java.time.temporal.ChronoUnit

@CapacitorPlugin(name = "HealthConnect")
class HealthConnectPlugin : Plugin() {

    private val scope = CoroutineScope(Dispatchers.IO)
    
    private val permissions = setOf(
        HealthPermission.getReadPermission(StepsRecord::class),
        HealthPermission.getReadPermission(TotalCaloriesBurnedRecord::class),
        HealthPermission.getReadPermission(SleepSessionRecord::class),
        HealthPermission.getReadPermission(HeartRateRecord::class)
    )

    @PluginMethod
    fun checkAvailability(call: PluginCall) {
        val availability = HealthConnectClient.getSdkStatus(context)
        val res = JSObject()
        res.put("status", availability)
        call.resolve(res)
    }

    @PluginMethod
    fun requestHealthPermissions(call: PluginCall) {
        val client = HealthConnectClient.getOrCreate(context)
        scope.launch {
            try {
                val granted = client.permissionController.getGrantedPermissions()
                if (granted.containsAll(permissions)) {
                    val res = JSObject()
                    res.put("granted", true)
                    call.resolve(res)
                } else {
                    // In a real plugin, we would launch the intent here.
                    // For this custom implementation, we tell the UI it needs to trigger the intent if possible,
                    // or we can try to launch it from here using bridge.activity
                    val intent = Intent(HealthConnectClient.ACTION_HEALTH_CONNECT_SETTINGS)
                    bridge.activity.startActivity(intent)
                    
                    val res = JSObject()
                    res.put("granted", false)
                    res.put("message", "Redirecting to settings")
                    call.resolve(res)
                }
            } catch (e: Exception) {
                call.reject(e.message)
            }
        }
    }

    @PluginMethod
    fun fetchHealthData(call: PluginCall) {
        val client = HealthConnectClient.getOrCreate(context)
        val startTime = ZonedDateTime.now().minusDays(1).toInstant()
        val endTime = Instant.now()

        scope.launch {
            try {
                val response = JSObject()
                
                // Fetch Steps
                val stepsRequest = ReadRecordsRequest(
                    recordType = StepsRecord::class,
                    timeRangeFilter = TimeRangeFilter.between(startTime, endTime)
                )
                val steps = client.readRecords(stepsRequest).records.sumOf { it.count }
                response.put("steps", steps)

                // Fetch Calories
                val caloriesRequest = ReadRecordsRequest(
                    recordType = TotalCaloriesBurnedRecord::class,
                    timeRangeFilter = TimeRangeFilter.between(startTime, endTime)
                )
                val calories = client.readRecords(caloriesRequest).records.sumOf { it.energy.inKilocalories }
                response.put("caloriesBurned", calories)

                // Fetch Sleep (last session)
                val sleepRequest = ReadRecordsRequest(
                    recordType = SleepSessionRecord::class,
                    timeRangeFilter = TimeRangeFilter.between(startTime, endTime)
                )
                val sleepRecords = client.readRecords(sleepRequest).records
                if (sleepRecords.isNotEmpty()) {
                    val lastSleep = sleepRecords.last()
                    val durationHrs = java.time.Duration.between(lastSleep.startTime, lastSleep.endTime).toMinutes() / 60.0
                    response.put("sleepHours", durationHrs)
                } else {
                    response.put("sleepHours", 0)
                }

                call.resolve(response)
            } catch (e: Exception) {
                call.reject(e.message)
            }
        }
    }
}
