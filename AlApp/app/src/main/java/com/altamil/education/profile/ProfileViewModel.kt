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
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.database.DataSnapshot
import com.google.firebase.database.DatabaseError
import com.google.firebase.database.FirebaseDatabase
import com.google.firebase.database.ValueEventListener
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import kotlinx.coroutines.tasks.await

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

    fun incrementDownloadCount() {
        val userId = auth.currentUser?.uid ?: return
        val currentCount = _uiState.value.freeDownloadsCount
        val newCount = currentCount + 1

        database.child(userId).child("freeDownloadsCount").setValue(newCount).addOnSuccessListener {
            _uiState.value = _uiState.value.copy(freeDownloadsCount = newCount)
        }
    }

    fun logout() {
        auth.signOut()
    }
}
