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
package com.altamil.education.student

import android.content.Context
import android.net.Uri
import android.provider.OpenableColumns
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
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
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Link
import androidx.compose.material.icons.filled.PictureAsPdf
import androidx.compose.material3.Button
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.ExposedDropdownMenuBox
import androidx.compose.material3.ExposedDropdownMenuDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedCard
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.database.FirebaseDatabase
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.tasks.await
import kotlinx.coroutines.withContext
import org.json.JSONObject
import java.io.DataOutputStream
import java.net.HttpURLConnection
import java.net.URL
import java.util.UUID

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SuggestMaterialScreen(onNavigateBack: () -> Unit) {
    var fileName by remember { mutableStateOf("") }
    var selectedPdfUri by remember { mutableStateOf<Uri?>(null) }
    var selectedSubject by remember { mutableStateOf("biology") }
    var selectedFolder by remember { mutableStateOf("elaborations") }
    var isUploading by remember { mutableStateOf(false) }

    val context = LocalContext.current
    val coroutineScope = rememberCoroutineScope()

    val subjects = listOf("biology", "chemistry", "physics", "combined maths")
    val folders = listOf("elaborations", "past papers", "model papers")

    var subjectExpanded by remember { mutableStateOf(false) }
    var folderExpanded by remember { mutableStateOf(false) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Suggest Material") },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                },
            )
        },
    ) { paddingValues ->
        Column(
            modifier =
                Modifier
                    .fillMaxSize()
                    .padding(paddingValues)
                    .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp),
        ) {
            Text(
                "Help us grow our library! Upload a PDF to suggest a new material. An Admin will review it before publishing.",
                style = MaterialTheme.typography.bodyMedium,
            )

            val pdfPickerLauncher =
                rememberLauncherForActivityResult(ActivityResultContracts.GetContent()) { uri: Uri? ->
                    if (uri != null) {
                        selectedPdfUri = uri
                        if (fileName.isEmpty()) {
                            context.contentResolver.query(uri, null, null, null, null)?.use { cursor ->
                                val nameIndex = cursor.getColumnIndex(OpenableColumns.DISPLAY_NAME)
                                if (cursor.moveToFirst() && nameIndex != -1) {
                                    fileName = cursor.getString(nameIndex).substringBeforeLast(".")
                                }
                            }
                        }
                    }
                }

            OutlinedCard(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(8.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
            ) {
                Box(modifier = Modifier.fillMaxWidth().padding(16.dp), contentAlignment = Alignment.Center) {
                    if (selectedPdfUri == null) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Icon(
                                Icons.Default.PictureAsPdf,
                                contentDescription = null,
                                modifier = Modifier.size(48.dp),
                                tint = MaterialTheme.colorScheme.primary,
                            )
                            TextButton(onClick = { pdfPickerLauncher.launch("application/pdf") }) {
                                Text("Select PDF Note to Upload")
                            }
                        }
                    } else {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Text("PDF Selected ✓", color = MaterialTheme.colorScheme.primary, fontWeight = FontWeight.Bold)
                            TextButton(onClick = { pdfPickerLauncher.launch("application/pdf") }) {
                                Text("Change PDF")
                            }
                        }
                    }
                }
            }

            OutlinedTextField(
                value = fileName,
                onValueChange = { fileName = it },
                label = { Text("Material Name (e.g., 2023 Past Paper)") },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true,
            )

            // Subject Dropdown
            ExposedDropdownMenuBox(
                expanded = subjectExpanded,
                onExpandedChange = { subjectExpanded = it },
                modifier = Modifier.fillMaxWidth(),
            ) {
                OutlinedTextField(
                    value = selectedSubject.replaceFirstChar { it.uppercase() },
                    onValueChange = {},
                    readOnly = true,
                    label = { Text("Subject") },
                    trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = subjectExpanded) },
                    modifier = Modifier.menuAnchor().fillMaxWidth(),
                )
                ExposedDropdownMenu(
                    expanded = subjectExpanded,
                    onDismissRequest = { subjectExpanded = false },
                ) {
                    subjects.forEach { subject ->
                        DropdownMenuItem(
                            text = { Text(subject.replaceFirstChar { it.uppercase() }) },
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
                onExpandedChange = { folderExpanded = it },
                modifier = Modifier.fillMaxWidth(),
            ) {
                OutlinedTextField(
                    value = selectedFolder.replaceFirstChar { it.uppercase() },
                    onValueChange = {},
                    readOnly = true,
                    label = { Text("Category") },
                    trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = folderExpanded) },
                    modifier = Modifier.menuAnchor().fillMaxWidth(),
                )
                ExposedDropdownMenu(
                    expanded = folderExpanded,
                    onDismissRequest = { folderExpanded = false },
                ) {
                    folders.forEach { folder ->
                        DropdownMenuItem(
                            text = { Text(folder.replaceFirstChar { it.uppercase() }) },
                            onClick = {
                                selectedFolder = folder
                                folderExpanded = false
                            },
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.weight(1f))

            Button(
                onClick = {
                    if (fileName.isBlank() || selectedPdfUri == null) {
                        android.widget.Toast
                            .makeText(context, "Please select a PDF and enter a name.", android.widget.Toast.LENGTH_SHORT)
                            .show()
                        return@Button
                    }
                    isUploading = true
                    val suggestionId = UUID.randomUUID().toString()
                    val dbRef = FirebaseDatabase.getInstance().getReference("suggestions/$suggestionId")
                    val email = FirebaseAuth.getInstance().currentUser?.email ?: "Unknown"

                    coroutineScope.launch {
                        try {
                            val uploadedLink =
                                withContext(kotlinx.coroutines.Dispatchers.IO) {
                                    val url = java.net.URL("https://catbox.moe/user/api.php")
                                    val connection = url.openConnection() as java.net.HttpURLConnection
                                    val boundary = "*****" + System.currentTimeMillis() + "*****"
                                    connection.requestMethod = "POST"
                                    connection.doOutput = true
                                    connection.setRequestProperty("Content-Type", "multipart/form-data; boundary=$boundary")

                                    java.io.DataOutputStream(connection.outputStream).use { dos ->
                                        dos.writeBytes("--$boundary\r\n")
                                        dos.writeBytes("Content-Disposition: form-data; name=\"reqtype\"\r\n\r\n")
                                        dos.writeBytes("fileupload\r\n")

                                        dos.writeBytes("--$boundary\r\n")
                                        dos.writeBytes("Content-Disposition: form-data; name=\"fileToUpload\"; filename=\"upload.pdf\"\r\n")
                                        dos.writeBytes("Content-Type: application/pdf\r\n\r\n")

                                        context.contentResolver.openInputStream(selectedPdfUri!!)?.use { input ->
                                            input.copyTo(dos)
                                        }
                                        dos.writeBytes("\r\n--$boundary--\r\n")
                                        dos.flush()
                                    }

                                    if (connection.responseCode == java.net.HttpURLConnection.HTTP_OK) {
                                        connection.inputStream.bufferedReader().use { it.readText() }
                                    } else {
                                        throw Exception("Upload failed: ${connection.responseCode} ${connection.responseMessage}")
                                    }
                                }

                            val finalFileName = if (fileName.endsWith(".pdf", ignoreCase = true)) fileName else "$fileName.pdf"

                            val suggestionData =
                                mapOf(
                                    "fileName" to finalFileName,
                                    "subject" to selectedSubject,
                                    "folder" to selectedFolder,
                                    "downloadUrl" to uploadedLink,
                                    "userEmail" to email,
                                    "timestamp" to System.currentTimeMillis(),
                                )
                            dbRef.setValue(suggestionData).await()

                            android.widget.Toast
                                .makeText(context, "Suggestion submitted!", android.widget.Toast.LENGTH_LONG)
                                .show()
                            onNavigateBack()
                        } catch (e: Exception) {
                            android.widget.Toast
                                .makeText(context, "Upload failed: ${e.message}", android.widget.Toast.LENGTH_LONG)
                                .show()
                        } finally {
                            isUploading = false
                        }
                    }
                },
                modifier = Modifier.fillMaxWidth().height(50.dp),
                enabled = !isUploading,
            ) {
                if (isUploading) {
                    CircularProgressIndicator(modifier = Modifier.size(24.dp), color = MaterialTheme.colorScheme.onPrimary)
                } else {
                    Text("Submit Suggestion")
                }
            }
        }
    }
}

// Removed file.io upload function as we now use Firebase Storage
