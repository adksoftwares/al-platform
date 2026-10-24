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
import com.altamil.education.R
import com.google.ai.client.generativeai.GenerativeModel
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.database.FirebaseDatabase
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import kotlinx.coroutines.tasks.await
import org.json.JSONObject

class AnalyticsViewModel : ViewModel() {
    private val _analyticsJson = MutableStateFlow<String?>(null)
    val analyticsJson: StateFlow<String?> = _analyticsJson.asStateFlow()

    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()

    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error.asStateFlow()

    private val _userLanguage = MutableStateFlow("tamil")
    val userLanguage: StateFlow<String> = _userLanguage.asStateFlow()

    fun loadAnalytics(context: Context) {
        viewModelScope.launch {
            _isLoading.value = true
            _error.value = null

            try {
                val userId = FirebaseAuth.getInstance().currentUser?.uid
                if (userId == null) {
                    _error.value = "User not logged in."
                    return@launch
                }

                // 1. Fetch History Data first
                val db = FirebaseDatabase.getInstance()

                val userLang =
                    try {
                        val langSnapshot = db.getReference("users/$userId/language").get().await()
                        langSnapshot.getValue(String::class.java) ?: "tamil"
                    } catch (e: Exception) {
                        "tamil"
                    }
                _userLanguage.value = userLang

                val quizzesList = mutableListOf<Map<String, Any?>>()
                var latestQuizTimestamp = 0L
                try {
                    val quizzesSnapshot = db.getReference("users/$userId/history/quizzes").get().await()
                    for (child in quizzesSnapshot.children) {
                        @Suppress("UNCHECKED_CAST")
                        val quizMap = child.value as? Map<String, Any?>
                        if (quizMap != null) {
                            quizzesList.add(quizMap)
                            val ts = (quizMap["timestamp"] as? Number)?.toLong() ?: 0L
                            if (ts > latestQuizTimestamp) {
                                latestQuizTimestamp = ts
                            }
                        }
                    }
                } catch (e: Exception) {
                    // Ignore or log
                }

                val documentsList = mutableListOf<Map<String, Any?>>()
                var latestDocTimestamp = 0L
                try {
                    val documentsSnapshot = db.getReference("users/$userId/history/documents").get().await()
                    for (child in documentsSnapshot.children) {
                        @Suppress("UNCHECKED_CAST")
                        val docMap = child.value as? Map<String, Any?>
                        if (docMap != null) {
                            documentsList.add(docMap)
                            val ts = (docMap["timestamp"] as? Number)?.toLong() ?: 0L
                            if (ts > latestDocTimestamp) {
                                latestDocTimestamp = ts
                            }
                        }
                    }
                } catch (e: Exception) {
                    // Ignore or log
                }

                val latestActivityTimestamp = maxOf(latestQuizTimestamp, latestDocTimestamp)

                // 2. Check Cache
                val cacheRef = db.getReference("users/$userId/analytics_cache")
                try {
                    val cacheSnapshot = cacheRef.get().await()
                    if (cacheSnapshot.exists()) {
                        val cacheTimestamp = cacheSnapshot.child("timestamp").getValue(Long::class.java) ?: 0L
                        val currentTime = System.currentTimeMillis()
                        // 24 hours in milliseconds = 86400000L
                        if (currentTime - cacheTimestamp < 86400000L && cacheTimestamp > latestActivityTimestamp) {
                            val cachedJson = cacheSnapshot.child("json").getValue(String::class.java)
                            if (!cachedJson.isNullOrBlank()) {
                                _analyticsJson.value = cachedJson
                                _isLoading.value = false
                                return@launch
                            }
                        }
                    }
                } catch (e: Exception) {
                    // Cache read failed (permission denied?), continue to generate
                }

                val quizHistoryJson = org.json.JSONArray(quizzesList).toString()
                val documentHistoryJson = org.json.JSONArray(documentsList).toString()

                // 2. Feed to Gemini
                var apiKey = ""
                try {
                    val apiKeySnapshot = db.getReference("admin_settings/gemini_api_key").get().await()
                    apiKey = apiKeySnapshot.getValue(String::class.java) ?: ""
                } catch (e: Exception) {
                    _error.value =
                        "Cannot read Gemini API Key. Admin settings might be protected. Please ask Admin to update Firebase Rules."
                    return@launch
                }

                if (apiKey.isEmpty() || apiKey == "YOUR_GEMINI_API_KEY") {
                    _error.value = "Gemini API Key missing! Ask admin to set it up."
                    return@launch
                }

                val prompt =
                    """
                    You are the Analytics and Insights Engine for an educational app. Your role is to analyze a user's quiz performance history and uploaded study documents to generate a comprehensive, actionable learning dashboard.

                    ### 1. INPUT DATA
                    - Quiz History: $quizHistoryJson
                    - Document Interaction History: $documentHistoryJson

                    ### 2. CORE TASKS & ANALYTICAL METHOD
                    Analyze the provided datasets to generate insights across the following dimensions:
                    - Performance Matrix: Calculate overall accuracy, average score per subject, and average time spent per question.
                    - Knowledge Gap Detection: Identify specific topics or subjects where the user consistently scores below 70% or takes an unusually long time to answer.
                    - Engagement & Study Habits: Correlate document reading time and highlights with quiz performance.
                    - Trend Analysis: Determine if the user's performance is improving, plateauing, or declining.

                    ### 3. OUTPUT SPECIFICATION
                    Generate all textual insights, reasons, issues, descriptions, subject names, topic names, and action items purely in the $userLang language.
                    For the priority field in weaknesses_and_gaps, return only the localized translation for "High", "Medium", or "Low" in $userLang.
                    Return ONLY a clean, structured JSON object with the exact schema below. Do NOT wrap it in markdown code blocks like ```json.
                    {
                      "summary_metrics": {
                        "total_quizzes_taken": integer,
                        "overall_accuracy_percentage": float,
                        "total_study_time_minutes": integer
                      },
                      "strengths": [
                        { "subject": "string", "topic": "string", "reason": "string" }
                      ],
                      "weaknesses_and_gaps": [
                        { "subject": "string", "topic": "string", "issue": "string", "priority": "string" }
                      ],
                      "study_habit_insights": [
                        { "insight_type": "string", "description": "string" }
                      ],
                      "actionable_recommendations": [
                        { "action_item": "string", "target_document_or_topic": "string", "estimated_benefit": "string" }
                      ]
                    }
                    """.trimIndent()

                val modelsToTry =
                    listOf("gemini-1.5-flash", "gemini-1.5-pro", "gemini-flash-latest")
                var jsonString: String = "{}"
                var lastError: Exception? = null

                for (modelName in modelsToTry) {
                    try {
                        val generativeModel =
                            GenerativeModel(
                                modelName = modelName,
                                apiKey = apiKey,
                            )

                        val response = generativeModel.generateContent(prompt)
                        jsonString = response.text
                            ?.replace("```json", "")
                            ?.replace("```", "")
                            ?.trim() ?: "{}"

                        // Validate JSON
                        JSONObject(jsonString)

                        _analyticsJson.value = jsonString

                        // Save to cache
                        try {
                            val cacheData =
                                mapOf(
                                    "json" to jsonString,
                                    "timestamp" to System.currentTimeMillis(),
                                )
                            cacheRef.setValue(cacheData).await()
                        } catch (e: Exception) {
                            // Ignore if permission denied
                        }

                        return@launch
                    } catch (e: Exception) {
                        lastError = e
                        val msg = e.message ?: ""
                        if (msg.contains("API_KEY_INVALID")) {
                            break
                        }
                    }
                }

                throw lastError ?: Exception("No models worked")
            } catch (e: Exception) {
                _error.value = "Failed to generate analytics: ${e.message}"
            } finally {
                _isLoading.value = false
            }
        }
    }
}
