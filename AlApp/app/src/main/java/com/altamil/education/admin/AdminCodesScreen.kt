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

import android.widget.Toast
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.ContentCopy
import androidx.compose.material.icons.filled.Key
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalClipboardManager
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.google.firebase.database.DataSnapshot
import com.google.firebase.database.DatabaseError
import com.google.firebase.database.FirebaseDatabase
import com.google.firebase.database.ValueEventListener
import kotlinx.coroutines.launch
import kotlinx.coroutines.tasks.await
import java.security.SecureRandom

data class AccessCode(
    val code: String,
    val isUsed: Boolean,
    val usedBy: String,
    val usedAt: Long,
)

@Composable
fun AdminCodesScreen() {
    val context = LocalContext.current
    val coroutineScope = rememberCoroutineScope()
    val clipboardManager = LocalClipboardManager.current

    var codes by remember { mutableStateOf<List<AccessCode>>(emptyList()) }
    var isLoading by remember { mutableStateOf(true) }
    var isGenerating by remember { mutableStateOf(false) }

    val dbRef = FirebaseDatabase.getInstance().getReference("admin_settings/premium_codes")

    LaunchedEffect(Unit) {
        dbRef.addValueEventListener(
            object : ValueEventListener {
                override fun onDataChange(snapshot: DataSnapshot) {
                    val fetched = mutableListOf<AccessCode>()
                    for (child in snapshot.children) {
                        val code = child.key ?: continue
                        val isUsed = child.child("isUsed").getValue(Boolean::class.java) ?: false
                        val usedBy = child.child("usedBy").getValue(String::class.java) ?: ""
                        val usedAt = child.child("usedAt").getValue(Long::class.java) ?: 0L
                        fetched.add(AccessCode(code, isUsed, usedBy, usedAt))
                    }
                    codes = fetched.sortedByDescending { it.usedAt }
                    isLoading = false
                }

                override fun onCancelled(error: DatabaseError) {
                    isLoading = false
                }
            },
        )
    }

    Column(
        modifier =
            Modifier
                .fillMaxSize()
                .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
    ) {
        Text(
            text = "Access Codes",
            style = MaterialTheme.typography.headlineMedium.copy(fontWeight = FontWeight.Bold),
            color = MaterialTheme.colorScheme.onBackground,
        )
        Text(
            text = "Generate and manage premium license keys. These can be pasted into Gumroad or sold manually.",
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            Button(
                onClick = {
                    isGenerating = true
                    coroutineScope.launch {
                        try {
                            val newCodes = generateRandomCodes(10)
                            val updates = mutableMapOf<String, Any>()
                            for (c in newCodes) {
                                updates[c] =
                                    mapOf(
                                        "isUsed" to false,
                                        "usedBy" to "",
                                        "usedAt" to 0L,
                                    )
                            }
                            dbRef.updateChildren(updates).await()
                            Toast.makeText(context, "10 Codes Generated!", Toast.LENGTH_SHORT).show()
                        } catch (e: Exception) {
                            Toast.makeText(context, "Error generating codes", Toast.LENGTH_SHORT).show()
                        } finally {
                            isGenerating = false
                        }
                    }
                },
                modifier = Modifier.weight(1f).height(50.dp),
                shape = RoundedCornerShape(12.dp),
                enabled = !isGenerating,
            ) {
                if (isGenerating) {
                    CircularProgressIndicator(modifier = Modifier.size(24.dp), color = MaterialTheme.colorScheme.onPrimary)
                } else {
                    Icon(Icons.Default.Add, contentDescription = null)
                    Spacer(modifier = Modifier.size(8.dp))
                    Text("Generate 10")
                }
            }

            OutlinedButton(
                onClick = {
                    val unused = codes.filter { !it.isUsed }.joinToString("\n") { it.code }
                    if (unused.isNotEmpty()) {
                        clipboardManager.setText(AnnotatedString(unused))
                        Toast.makeText(context, "Copied Unused Codes!", Toast.LENGTH_SHORT).show()
                    } else {
                        Toast.makeText(context, "No unused codes found", Toast.LENGTH_SHORT).show()
                    }
                },
                modifier = Modifier.weight(1f).height(50.dp),
                shape = RoundedCornerShape(12.dp),
            ) {
                Icon(Icons.Default.ContentCopy, contentDescription = null)
                Spacer(modifier = Modifier.size(8.dp))
                Text("Copy Unused")
            }
        }

        if (isLoading) {
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                CircularProgressIndicator()
            }
        } else if (codes.isEmpty()) {
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Icon(
                        Icons.Default.Warning,
                        contentDescription = null,
                        modifier = Modifier.size(64.dp),
                        tint = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                    Spacer(modifier = Modifier.height(16.dp))
                    Text(
                        "No codes generated yet",
                        style = MaterialTheme.typography.titleMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                }
            }
        } else {
            LazyColumn(
                modifier = Modifier.fillMaxSize(),
                verticalArrangement = Arrangement.spacedBy(8.dp),
            ) {
                items(codes) { code ->
                    CodeCard(code, clipboardManager, context)
                }
            }
        }
    }
}

@Composable
fun CodeCard(
    code: AccessCode,
    clipboardManager: androidx.compose.ui.platform.ClipboardManager,
    context: android.content.Context,
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
    ) {
        Row(
            modifier =
                Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween,
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(Icons.Default.Key, contentDescription = null, tint = MaterialTheme.colorScheme.primary)
                Spacer(modifier = Modifier.size(16.dp))
                Column {
                    Text(code.code, style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold, letterSpacing = 1.2.sp))
                    Spacer(modifier = Modifier.height(4.dp))
                    if (code.isUsed) {
                        Surface(
                            color = MaterialTheme.colorScheme.errorContainer,
                            shape = RoundedCornerShape(4.dp),
                        ) {
                            Text(
                                "USED BY ${code.usedBy.take(8)}...",
                                style = MaterialTheme.typography.labelSmall,
                                color = MaterialTheme.colorScheme.onErrorContainer,
                                modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp),
                            )
                        }
                    } else {
                        Surface(
                            color = Color(0xFF4CAF50).copy(alpha = 0.2f),
                            shape = RoundedCornerShape(4.dp),
                        ) {
                            Text(
                                "UNUSED",
                                style = MaterialTheme.typography.labelSmall,
                                color = Color(0xFF2E7D32),
                                modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp),
                            )
                        }
                    }
                }
            }

            IconButton(onClick = {
                clipboardManager.setText(AnnotatedString(code.code))
                Toast.makeText(context, "Copied code", Toast.LENGTH_SHORT).show()
            }) {
                Icon(Icons.Default.ContentCopy, contentDescription = "Copy")
            }
        }
    }
}

fun generateRandomCodes(count: Int): List<String> {
    require(count in 1..1000) { "Code count must be between 1 and 1000." }
    val chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    val random = SecureRandom()
    val codes = LinkedHashSet<String>()
    while (codes.size < count) {
        val code = buildString(12) {
            repeat(12) { append(chars[random.nextInt(chars.length)]) }
        }
        codes.add(code)
    }
    return codes.toList()
}
