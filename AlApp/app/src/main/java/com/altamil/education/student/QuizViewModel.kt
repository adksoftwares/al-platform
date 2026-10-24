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
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.google.ai.client.generativeai.GenerativeModel
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.database.FirebaseDatabase
import com.tom_roush.pdfbox.android.PDFBoxResourceLoader
import com.tom_roush.pdfbox.pdmodel.PDDocument
import com.tom_roush.pdfbox.text.PDFTextStripper
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import kotlinx.coroutines.tasks.await
import org.json.JSONArray
import java.io.File
import java.io.FileOutputStream
import java.net.HttpURLConnection
import java.net.URL
import java.net.URLEncoder
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import kotlin.random.Random

data class QuizQuestion(
    val question: String = "",
    val options: List<String> = emptyList(),
    val answerIndex: Int = 0,
    val rationale: String = "",
)

class QuizViewModel : ViewModel() {
    private val _quizQuestions = MutableStateFlow<List<QuizQuestion>?>(null)
    val quizQuestions: StateFlow<List<QuizQuestion>?> = _quizQuestions

    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading

    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error

    fun loadDailyQuiz(
        subject: String,
        context: Context,
    ) {
        if (_quizQuestions.value != null) return

        _isLoading.value = true
        _error.value = null

        viewModelScope.launch(Dispatchers.IO) {
            try {
                PDFBoxResourceLoader.init(context)

                val userId = FirebaseAuth.getInstance().currentUser?.uid ?: return@launch
                val db = FirebaseDatabase.getInstance()

                val langSnapshot = db.getReference("users/$userId/language").get().await()
                val userLanguage = (langSnapshot.getValue(String::class.java) ?: "tamil").lowercase().trim()
                val normalizedSubject = subject.lowercase().trim()

                val today = SimpleDateFormat("yyyy-MM-dd", Locale.US).format(Date())
                val dbRef = db.getReference("daily_quizzes_v4/$userLanguage/$normalizedSubject/$today")

                // 1. Check if quiz already exists for today
                val snapshot = dbRef.get().await()
                if (snapshot.exists()) {
                    val questionsList = mutableListOf<QuizQuestion>()
                    for (child in snapshot.children) {
                        val question = child.child("question").getValue(String::class.java) ?: ""
                        val optionsSnapshot = child.child("options")
                        val options = mutableListOf<String>()
                        for (opt in optionsSnapshot.children) {
                            options.add(opt.getValue(String::class.java) ?: "")
                        }
                        val answerIndex = child.child("answerIndex").getValue(Int::class.java) ?: 0
                        val rationale = child.child("rationale").getValue(String::class.java) ?: "No explanation provided."
                        questionsList.add(QuizQuestion(question, options, answerIndex, rationale))
                    }
                    _quizQuestions.value = questionsList
                    _isLoading.value = false
                    return@launch
                }

                // If it doesn't exist yet, fallback to local QuizPool
                val calendar = java.util.Calendar.getInstance()
                val dayOfYear = calendar.get(java.util.Calendar.DAY_OF_YEAR)
                _quizQuestions.value = QuizPool.getQuiz(normalizedSubject, dayOfYear)
                _isLoading.value = false
                return@launch
            } catch (e: Exception) {
                _error.value = e.message
            } finally {
                _isLoading.value = false
            }
        }
    }
}
