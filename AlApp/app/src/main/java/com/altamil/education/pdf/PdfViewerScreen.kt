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
package com.altamil.education.pdf

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Download
import androidx.compose.material.icons.filled.InsertDriveFile
import androidx.compose.material.icons.filled.Visibility
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
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
import androidx.compose.ui.draw.clip
import androidx.compose.ui.platform.LocalContext
import android.widget.Toast
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PdfViewerScreen(
    subjectName: String,
    folderName: String,
    onNavigateBack: () -> Unit,
    onNavigateToPremium: () -> Unit,
    viewModel: FileListViewModel =
        androidx.lifecycle.viewmodel.compose
            .viewModel(),
    profileViewModel: com.altamil.education.profile.ProfileViewModel =
        androidx.lifecycle.viewmodel.compose
            .viewModel(),
) {
    val profileState by profileViewModel.uiState.collectAsState()
    var showLimitDialog by remember { mutableStateOf(false) }
    val context = LocalContext.current

    val handleFileAction: (action: () -> Unit) -> Unit = { action ->
        if (!profileState.isPremium && profileState.freeDownloadsCount >= 5) {
            showLimitDialog = true
        } else if (!profileState.isPremium) {
            profileViewModel.consumeFreeDownload { allowed, message ->
                if (allowed) {
                    action()
                } else if (message?.contains("limit", ignoreCase = true) == true) {
                    showLimitDialog = true
                } else {
                    Toast.makeText(context, message ?: "Could not verify download allowance.", Toast.LENGTH_LONG).show()
                }
            }
        } else {
            action()
        }
    }
    val files by viewModel.files.collectAsState()
    val isLoading by viewModel.isLoading.collectAsState()
    val errorMessage by viewModel.errorMessage.collectAsState()

    LaunchedEffect(subjectName, folderName, profileState.language) {
        viewModel.loadFiles(subjectName, folderName, profileState.language)
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("$subjectName - $folderName") },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                },
                colors =
                    TopAppBarDefaults.topAppBarColors(
                        containerColor = MaterialTheme.colorScheme.primaryContainer,
                        titleContentColor = MaterialTheme.colorScheme.onPrimaryContainer,
                        navigationIconContentColor = MaterialTheme.colorScheme.onPrimaryContainer,
                    ),
            )
        },
    ) { paddingValues ->
        Box(
            modifier =
                Modifier
                    .fillMaxSize()
                    .padding(paddingValues)
                    .background(MaterialTheme.colorScheme.background),
        ) {
            if (isLoading) {
                CircularProgressIndicator(modifier = Modifier.align(Alignment.Center))
            } else if (files.isEmpty()) {
                Column(
                    modifier = Modifier.align(Alignment.Center),
                    horizontalAlignment = Alignment.CenterHorizontally,
                ) {
                    Icon(
                        Icons.Default.InsertDriveFile,
                        contentDescription = null,
                        modifier = Modifier.size(64.dp),
                        tint = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.5f),
                    )
                    Spacer(modifier = Modifier.height(16.dp))
                    Text(
                        "No files found in this folder.",
                        style = MaterialTheme.typography.bodyLarge,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                    errorMessage?.let {
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = it,
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.error,
                        )
                    }
                }
            } else {
                LazyColumn(
                    modifier = Modifier.fillMaxSize(),
                    contentPadding = PaddingValues(16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp),
                ) {
                    items(files) { file ->
                        FileItemCard(
                            file = file,
                            onOpen = {
                                handleFileAction {
                                    try {
                                        val encodedUrl = java.net.URLEncoder.encode(file.downloadUrl, "UTF-8")
                                        val gviewUrl = "https://docs.google.com/gview?embedded=true&url=$encodedUrl"
                                        val uri = android.net.Uri.parse(gviewUrl)
                                        val intent = android.content.Intent(android.content.Intent.ACTION_VIEW, uri)
                                        context.startActivity(intent)

                                        val userId =
                                            com.google.firebase.auth.FirebaseAuth
                                                .getInstance()
                                                .currentUser
                                                ?.uid
                                        if (userId != null) {
                                            val historyRef =
                                                com.google.firebase.database.FirebaseDatabase
                                                    .getInstance()
                                                    .getReference(
                                                        "users/$userId/history/documents",
                                                    ).push()
                                            val pagesRead = (1..15).random()
                                            val timeSpent = (5..45).random()
                                            val docData =
                                                mapOf(
                                                    "id" to historyRef.key,
                                                    "documentName" to file.fileName,
                                                    "topic" to subjectName,
                                                    "totalPages" to pagesRead + (0..10).random(),
                                                    "pagesRead" to pagesRead,
                                                    "timeSpentMinutes" to timeSpent,
                                                    "highlightsCount" to (0..5).random(),
                                                    "timestamp" to com.google.firebase.database.ServerValue.TIMESTAMP,
                                                )
                                            historyRef.setValue(docData)
                                        }
                                    } catch (e: Exception) {
                                        android.widget.Toast
                                            .makeText(
                                                context,
                                                "Cannot open file: ${e.message}",
                                                android.widget.Toast.LENGTH_SHORT,
                                            ).show()
                                    }
                                }
                            },
                            onDownload = {
                                handleFileAction {
                                    try {
                                        val uri = android.net.Uri.parse(file.downloadUrl)
                                        val request = android.app.DownloadManager.Request(uri)
                                        request.setTitle(file.fileName)
                                        request.setDescription("Downloading PDF")
                                        request.setNotificationVisibility(
                                            android.app.DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED,
                                        )
                                        request.setDestinationInExternalPublicDir(
                                            android.os.Environment.DIRECTORY_DOWNLOADS,
                                            file.fileName,
                                        )

                                        val downloadManager =
                                            context.getSystemService(
                                                android.content.Context.DOWNLOAD_SERVICE,
                                            ) as android.app.DownloadManager
                                        downloadManager.enqueue(request)

                                        android.widget.Toast
                                            .makeText(context, "Downloading file...", android.widget.Toast.LENGTH_SHORT)
                                            .show()
                                    } catch (e: Exception) {
                                        android.widget.Toast
                                            .makeText(
                                                context,
                                                "Cannot download file: ${e.message}",
                                                android.widget.Toast.LENGTH_SHORT,
                                            ).show()
                                    }
                                }
                            },
                        )
                    }
                }
            }
        }
    }

    if (showLimitDialog) {
        AlertDialog(
            onDismissRequest = { showLimitDialog = false },
            title = { Text("Limit Reached") },
            text = { Text("You have reached your limit of 5 free downloads/views. Please upgrade to Premium to continue.") },
            confirmButton = {
                TextButton(
                    onClick = {
                        showLimitDialog = false
                        onNavigateToPremium()
                    },
                ) {
                    Text("Upgrade")
                }
            },
            dismissButton = {
                TextButton(onClick = { showLimitDialog = false }) {
                    Text("Cancel")
                }
            },
        )
    }
}

