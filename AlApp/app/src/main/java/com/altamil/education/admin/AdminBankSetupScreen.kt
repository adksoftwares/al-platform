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

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Business
import androidx.compose.material.icons.filled.Link
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.google.firebase.database.FirebaseDatabase
import kotlinx.coroutines.launch
import kotlinx.coroutines.tasks.await

@Composable
fun AdminBankSetupScreen() {
    var geminiApiKey by remember { mutableStateOf("") }
    var telegramNumber by remember { mutableStateOf("") }

    val context = LocalContext.current
    val coroutineScope = rememberCoroutineScope()

    LaunchedEffect(Unit) {
        try {
            val geminiSnapshot =
                FirebaseDatabase
                    .getInstance()
                    .getReference("admin_settings/gemini_api_key")
                    .get()
                    .await()
            if (geminiSnapshot.exists()) {
                geminiApiKey = geminiSnapshot.getValue(String::class.java) ?: ""
            }

            val paymentSnapshot =
                FirebaseDatabase
                    .getInstance()
                    .getReference("admin_settings/payment_config")
                    .get()
                    .await()
            if (paymentSnapshot.exists()) {
                telegramNumber = paymentSnapshot.child("telegramNumber").getValue(String::class.java) ?: ""
            }
        } catch (e: Exception) {
            // Ignore error on initial load
        }
    }

    Column(
        modifier =
            Modifier
                .fillMaxSize()
                .padding(16.dp)
                .verticalScroll(rememberScrollState()),
        verticalArrangement = Arrangement.spacedBy(16.dp),
    ) {
        Text(
            text = "Platform Settings",
            style = MaterialTheme.typography.headlineMedium.copy(fontWeight = FontWeight.Bold),
            color = MaterialTheme.colorScheme.onBackground,
        )
        Text(
            text = "Configure external links and API integrations.",
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )

        // Payment Config Card
        Card(
            modifier = Modifier.fillMaxWidth(),
            elevation = CardDefaults.cardElevation(defaultElevation = 4.dp),
            shape = RoundedCornerShape(8.dp),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        ) {
            Column(modifier = Modifier.padding(20.dp), verticalArrangement = Arrangement.spacedBy(16.dp)) {
                Text(
                    text = "Payment Gateway Settings",
                    style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Bold),
                    color = MaterialTheme.colorScheme.primary,
                )
                Text(
                    text = "Configure the phone number that students will contact on Telegram to send their bank transfer receipt.",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )

                OutlinedTextField(
                    value = telegramNumber,
                    onValueChange = { telegramNumber = it },
                    label = { Text("Admin Telegram Number (e.g. 0723440137)") },
                    leadingIcon = { Icon(Icons.Default.Link, contentDescription = null) },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                )

                Button(
                    onClick = {
                        coroutineScope.launch {
                            try {
                                val data =
                                    mapOf(
                                        "telegramNumber" to telegramNumber,
                                    )
                                FirebaseDatabase
                                    .getInstance()
                                    .getReference("admin_settings/payment_config")
                                    .setValue(data)
                                    .await()
                                android.widget.Toast
                                    .makeText(context, "Telegram Settings Saved!", android.widget.Toast.LENGTH_SHORT)
                                    .show()
                            } catch (e: Exception) {
                                android.widget.Toast
                                    .makeText(
                                        context,
                                        "Failed to save: ${e.message}",
                                        android.widget.Toast.LENGTH_LONG,
                                    ).show()
                            }
                        }
                    },
                    modifier = Modifier.fillMaxWidth().height(50.dp),
                    shape = RoundedCornerShape(12.dp),
                ) {
                    Text("Save Telegram Config", style = MaterialTheme.typography.titleMedium)
                }
            }
        }

        // Gemini API Key Card
        Card(
            modifier = Modifier.fillMaxWidth(),
            elevation = CardDefaults.cardElevation(defaultElevation = 4.dp),
            shape = RoundedCornerShape(8.dp),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        ) {
            Column(modifier = Modifier.padding(20.dp), verticalArrangement = Arrangement.spacedBy(16.dp)) {
                Text(
                    text = "AI Integration Settings",
                    style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Bold),
                    color = MaterialTheme.colorScheme.primary,
                )

                OutlinedTextField(
                    value = geminiApiKey,
                    onValueChange = { geminiApiKey = it },
                    label = { Text("Gemini API Key") },
                    leadingIcon = { Icon(Icons.Default.Business, contentDescription = null) },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                )

                Button(
                    onClick = {
                        if (geminiApiKey.isNotBlank()) {
                            coroutineScope.launch {
                                try {
                                    FirebaseDatabase
                                        .getInstance()
                                        .getReference("admin_settings/gemini_api_key")
                                        .setValue(geminiApiKey)
                                        .await()
                                    android.widget.Toast
                                        .makeText(
                                            context,
                                            "Gemini API Key Saved!",
                                            android.widget.Toast.LENGTH_SHORT,
                                        ).show()
                                } catch (e: Exception) {
                                    android.widget.Toast
                                        .makeText(
                                            context,
                                            "Failed to save: ${e.message}",
                                            android.widget.Toast.LENGTH_LONG,
                                        ).show()
                                }
                            }
                        } else {
                            android.widget.Toast
                                .makeText(context, "Please enter API Key", android.widget.Toast.LENGTH_SHORT)
                                .show()
                        }
                    },
                    modifier = Modifier.fillMaxWidth().height(50.dp),
                    shape = RoundedCornerShape(12.dp),
                ) {
                    Text("Save Gemini API Key", style = MaterialTheme.typography.titleMedium)
                }
            }
        }
    }
}
