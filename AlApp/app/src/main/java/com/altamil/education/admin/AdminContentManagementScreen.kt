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

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
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
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowDropDown
import androidx.compose.material.icons.filled.AttachFile
import androidx.compose.material.icons.filled.Book
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Download
import androidx.compose.material.icons.filled.Folder
import androidx.compose.material.icons.filled.Language
import androidx.compose.material.icons.filled.Title
import androidx.compose.material.icons.filled.Upload
import androidx.compose.material.icons.filled.Visibility
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.ExposedDropdownMenuBox
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.altamil.education.pdf.FileListViewModel
import kotlinx.coroutines.launch
import kotlinx.coroutines.tasks.await

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AdminContentManagementScreen(fileViewModel: FileListViewModel = viewModel()) {
    var subjectExpanded by remember { mutableStateOf(false) }
    var selectedSubject by remember { mutableStateOf("biology") }
    val subjects = listOf("biology", "chemistry", "physics", "combined maths")

    var languageExpanded by remember { mutableStateOf(false) }
    var selectedLanguage by remember { mutableStateOf("tamil") }
    val languages = listOf("english", "sinhala", "tamil")

    var folderExpanded by remember { mutableStateOf(false) }
    var selectedFolder by remember { mutableStateOf("elaborations") }
    val folders = listOf("elaborations", "past papers", "model papers")

    var fileTitle by remember { mutableStateOf("") }
    var fileUrl by remember { mutableStateOf("") }
    var isUploading by remember { mutableStateOf(false) }

    val context = LocalContext.current
    val coroutineScope = rememberCoroutineScope()

    val liveFiles by fileViewModel.files.collectAsState()
    val isLoading by fileViewModel.isLoading.collectAsState()

    val selectedFiles = remember { mutableStateListOf<com.altamil.education.pdf.FileMetadata>() }
    var showDeleteDialog by remember { mutableStateOf(false) }
    var filesToDelete by remember { mutableStateOf<List<com.altamil.education.pdf.FileMetadata>>(emptyList()) }
    var isDeleting by remember { mutableStateOf(false) }
    var githubToken by remember { mutableStateOf("") }

    LaunchedEffect(Unit) {
        val dbRef =
            com.google.firebase.database.FirebaseDatabase
                .getInstance()
                .getReference("admin_settings/github_token")
        dbRef.get().addOnSuccessListener { snapshot ->
            githubToken = snapshot.getValue(String::class.java) ?: ""
        }
    }

    LaunchedEffect(selectedLanguage, selectedSubject, selectedFolder) {
        selectedFiles.clear()
        fileViewModel.loadFiles(selectedSubject, selectedFolder, selectedLanguage)
    }

    if (showDeleteDialog) {
        androidx.compose.material3.AlertDialog(
            onDismissRequest = { if (!isDeleting) showDeleteDialog = false },
            title = { Text("Confirm Deletion") },
            text = {
                Column {
                    Text("Are you sure you want to delete ${filesToDelete.size} file(s) from GitHub? This action cannot be undone.")
                    if (githubToken.isBlank()) {
                        Spacer(modifier = Modifier.height(16.dp))
                        androidx.compose.material3.OutlinedTextField(
                            value = githubToken,
                            onValueChange = { githubToken = it },
                            label = { Text("GitHub Token Required") },
                            modifier = Modifier.fillMaxWidth(),
                        )
                    }
                }
            },
            confirmButton = {
                TextButton(
                    onClick = {
                        if (githubToken.isBlank()) {
                            android.widget.Toast
                                .makeText(
                                    context,
                                    "GitHub Token not found in Firebase admin_settings!",
                                    android.widget.Toast.LENGTH_LONG,
                                ).show()
                            return@TextButton
                        }
                        com.google.firebase.database.FirebaseDatabase
                            .getInstance()
                            .getReference("admin_settings/github_token")
                            .setValue(githubToken)
                        isDeleting = true
                        fileViewModel.deleteFilesFromGitHub(
                            filesToDelete = filesToDelete,
                            subject = selectedSubject,
                            folder = selectedFolder,
                            language = selectedLanguage,
                            token = githubToken,
                        ) { success, errorMsg ->
                            isDeleting = false
                            showDeleteDialog = false
                            if (success) {
                                selectedFiles.clear()
                                android.widget.Toast
                                    .makeText(
                                        context,
                                        "Files deleted successfully!",
                                        android.widget.Toast.LENGTH_SHORT,
                                    ).show()
                            } else {
                                android.widget.Toast
                                    .makeText(
                                        context,
                                        "Deletion failed: $errorMsg",
                                        android.widget.Toast.LENGTH_LONG,
                                    ).show()
                            }
                        }
                    },
                    enabled = !isDeleting,
                ) {
                    if (isDeleting) {
                        androidx.compose.material3.CircularProgressIndicator(modifier = Modifier.size(16.dp))
                    } else {
                        Text("Delete", color = MaterialTheme.colorScheme.error)
                    }
                }
            },
            dismissButton = {
                TextButton(onClick = { showDeleteDialog = false }, enabled = !isDeleting) {
                    Text("Cancel")
                }
            },
        )
    }

    Column(
        modifier =
            Modifier
                .fillMaxSize()
                .padding(16.dp)
                .verticalScroll(rememberScrollState()),
        verticalArrangement = Arrangement.spacedBy(24.dp),
    ) {
        // --- 1. Category Selection ---
        Column(verticalArrangement = Arrangement.spacedBy(16.dp)) {
            Text(
                text = "Target Destination",
                style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Bold),
                color = MaterialTheme.colorScheme.onBackground,
            )

            Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                // Language Dropdown
                ExposedDropdownMenuBox(
                    expanded = languageExpanded,
                    onExpandedChange = { languageExpanded = !languageExpanded },
                    modifier = Modifier.weight(1f),
                ) {
                    OutlinedTextField(
                        value = selectedLanguage.replaceFirstChar { it.uppercase() },
                        onValueChange = {},
                        readOnly = true,
                        label = { Text("Language") },
                        leadingIcon = { Icon(Icons.Default.Language, contentDescription = null) },
                        trailingIcon = { Icon(Icons.Default.ArrowDropDown, contentDescription = null) },
                        modifier = Modifier.menuAnchor().fillMaxWidth(),
                        shape = RoundedCornerShape(12.dp),
                    )
                    ExposedDropdownMenu(
                        expanded = languageExpanded,
                        onDismissRequest = { languageExpanded = false },
                    ) {
                        languages.forEach { language ->
                            DropdownMenuItem(
                                text = { Text(language.replaceFirstChar { it.uppercase() }) },
                                onClick = {
                                    selectedLanguage = language
                                    languageExpanded = false
                                },
                            )
                        }
                    }
                }
            }

            Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                // Subject Dropdown
                ExposedDropdownMenuBox(
                    expanded = subjectExpanded,
                    onExpandedChange = { subjectExpanded = !subjectExpanded },
                    modifier = Modifier.weight(1f),
                ) {
                    OutlinedTextField(
                        value = selectedSubject,
                        onValueChange = {},
                        readOnly = true,
                        label = { Text("Subject") },
                        leadingIcon = { Icon(Icons.Default.Book, contentDescription = null) },
                        trailingIcon = { Icon(Icons.Default.ArrowDropDown, contentDescription = null) },
                        modifier = Modifier.menuAnchor().fillMaxWidth(),
                        shape = RoundedCornerShape(12.dp),
                    )
                    ExposedDropdownMenu(
                        expanded = subjectExpanded,
                        onDismissRequest = { subjectExpanded = false },
                    ) {
                        subjects.forEach { subject ->
                            DropdownMenuItem(
                                text = { Text(subject) },
                                onClick = {
                                    selectedSubject = subject
                                    subjectExpanded = false
                                },
                            )
                        }
                    }
                }

                // Folder Dropdown
                ExposedDropdownMenuBox(
                    expanded = folderExpanded,
                    onExpandedChange = { folderExpanded = !folderExpanded },
                    modifier = Modifier.weight(1f),
                ) {
                    OutlinedTextField(
                        value = selectedFolder,
                        onValueChange = {},
                        readOnly = true,
                        label = { Text("Folder") },
                        leadingIcon = { Icon(Icons.Default.Folder, contentDescription = null) },
                        trailingIcon = { Icon(Icons.Default.ArrowDropDown, contentDescription = null) },
                        modifier = Modifier.menuAnchor().fillMaxWidth(),
                        shape = RoundedCornerShape(12.dp),
                    )
                    ExposedDropdownMenu(
                        expanded = folderExpanded,
                        onDismissRequest = { folderExpanded = false },
                    ) {
                        folders.forEach { folder ->
                            DropdownMenuItem(
                                text = { Text(folder) },
                                onClick = {
                                    selectedFolder = folder
                                    folderExpanded = false
                                },
                            )
                        }
                    }
                }
            }
        }

        // --- 2. Add Content Link Form ---
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(8.dp),
            elevation = CardDefaults.cardElevation(defaultElevation = 4.dp),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        ) {
            Column(
                modifier = Modifier.padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp),
            ) {
                Text(
                    text = "Add Content Link (GitHub, Drive, etc.)",
                    style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                    color = MaterialTheme.colorScheme.primary,
                )

                OutlinedTextField(
                    value = fileTitle,
                    onValueChange = { fileTitle = it },
                    label = { Text("File Title") },
                    placeholder = { Text("e.g. 2023 Marking Scheme") },
                    leadingIcon = { Icon(Icons.Default.Title, contentDescription = null) },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                )

                OutlinedTextField(
                    value = fileUrl,
                    onValueChange = { fileUrl = it },
                    label = { Text("File Download URL") },
                    placeholder = { Text("e.g. https://raw.githubusercontent.com/...") },
                    leadingIcon = { Icon(Icons.Default.AttachFile, contentDescription = null) },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                )

                Button(
                    onClick = {
                        if (fileUrl.isNotBlank() && fileTitle.isNotBlank()) {
                            isUploading = true
                            coroutineScope.launch {
                                try {
                                    val dbRef =
                                        com.google.firebase.database.FirebaseDatabase
                                            .getInstance()
                                            .getReference("files/$selectedLanguage/$selectedSubject/$selectedFolder")
                                            .push()

                                    val extractedFileName = fileUrl.substringAfterLast("/", "linked_file")

                                    val fileData =
                                        mapOf(
                                            "id" to dbRef.key,
                                            "title" to fileTitle,
                                            "fileName" to extractedFileName,
                                            "downloadUrl" to fileUrl,
                                            "timestamp" to com.google.firebase.database.ServerValue.TIMESTAMP,
                                        )

                                    dbRef.setValue(fileData).await()

                                    fileUrl = ""
                                    fileTitle = ""
                                    android.widget.Toast
                                        .makeText(
                                            context,
                                            "Link Added Successfully!",
                                            android.widget.Toast.LENGTH_SHORT,
                                        ).show()
                                } catch (e: Exception) {
                                    android.widget.Toast
                                        .makeText(
                                            context,
                                            "Failed to add link: ${e.message}",
                                            android.widget.Toast.LENGTH_LONG,
                                        ).show()
                                } finally {
                                    isUploading = false
                                }
                            }
                        } else {
                            android.widget.Toast
                                .makeText(
                                    context,
                                    "Please provide a title and a URL.",
                                    android.widget.Toast.LENGTH_SHORT,
                                ).show()
                        }
                    },
                    modifier = Modifier.fillMaxWidth().height(50.dp),
                    shape = RoundedCornerShape(12.dp),
                    enabled = !isUploading,
                ) {
                    if (isUploading) {
                        androidx.compose.material3.CircularProgressIndicator(
                            color = MaterialTheme.colorScheme.onPrimary,
                            modifier = Modifier.size(24.dp),
                        )
                    } else {
                        Icon(Icons.Default.Upload, contentDescription = null)
                        Spacer(modifier = Modifier.size(8.dp))
                        Text("Add Link to $selectedFolder", style = MaterialTheme.typography.titleMedium)
                    }
                }
            }
        }

        // --- 3. Live File List ---
        Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
            Text(
                text = "Live Files in '$selectedSubject -> $selectedFolder'",
                style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                color = MaterialTheme.colorScheme.onBackground,
            )

            // Display actual files from GitHub
            if (selectedFiles.isNotEmpty()) {
                Button(
                    onClick = {
                        filesToDelete = selectedFiles.toList()
                        showDeleteDialog = true
                    },
                    colors =
                        androidx.compose.material3.ButtonDefaults
                            .buttonColors(containerColor = MaterialTheme.colorScheme.error),
                    modifier = Modifier.fillMaxWidth().padding(bottom = 8.dp),
                ) {
                    Icon(Icons.Default.Delete, contentDescription = null)
                    Spacer(modifier = Modifier.size(8.dp))
                    Text("Delete ${selectedFiles.size} Selected File(s)")
                }
            }

            if (isLoading) {
                androidx.compose.material3.CircularProgressIndicator(
                    modifier = Modifier.align(Alignment.CenterHorizontally).padding(16.dp),
                )
            } else if (liveFiles.isEmpty()) {
                Text(
                    text = "No files found in this folder.",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    modifier = Modifier.padding(16.dp),
                )
            } else {
                liveFiles.forEach { file ->
                    val isSelected = selectedFiles.contains(file)
                    AdminFileCard(
                        fileName = file.fileName,
                        date = "Live on GitHub",
                        size = "PDF",
                        isSelected = isSelected,
                        onSelectToggle = { checked ->
                            if (checked) selectedFiles.add(file) else selectedFiles.remove(file)
                        },
                        onOpen = {
                            try {
                                val encodedUrl = java.net.URLEncoder.encode(file.downloadUrl, "UTF-8")
                                val gviewUrl = "https://docs.google.com/gview?embedded=true&url=$encodedUrl"
                                val intent = android.content.Intent(android.content.Intent.ACTION_VIEW, android.net.Uri.parse(gviewUrl))
                                context.startActivity(intent)
                            } catch (e: Exception) {
                                android.widget.Toast
                                    .makeText(
                                        context,
                                        "Cannot open file: ${e.message}",
                                        android.widget.Toast.LENGTH_SHORT,
                                    ).show()
                            }
                        },
                        onDownload = {
                            try {
                                val request = android.app.DownloadManager.Request(android.net.Uri.parse(file.downloadUrl))
                                request.setTitle(file.fileName)
                                request.setDescription("Downloading PDF")
                                request.setNotificationVisibility(android.app.DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED)
                                request.setDestinationInExternalPublicDir(android.os.Environment.DIRECTORY_DOWNLOADS, file.fileName)

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
                        },
                        onDeleteSingle = {
                            filesToDelete = listOf(file)
                            showDeleteDialog = true
                        },
                    )
                }
            }
        }
    }
}

