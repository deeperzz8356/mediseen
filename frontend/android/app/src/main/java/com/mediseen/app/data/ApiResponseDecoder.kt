package com.mediseen.app.data

import org.json.JSONObject

internal object ApiResponseDecoder {
    fun json(body: String): JSONObject {
        if (body.isBlank()) error("The server returned an empty response. Please try again.")
        return runCatching { JSONObject(body) }
            .getOrElse { error("The server returned an invalid response. Please try again.") }
    }

    fun errorMessage(statusCode: Int, body: String): String {
        val detail = runCatching { json(body).optString("detail") }.getOrNull()
        return detail?.takeIf(String::isNotBlank) ?: "Request failed ($statusCode)"
    }
}
