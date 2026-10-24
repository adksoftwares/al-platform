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

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ExitToApp
import androidx.compose.material3.Badge
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ProfileScreen(
    viewModel: ProfileViewModel = viewModel(),
    onNavigateToUpgrade: () -> Unit,
    onLogoutSuccess: () -> Unit,
) {
    val state by viewModel.uiState.collectAsState()
    var isEditing by remember { mutableStateOf(false) }
    var editDistrict by remember { mutableStateOf("") }
    var editPhone by remember { mutableStateOf("") }
    var editLanguage by remember { mutableStateOf("") }
    var languageMenuExpanded by remember { mutableStateOf(false) }

    LaunchedEffect(state) {
        if (!isEditing) {
            editDistrict = state.district
            editPhone = state.phone
            editLanguage = state.language
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("My Profile") },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = MaterialTheme.colorScheme.primaryContainer),
                actions = {
                    IconButton(onClick = {
                        viewModel.logout()
                        onLogoutSuccess()
                    }) {
                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.ExitToApp,
                            contentDescription = "Log Out",
                            tint = MaterialTheme.colorScheme.error,
                        )
                    }
                },
            )
        },
    ) { padding ->
        if (state.isLoading) {
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                CircularProgressIndicator()
            }
        } else {
            Column(
                modifier =
                    Modifier
                        .fillMaxSize()
                        .padding(padding)
                        .padding(24.dp)
                        .verticalScroll(rememberScrollState()),
                horizontalAlignment = Alignment.CenterHorizontally,
            ) {
                Spacer(modifier = Modifier.height(16.dp))
                Text(text = state.name, style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold)
                Text(text = state.email, style = MaterialTheme.typography.bodyLarge, color = Color.Gray)
                Spacer(modifier = Modifier.height(8.dp))

                if (state.isPremium) {
                    Badge(containerColor = Color(0xFFFFD700)) {
                        Text("PREMIUM ACCOUNT", color = Color.Black, modifier = Modifier.padding(4.dp))
                    }
                } else {
                    Badge(containerColor = Color.Gray) {
                        Text("FREE ACCOUNT", modifier = Modifier.padding(4.dp))
                    }
                }

                Spacer(modifier = Modifier.height(32.dp))

                OutlinedTextField(
                    value = editDistrict,
                    onValueChange = { editDistrict = it },
                    label = { Text("District") },
                    enabled = isEditing,
                    modifier = Modifier.fillMaxWidth(),
                )
                Spacer(modifier = Modifier.height(16.dp))
                OutlinedTextField(
                    value = editPhone,
                    onValueChange = { editPhone = it },
                    label = { Text("Phone Number") },
                    enabled = isEditing,
                    modifier = Modifier.fillMaxWidth(),
                )
                Spacer(modifier = Modifier.height(16.dp))

                Box(modifier = Modifier.fillMaxWidth()) {
                    OutlinedTextField(
                        value = editLanguage.replaceFirstChar { it.uppercase() },
                        onValueChange = { },
                        label = { Text("Language") },
                        enabled = false,
                        modifier =
                            Modifier.fillMaxWidth().clickable(enabled = isEditing) {
                                languageMenuExpanded = true
                            },
                        colors =
                            OutlinedTextFieldDefaults.colors(
                                disabledTextColor = MaterialTheme.colorScheme.onSurface,
                                disabledBorderColor = MaterialTheme.colorScheme.outline,
                                disabledLabelColor = MaterialTheme.colorScheme.onSurfaceVariant,
                            ),
                    )
                    DropdownMenu(
                        expanded = languageMenuExpanded,
                        onDismissRequest = { languageMenuExpanded = false },
                    ) {
                        DropdownMenuItem(
                            text = { Text("English") },
                            onClick = {
                                editLanguage = "english"
                                languageMenuExpanded = false
                            },
                        )
                        DropdownMenuItem(
                            text = { Text("Sinhala") },
                            onClick = {
                                editLanguage = "sinhala"
                                languageMenuExpanded = false
                            },
                        )
                        DropdownMenuItem(
                            text = { Text("Tamil") },
                            onClick = {
                                editLanguage = "tamil"
                                languageMenuExpanded = false
                            },
                        )
                    }
                }

                Spacer(modifier = Modifier.height(24.dp))

                if (isEditing) {
                    Button(
                        onClick = {
                            viewModel.updateProfile(editDistrict, editPhone, editLanguage)
                            isEditing = false
                        },
                        modifier = Modifier.fillMaxWidth(),
                    ) {
                        Text("Save Changes")
                    }
                } else {
                    OutlinedButton(
                        onClick = { isEditing = true },
                        modifier = Modifier.fillMaxWidth(),
                    ) {
                        Text("Edit Profile")
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                if (!state.isPremium) {
                    Button(
                        onClick = onNavigateToUpgrade,
                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFE91E63)),
                        modifier = Modifier.fillMaxWidth(),
                    ) {
                        Text("Upgrade to Premium")
                    }
                    Spacer(modifier = Modifier.height(16.dp))
                }
            }
        }
    }
}
