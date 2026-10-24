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

import android.util.Base64
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.google.firebase.database.DataSnapshot
import com.google.firebase.database.DatabaseError
import com.google.firebase.database.FirebaseDatabase
import com.google.firebase.database.ValueEventListener
import com.google.firebase.storage.FirebaseStorage
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import kotlinx.coroutines.tasks.await
import java.net.HttpURLConnection
import java.net.URL
import java.net.URLEncoder

data class Suggestion(
    val id: String = "",
    val fileName: String = "",
    val subject: String = "",
    val folder: String = "",
    val downloadUrl: String = "",
    val userEmail: String = "",
    val timestamp: Long = 0L,
)

class AdminSuggestionsViewModel : ViewModel() {
    private val database = FirebaseDatabase.getInstance().getReference("suggestions")
    private val storage = FirebaseStorage.getInstance().reference.child("suggestions")

    private val _suggestions = MutableStateFlow<List<Suggestion>>(emptyList())
    val suggestions: StateFlow<List<Suggestion>> = _suggestions

    init {
        loadSuggestions()
    }

    private fun loadSuggestions() {
        database.addValueEventListener(
            object : ValueEventListener {
                override fun onDataChange(snapshot: DataSnapshot) {
                    val list = mutableListOf<Suggestion>()
                    for (child in snapshot.children) {
                        val id = child.key ?: continue
                        val fileName = child.child("fileName").value.toString()
                        val subject = child.child("subject").value.toString()
                        val folder = child.child("folder").value.toString()
                        val downloadUrl = child.child("downloadUrl").value.toString()
                        val userEmail = child.child("userEmail").value.toString()
                        val timestamp = child.child("timestamp").value as? Long ?: 0L
                        list.add(Suggestion(id, fileName, subject, folder, downloadUrl, userEmail, timestamp))
                    }
                    _suggestions.value = list.sortedByDescending { it.timestamp }
                }

                override fun onCancelled(error: DatabaseError) {}
            },
        )
    }

    fun publishToGitHub(
        suggestion: Suggestion,
        language: String,
        githubToken: String,
        onComplete: (Boolean, String?) -> Unit,
    ) {
        viewModelScope.launch(Dispatchers.IO) {
            try {
                // 1. Download file bytes from the external URL (e.g., catbox.moe)
                val fileUrl = URL(suggestion.downloadUrl)
                val fileConnection = fileUrl.openConnection() as HttpURLConnection
                fileConnection.requestMethod = "GET"
                fileConnection.setRequestProperty("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64)")
                fileConnection.setRequestProperty("Connection", "close")

                if (fileConnection.responseCode != HttpURLConnection.HTTP_OK) {
                    throw Exception("Failed to download file from ${suggestion.downloadUrl}: HTTP ${fileConnection.responseCode}")
                }

                val bytes = fileConnection.inputStream.use { it.readBytes() }
                fileConnection.disconnect()

                // 2. Base64 encode the bytes
                val base64Content = Base64.encodeToString(bytes, Base64.NO_WRAP)

                // 3. Upload to GitHub API
                val encodedSubject = URLEncoder.encode(suggestion.subject.lowercase(), "UTF-8").replace("+", "%20")
                val encodedFolder = URLEncoder.encode(suggestion.folder, "UTF-8").replace("+", "%20")
                val encodedFileName = URLEncoder.encode(suggestion.fileName, "UTF-8").replace("+", "%20")

                val urlString =
                    "https://api.github.com/repos/adksoftwares/subjects-materials/contents/" +
                        "$language/$encodedSubject/$encodedFolder/$encodedFileName"
                val url = URL(urlString)
                val connection = url.openConnection() as HttpURLConnection
                connection.requestMethod = "PUT"
                connection.setRequestProperty("Accept", "application/vnd.github.v3+json")
                connection.setRequestProperty("Authorization", "Bearer $githubToken")
                connection.setRequestProperty("Content-Type", "application/json")
                connection.setRequestProperty("Connection", "close")
                connection.doOutput = true

                val jsonBody =
                    """
                    {
                        "message": "Publish suggestion ${suggestion.fileName} from ${suggestion.userEmail}",
                        "content": "$base64Content"
                    }
                    """.trimIndent()

                val os = connection.outputStream
                os.write(jsonBody.toByteArray(Charsets.UTF_8))
                os.flush()
                os.close()

                val responseCode = connection.responseCode
                if (responseCode == HttpURLConnection.HTTP_CREATED || responseCode == HttpURLConnection.HTTP_OK) {
                    // Success, delete from Firebase
                    deleteSuggestionFromFirebase(suggestion)
                    launch(Dispatchers.Main) { onComplete(true, null) }
                } else {
                    val errorStream = connection.errorStream?.bufferedReader()?.use { it.readText() }
                    launch(Dispatchers.Main) { onComplete(false, "HTTP $responseCode: $errorStream") }
                }
            } catch (e: Exception) {
                e.printStackTrace()
                launch(Dispatchers.Main) { onComplete(false, e.message) }
            }
        }
    }

    fun rejectSuggestion(suggestion: Suggestion) {
        viewModelScope.launch(Dispatchers.IO) {
            deleteSuggestionFromFirebase(suggestion)
        }
    }

    private suspend fun deleteSuggestionFromFirebase(suggestion: Suggestion) {
        try {
            storage.child("${suggestion.id}.pdf").delete().await()
        } catch (e: Exception) {
            e.printStackTrace()
        }
        try {
            database.child(suggestion.id).removeValue().await()
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }
}
