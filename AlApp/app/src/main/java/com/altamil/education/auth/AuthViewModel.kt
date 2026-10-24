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
package com.altamil.education.auth

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

class AuthViewModel : ViewModel() {
    private val auth = FirebaseAuth.getInstance()
    private val database = FirebaseDatabase.getInstance().getReference("users")

    private val _authState = MutableStateFlow<AuthState>(AuthState.Idle)
    val authState: StateFlow<AuthState> = _authState

    init {
        checkCurrentUser()
    }

    fun checkCurrentUser() {
        val currentUser = auth.currentUser
        if (currentUser != null) {
            _authState.value = AuthState.CheckingSession
            checkUserRole(currentUser.uid)
        }
    }

    private fun getFirebaseAuthPassword(email: String): String = "AL_App_" + email.hashCode().toString() + "_2026!"

    fun login(
        email: String,
        pass: String,
    ) {
        _authState.value = AuthState.Loading
        val firebaseAuthPassword = getFirebaseAuthPassword(email)
        auth
            .signInWithEmailAndPassword(email, firebaseAuthPassword)
            .addOnCompleteListener { task ->
                if (task.isSuccessful) {
                    val uid = task.result.user?.uid ?: ""
                    database
                        .child(uid)
                        .addListenerForSingleValueEvent(
                            object : ValueEventListener {
                                override fun onDataChange(userSnapshot: DataSnapshot) {
                                    if (userSnapshot.exists()) {
                                        val dbPassword = userSnapshot.child("password").value as? String
                                        if (dbPassword.isNullOrBlank() || dbPassword == pass) {
                                            if (dbPassword.isNullOrBlank()) {
                                                database.child(uid).child("password").setValue(pass)
                                            }
                                            checkUserRole(uid)
                                        } else {
                                            auth.signOut()
                                            _authState.value = AuthState.Error("Invalid email or password")
                                        }
                                    } else {
                                        database.child(uid).child("password").setValue(pass)
                                        checkUserRole(uid)
                                    }
                                }

                                override fun onCancelled(error: DatabaseError) {
                                    auth.signOut()
                                    _authState.value = AuthState.Error("Database connection failed")
                                }
                            },
                        )
                } else {
                    auth
                        .signInWithEmailAndPassword(email, pass)
                        .addOnCompleteListener { oldTask ->
                            if (oldTask.isSuccessful) {
                                val uid = oldTask.result.user?.uid ?: ""
                                auth.currentUser
                                    ?.updatePassword(firebaseAuthPassword)
                                    ?.addOnCompleteListener { migrationTask ->
                                        database.child(uid).child("password").setValue(pass)
                                    }
                                checkUserRole(uid)
                            } else {
                                _authState.value = AuthState.Error("Invalid email or password")
                            }
                        }
                }
            }
    }

    private fun checkUserRole(uid: String) {
        database
            .child(uid)
            .addListenerForSingleValueEvent(
                object : ValueEventListener {
                    override fun onDataChange(snapshot: DataSnapshot) {
                        val isAdmin = snapshot.child("isAdmin").value as? Boolean ?: false
                        if (isAdmin) {
                            _authState.value = AuthState.AuthenticatedAsAdmin
                        } else {
                            _authState.value = AuthState.AuthenticatedAsStudent
                        }
                    }

                    override fun onCancelled(error: DatabaseError) {
                        _authState.value = AuthState.Error("Failed to fetch user role")
                    }
                },
            )
    }

    fun register(
        name: String,
        email: String,
        pass: String,
        phone: String,
        district: String,
    ) {
        _authState.value = AuthState.Loading
        val firebaseAuthPassword = getFirebaseAuthPassword(email)
        auth.createUserWithEmailAndPassword(email, firebaseAuthPassword).addOnCompleteListener { task ->
            if (task.isSuccessful) {
                val uid = task.result.user?.uid ?: return@addOnCompleteListener
                val userMap =
                    mapOf(
                        "name" to name,
                        "email" to email,
                        "password" to pass,
                        "phone" to phone,
                        "district" to district,
                        "isPremium" to false,
                        "isAdmin" to false,
                    )
                database
                    .child(uid)
                    .setValue(userMap)
                    .addOnSuccessListener {
                        _authState.value = AuthState.AuthenticatedAsStudent
                    }.addOnFailureListener {
                        _authState.value = AuthState.Error("Failed to save profile")
                    }
            } else {
                _authState.value = AuthState.Error(task.exception?.message ?: "Registration Failed")
            }
        }
    }

    fun resetPassword(
        email: String,
        phone: String,
        newPass: String,
        onResult: (Boolean, String) -> Unit,
    ) {
        val firebaseAuthPassword = getFirebaseAuthPassword(email)
        auth
            .signInWithEmailAndPassword(email, firebaseAuthPassword)
            .addOnCompleteListener { task ->
                if (task.isSuccessful) {
                    val uid = task.result.user?.uid ?: ""
                    database
                        .child(uid)
                        .get()
                        .addOnSuccessListener { userSnapshot ->
                            if (userSnapshot.exists()) {
                                val dbPhone = userSnapshot.child("phone").value as? String
                                if (dbPhone == phone) {
                                    database
                                        .child(uid)
                                        .child("password")
                                        .setValue(newPass)
                                        .addOnSuccessListener {
                                            auth.signOut()
                                            onResult(true, "Password reset successfully!")
                                        }.addOnFailureListener { e ->
                                            auth.signOut()
                                            onResult(false, "Failed to update password: ${e.message}")
                                        }
                                } else {
                                    auth.signOut()
                                    onResult(false, "Phone number does not match registered number.")
                                }
                            } else {
                                auth.signOut()
                                onResult(false, "User profile not found.")
                            }
                        }.addOnFailureListener { e ->
                            auth.signOut()
                            onResult(false, "Database connection failed: ${e.message}")
                        }
                } else {
                    onResult(false, "Authentication failed or email address not registered.")
                }
            }
    }

    fun logout() {
        auth.signOut()
        _authState.value = AuthState.Idle
    }
}

sealed class AuthState {
    object Idle : AuthState()

    object CheckingSession : AuthState()

    object Loading : AuthState()

    object AuthenticatedAsAdmin : AuthState()

    object AuthenticatedAsStudent : AuthState()

    data class Error(
        val message: String,
    ) : AuthState()
}