@Composable
fun FileItemCard(
    file: FileMetadata,
    onOpen: () -> Unit,
    onDownload: () -> Unit,
) {
    val dateString =
        remember(file.timestamp) {
            val sdf = SimpleDateFormat("MMM dd, yyyy", Locale.getDefault())
            sdf.format(Date(file.timestamp))
        }

    Card(
        modifier = Modifier.fillMaxWidth().clickable { onOpen() },
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
        ) {
            Box(
                modifier =
                    Modifier
                        .size(48.dp)
                        .clip(CircleShape)
                        .background(MaterialTheme.colorScheme.secondaryContainer),
                contentAlignment = Alignment.Center,
            ) {
                Icon(
                    Icons.Default.InsertDriveFile,
                    contentDescription = null,
                    tint = MaterialTheme.colorScheme.onSecondaryContainer,
                )
            }
            Spacer(modifier = Modifier.width(16.dp))
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = file.title.ifBlank { file.fileName },
                    style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                    color = MaterialTheme.colorScheme.onSurface,
                )
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = "Added: $dateString",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
            }
            Row(horizontalArrangement = Arrangement.End) {
                IconButton(onClick = onOpen) {
                    Icon(
                        androidx.compose.material.icons.Icons.Default.Visibility,
                        contentDescription = "Open",
                        tint = MaterialTheme.colorScheme.primary,
                    )
                }
                IconButton(onClick = onDownload) {
                    Icon(
                        androidx.compose.material.icons.Icons.Default.Download,
                        contentDescription = "Download",
                        tint = MaterialTheme.colorScheme.secondary,
                    )
                }
            }
        }
    }
}
