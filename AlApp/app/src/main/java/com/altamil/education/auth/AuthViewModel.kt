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
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.FirebaseAuthInvalidUserException
import com.google.firebase.auth.FirebaseUser
import com.google.firebase.database.DataSnapshot
import com.google.firebase.database.DatabaseError
import com.google.firebase.database.FirebaseDatabase
import com.google.firebase.database.ValueEventListener

class AuthViewModel : ViewModel() {
    private val auth = FirebaseAuth.getInstance()
    private val database = FirebaseDatabase.getInstance().getReference("users")

    private val _authState = kotlinx.coroutines.flow.MutableStateFlow<AuthState>(AuthState.Idle)
    val authState: kotlinx.coroutines.flow.StateFlow<AuthState> = _authState

    init {
        checkCurrentUser()
    }

    fun checkCurrentUser() {
        val currentUser = auth.currentUser
        if (currentUser == null) {
            _authState.value = AuthState.Idle
        } else {
            _authState.value = AuthState.CheckingSession
            checkUserRole(currentUser)
        }
    }

    fun login(email: String, pass: String) {
        val cleanEmail = email.trim().lowercase()
        if (cleanEmail.isBlank() || pass.isBlank()) {
            _authState.value = AuthState.Error("Enter your email address and password.")
            return
        }
        _authState.value = AuthState.Loading
        auth.signInWithEmailAndPassword(cleanEmail, pass)
            .addOnCompleteListener { task ->
                if (task.isSuccessful) {
                    task.result.user?.let(::checkUserRole)
                        ?: run { _authState.value = AuthState.Error("Could not load your account.") }
                } else {
                    _authState.value = AuthState.Error(
                        "Invalid email or password. If this is an older account, use the email password-reset link.",
                    )
                }
            }
    }

    private fun checkUserRole(user: FirebaseUser) {
        // Authorization comes only from a server-issued custom claim, never from
        // the client-editable users/{uid}/isAdmin database field.
        user.getIdTokenResult(true)
            .addOnSuccessListener { tokenResult ->
                _authState.value =
                    if (tokenResult.claims["admin"] == true) {
                        AuthState.AuthenticatedAsAdmin
                    } else {
                        AuthState.AuthenticatedAsStudent
                    }
            }
            .addOnFailureListener {
                _authState.value = AuthState.Error("Could not verify account permissions. Check your connection and retry.")
            }
    }

    fun register(name: String, email: String, pass: String, phone: String, district: String) {
        val cleanEmail = email.trim().lowercase()
        if (name.isBlank() || cleanEmail.isBlank() || pass.length < 6) {
            _authState.value = AuthState.Error("Enter your name, a valid email, and a password of at least 6 characters.")
            return
        }

        _authState.value = AuthState.Loading
        auth.createUserWithEmailAndPassword(cleanEmail, pass)
            .addOnCompleteListener { task ->
                if (!task.isSuccessful) {
                    _authState.value = AuthState.Error(task.exception?.localizedMessage ?: "Registration failed.")
                    return@addOnCompleteListener
                }

                val user = task.result.user
                if (user == null) {
                    _authState.value = AuthState.Error("Could not create your account.")
                    return@addOnCompleteListener
                }

                val userMap = mapOf(
                    "name" to name.trim(),
                    "email" to cleanEmail,
                    "phone" to phone.trim(),
                    "district" to district.trim(),
                    "language" to "tamil",
                    "isPremium" to false,
                    "freeDownloadsCount" to 0,
                )
                database.child(user.uid).setValue(userMap)
                    .addOnSuccessListener { _authState.value = AuthState.AuthenticatedAsStudent }
                    .addOnFailureListener {
                        user.delete().addOnCompleteListener {
                            auth.signOut()
                            _authState.value = AuthState.Error("Could not save your profile. Please try registering again.")
                        }
                    }
            }
    }

    fun resetPassword(email: String, onResult: (Boolean, String) -> Unit) {
        val cleanEmail = email.trim().lowercase()
        if (cleanEmail.isBlank()) {
            onResult(false, "Enter your registered email address.")
            return
        }

        auth.sendPasswordResetEmail(cleanEmail)
            .addOnCompleteListener { task ->
                if (task.isSuccessful || task.exception is FirebaseAuthInvalidUserException) {
                    onResult(true, "If an account exists for this email, a password-reset link has been sent.")
                } else {
                    onResult(false, "Could not send the reset email. Check the address and try again.")
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
    data class Error(val message: String) : AuthState()
}
