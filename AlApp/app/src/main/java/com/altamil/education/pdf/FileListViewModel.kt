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

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import org.json.JSONArray
import java.io.BufferedReader
import java.io.InputStreamReader
import java.net.HttpURLConnection
import java.net.URL
import java.net.URLEncoder

data class FileMetadata(
    val id: String = "",
    val title: String = "",
    val fileName: String = "",
    val downloadUrl: String = "",
    val timestamp: Long = 0L,
)

class FileListViewModel : ViewModel() {
    private val _files = MutableStateFlow<List<FileMetadata>>(emptyList())
    val files: StateFlow<List<FileMetadata>> = _files.asStateFlow()

    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()

    private val _errorMessage = MutableStateFlow<String?>(null)
    val errorMessage: StateFlow<String?> = _errorMessage.asStateFlow()

    // No longer need Firebase references

    fun loadFiles(
        subject: String,
        folder: String,
        language: String,
    ) {
        _isLoading.value = true
        _errorMessage.value = null

        viewModelScope.launch(Dispatchers.IO) {
            var activeConnection: HttpURLConnection? = null
            try {
                // Restrict the language path and encode all user-influenced path segments.
                val safeLanguage = language.trim().lowercase().takeIf { it in setOf("tamil", "sinhala", "english") } ?: "tamil"
                val encodedLanguage = URLEncoder.encode(safeLanguage, "UTF-8").replace("+", "%20")
                val encodedSubject = URLEncoder.encode(subject.trim().lowercase(), "UTF-8").replace("+", "%20")
                val encodedFolder = URLEncoder.encode(folder.trim().lowercase(), "UTF-8").replace("+", "%20")

                val timestamp = System.currentTimeMillis()
                val urlString =
                    "https://api.github.com/repos/adksoftwares/subjects-materials/contents/" +
                        "$encodedLanguage/$encodedSubject/$encodedFolder?t=$timestamp"
                val url = URL(urlString)
                val connection = url.openConnection() as HttpURLConnection
                activeConnection = connection
                connection.connectTimeout = 10_000
                connection.readTimeout = 15_000
                connection.requestMethod = "GET"
                connection.setRequestProperty("Accept", "application/vnd.github.v3+json")
                connection.setRequestProperty("User-Agent", "AlApp/1.0")

                if (connection.responseCode == HttpURLConnection.HTTP_OK) {
                    val reader = BufferedReader(InputStreamReader(connection.inputStream))
                    val response = StringBuilder()
                    var line: String?
                    while (reader.readLine().also { line = it } != null) {
                        response.append(line)
                    }
                    reader.close()

                    val jsonArray = JSONArray(response.toString())
                    val fileList = mutableListOf<FileMetadata>()

                    for (i in 0 until jsonArray.length()) {
                        val item = jsonArray.getJSONObject(i)
                        // Ensure we only show pdf files, not subdirectories or READMEs
                        if (item.getString("type") == "file") {
                            val name = item.getString("name")
                            if (name.endsWith(".pdf", ignoreCase = true)) {
                                val downloadUrl = item.getString("download_url")
                                val title = name.substringBeforeLast(".")

                                fileList.add(
                                    FileMetadata(
                                        id = item.getString("sha"),
                                        title = title,
                                        fileName = name,
                                        downloadUrl = downloadUrl,
                                        timestamp = 0L,
                                    ),
                                )
                            }
                        }
                    }

                    // Sort alphabetically by file name/title
                    _files.value = fileList.sortedBy { it.title }
                } else {
                    // API returns 404 if the folder doesn't exist yet, just show empty list
                    _files.value = emptyList()
                    if (connection.responseCode != HttpURLConnection.HTTP_NOT_FOUND) {
                        _errorMessage.value = "HTTP Error: ${connection.responseCode} ${connection.responseMessage}"
                    }
                }
            } catch (e: Exception) {
                e.printStackTrace()
                _files.value = emptyList()
                _errorMessage.value = "Error: ${e.message}"
            } finally {
                activeConnection?.disconnect()
                _isLoading.value = false
            }
        }
    }

    fun deleteFilesFromGitHub(
        filesToDelete: List<FileMetadata>,
        subject: String,
        folder: String,
        language: String,
        token: String,
        onComplete: (Boolean, String?) -> Unit,
    ) {
        viewModelScope.launch(Dispatchers.IO) {
            try {
                val encodedSubject = URLEncoder.encode(subject, "UTF-8").replace("+", "%20")
                val encodedFolder = URLEncoder.encode(folder, "UTF-8").replace("+", "%20")

                var hasError = false
                var lastErrorMessage: String? = null

                for (file in filesToDelete) {
                    val encodedFileName = URLEncoder.encode(file.fileName, "UTF-8").replace("+", "%20")
                    val urlString =
                        "https://api.github.com/repos/adksoftwares/subjects-materials/contents/" +
                            "$language/$encodedSubject/$encodedFolder/$encodedFileName"
                    val url = URL(urlString)
                    val connection = url.openConnection() as HttpURLConnection
                    connection.requestMethod = "DELETE"
                    connection.setRequestProperty("Accept", "application/vnd.github.v3+json")
                    connection.setRequestProperty("Authorization", "Bearer $token")
                    connection.setRequestProperty("Content-Type", "application/json")
                    connection.doOutput = true

                    val jsonBody =
                        """
                        {
                            "message": "Delete ${file.fileName} via Admin App",
                            "sha": "${file.id}"
                        }
                        """.trimIndent()

                    val os = connection.outputStream
                    os.write(jsonBody.toByteArray(Charsets.UTF_8))
                    os.flush()
                    os.close()

                    val responseCode = connection.responseCode
                    // GitHub typically returns 200 OK for a successful delete.
                    if (responseCode != HttpURLConnection.HTTP_OK && responseCode != HttpURLConnection.HTTP_NO_CONTENT) {
                        hasError = true
                        lastErrorMessage = "Failed to delete ${file.fileName}: HTTP $responseCode"
                        break
                    }
                }

                launch(Dispatchers.Main) {
                    if (hasError) {
                        onComplete(false, lastErrorMessage)
                    } else {
                        onComplete(true, null)
                        // Refresh the file list
                        loadFiles(subject, folder, language)
                    }
                }
            } catch (e: Exception) {
                e.printStackTrace()
                launch(Dispatchers.Main) {
                    onComplete(false, e.message)
                }
            }
        }
    }
}
