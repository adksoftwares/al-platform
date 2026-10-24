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
package com.altamil.education.admin

import androidx.lifecycle.ViewModel
import com.google.firebase.database.DataSnapshot
import com.google.firebase.database.DatabaseError
import com.google.firebase.database.FirebaseDatabase
import com.google.firebase.database.ValueEventListener
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow

data class AdminUserItem(
    val uid: String,
    val name: String,
    val email: String,
    val isPremium: Boolean,
)

class AdminDashboardViewModel : ViewModel() {
    private val database = FirebaseDatabase.getInstance().getReference("users")

    private val _usersList = MutableStateFlow<List<AdminUserItem>>(emptyList())
    val usersList: StateFlow<List<AdminUserItem>> = _usersList

    private val _isLoading = MutableStateFlow(true)
    val isLoading: StateFlow<Boolean> = _isLoading

    init {
        loadUsers()
    }

    private fun loadUsers() {
        _isLoading.value = true
        database.addValueEventListener(
            object : ValueEventListener {
                override fun onDataChange(snapshot: DataSnapshot) {
                    val list = mutableListOf<AdminUserItem>()
                    for (userSnapshot in snapshot.children) {
                        val uid = userSnapshot.key ?: continue
                        val name = userSnapshot.child("name").value?.toString() ?: "Unknown"
                        val email = userSnapshot.child("email").value?.toString() ?: "No Email"
                        val dbIsPremium = userSnapshot.child("isPremium").value as? Boolean ?: false
                        val expiry = userSnapshot.child("premiumExpiry").value as? Long ?: 0L
                        val isPremium = dbIsPremium && expiry > System.currentTimeMillis()

                        list.add(AdminUserItem(uid, name, email, isPremium))
                    }
                    _usersList.value = list
                    _isLoading.value = false
                }

                override fun onCancelled(error: DatabaseError) {
                    _isLoading.value = false
                }
            },
        )
    }

    fun togglePremiumStatus(
        uid: String,
        currentStatus: Boolean,
    ) {
        val newStatus = !currentStatus
        if (newStatus) {
            database.child(uid).child("isPremium").setValue(true)
            database.child(uid).child("premiumExpiry").removeValue()
        } else {
            database.child(uid).child("isPremium").setValue(false)
            database.child(uid).child("premiumExpiry").removeValue()
        }
    }
}
