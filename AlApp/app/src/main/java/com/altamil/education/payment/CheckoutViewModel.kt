/*
 * Copyright 2026 Vincent Tsen
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package com.altamil.education.payment

import com.altamil.education.BuildConfig
import com.google.firebase.auth.FirebaseAuth
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.tasks.await
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject
import java.io.IOException
import java.util.concurrent.TimeUnit

class CheckoutViewModel : androidx.lifecycle.ViewModel() {
    private val auth = FirebaseAuth.getInstance()
    private val http = OkHttpClient.Builder()
        .connectTimeout(10, TimeUnit.SECONDS)
        .readTimeout(15, TimeUnit.SECONDS)
        .callTimeout(20, TimeUnit.SECONDS)
        .build()

    /**
     * Redeem through the trusted backend. The Android client never reads
     * premium_codes or writes isPremium/premiumExpiry directly.
     *
     * @return null on success, otherwise a safe message suitable for display.
     */
    suspend fun redeemAccessCode(code: String): String? = withContext(Dispatchers.IO) {
        val baseUrl = BuildConfig.BACKEND_BASE_URL.trim().trimEnd('/')
        if (!baseUrl.startsWith("https://")) {
            return@withContext "Premium service is not configured. Please contact support."
        }

        val user = auth.currentUser
            ?: return@withContext "You must be logged in."
        val token = try {
            user.getIdToken(false).await().token
        } catch (_: Exception) {
            null
        } ?: return@withContext "Your session expired. Please log in again."

        val payload = JSONObject().put("code", code.trim().uppercase()).toString()
            .toRequestBody("application/json; charset=utf-8".toMediaType())
        val request = Request.Builder()
            .url("$baseUrl/api/premium/redeem")
            .header("Authorization", "Bearer $token")
            .post(payload)
            .build()

        try {
            http.newCall(request).execute().use { response ->
                val responseText = response.body?.string().orEmpty()
                if (response.isSuccessful) {
                    null
                } else {
                    val message = try {
                        JSONObject(responseText).optString("error")
                    } catch (_: Exception) {
                        ""
                    }
                    message.ifBlank { "Could not verify the access code. Please try again." }
                }
            }
        } catch (_: IOException) {
            "Could not connect to the premium service. Check your internet connection and try again."
        }
    }
}