@Composable
fun AdminFileCard(
    fileName: String,
    date: String,
    size: String,
    isSelected: Boolean,
    onSelectToggle: (Boolean) -> Unit,
    onOpen: () -> Unit = {},
    onDownload: () -> Unit = {},
    onDeleteSingle: () -> Unit = {},
) {
    Card(
        modifier = Modifier.fillMaxWidth().clickable { onSelectToggle(!isSelected) },
        shape = RoundedCornerShape(12.dp),
        colors =
            CardDefaults.cardColors(
                containerColor =
                    if (isSelected) {
                        MaterialTheme.colorScheme.primaryContainer.copy(
                            alpha = 0.3f,
                        )
                    } else {
                        MaterialTheme.colorScheme.surface
                    },
            ),
    ) {
        Row(
            modifier = Modifier.fillMaxWidth().padding(12.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween,
        ) {
            Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.weight(1f)) {
                androidx.compose.material3.Checkbox(
                    checked = isSelected,
                    onCheckedChange = onSelectToggle,
                )
                Box(
                    modifier = Modifier.size(40.dp).clip(CircleShape).background(MaterialTheme.colorScheme.primaryContainer),
                    contentAlignment = Alignment.Center,
                ) {
                    Icon(Icons.Default.AttachFile, contentDescription = null, tint = MaterialTheme.colorScheme.onPrimaryContainer)
                }
                Spacer(modifier = Modifier.size(12.dp))
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = fileName,
                        style = MaterialTheme.typography.bodyLarge.copy(fontWeight = FontWeight.Bold),
                        maxLines = 1,
                        overflow = androidx.compose.ui.text.style.TextOverflow.Ellipsis,
                    )
                    Text(
                        text = "$date • $size",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                }
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
                IconButton(onClick = onDeleteSingle) {
                    Icon(Icons.Default.Delete, contentDescription = "Delete", tint = MaterialTheme.colorScheme.error)
                }
            }
        }
    }
}
