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
package com.altamil.education.profile

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.altamil.education.BuildConfig
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.database.DataSnapshot
import com.google.firebase.database.DatabaseError
import com.google.firebase.database.FirebaseDatabase
import com.google.firebase.database.ValueEventListener
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import kotlinx.coroutines.tasks.await
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject
import java.io.IOException
import java.util.concurrent.TimeUnit

data class UserProfileState(
    val name: String = "",
    val email: String = "",
    val district: String = "",
    val phone: String = "",
    val language: String = "tamil",
    val isPremium: Boolean = false,
    val freeDownloadsCount: Int = 0,
    val isLoading: Boolean = true,
)

class ProfileViewModel : ViewModel() {
    private val auth = FirebaseAuth.getInstance()
    private val database = FirebaseDatabase.getInstance().getReference("users")
    private val http = OkHttpClient.Builder()
        .connectTimeout(10, TimeUnit.SECONDS)
        .readTimeout(15, TimeUnit.SECONDS)
        .callTimeout(20, TimeUnit.SECONDS)
        .build()

    private val _uiState = MutableStateFlow(UserProfileState())
    val uiState: StateFlow<UserProfileState> = _uiState

    init {
        loadUserProfile()
    }

    private fun loadUserProfile() {
        val userId = auth.currentUser?.uid ?: return

        database.child(userId).addValueEventListener(
            object : ValueEventListener {
                override fun onDataChange(snapshot: DataSnapshot) {
                    if (snapshot.exists()) {
                        val dbIsPremium = snapshot.child("isPremium").value as? Boolean ?: false
                        val expiry = snapshot.child("premiumExpiry").value as? Long ?: 0L
                        val isPremium = dbIsPremium && (expiry == 0L || expiry > System.currentTimeMillis())

                        _uiState.value =
                            UserProfileState(
                                name = snapshot.child("name").value?.toString() ?: "",
                                email = snapshot.child("email").value?.toString() ?: "",
                                district = snapshot.child("district").value?.toString() ?: "",
                                phone = snapshot.child("phone").value?.toString() ?: "",
                                language = snapshot.child("language").value?.toString() ?: "tamil",
                                isPremium = isPremium,
                                freeDownloadsCount = (snapshot.child("freeDownloadsCount").value as? Long)?.toInt() ?: 0,
                                isLoading = false,
                            )
                    } else {
                        _uiState.value = _uiState.value.copy(isLoading = false)
                    }
                }

                override fun onCancelled(error: DatabaseError) {
                    _uiState.value = _uiState.value.copy(isLoading = false)
                }
            },
        )
    }

    fun updateProfile(
        newDistrict: String,
        newPhone: String,
        newLanguage: String,
    ) {
        val userId = auth.currentUser?.uid ?: return
        val updates =
            mapOf<String, Any>(
                "district" to newDistrict,
                "phone" to newPhone,
                "language" to newLanguage,
            )

        database.child(userId).updateChildren(updates).addOnSuccessListener {
            _uiState.value = _uiState.value.copy(district = newDistrict, phone = newPhone, language = newLanguage)
        }
    }

    fun consumeFreeDownload(onResult: (allowed: Boolean, message: String?) -> Unit) {
        val user = auth.currentUser
        if (user == null) {
            onResult(false, "You must be logged in.")
            return
        }

        viewModelScope.launch {
            try {
                val baseUrl = BuildConfig.BACKEND_BASE_URL.trim().trimEnd('/')
                if (!baseUrl.startsWith("https://")) {
                    onResult(false, "Secure download service is not configured.")
                    return@launch
                }
                val token = user.getIdToken(false).await().token
                    ?: run {
                        onResult(false, "Your session expired. Please log in again.")
                        return@launch
                    }
                val requestBody = "{}".toRequestBody("application/json; charset=utf-8".toMediaType())
                val request = Request.Builder()
                    .url("$baseUrl/api/downloads/consume")
                    .header("Authorization", "Bearer $token")
                    .post(requestBody)
                    .build()

                val result = withContext(Dispatchers.IO) {
                    http.newCall(request).execute().use { response ->
                        val raw = response.body?.string().orEmpty()
                        val json = try { JSONObject(raw) } catch (_: Exception) { JSONObject() }
                        Triple(response.code, json.optBoolean("allowed", false), json.optString("error").takeIf { it.isNotBlank() })
                            .let { Triple(it.first, it.second, it.third to json.optInt("count", -1)) }
                    }
                }

                val status = result.first
                val allowed = result.second
                val message = result.third.first
                val count = result.third.second
                if (count >= 0) _uiState.value = _uiState.value.copy(freeDownloadsCount = count)

                if (status in 200..299 && allowed) {
                    onResult(true, null)
                } else {
                    onResult(false, message ?: "Could not verify download allowance.")
                }
            } catch (_: IOException) {
                onResult(false, "Could not connect to the secure download service.")
            } catch (_: Exception) {
                onResult(false, "Could not verify download allowance.")
            }
        }
    }

    fun logout() {
        auth.signOut()
    }
}
