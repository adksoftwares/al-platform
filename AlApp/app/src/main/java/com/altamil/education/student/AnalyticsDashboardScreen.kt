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

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.slideInVertically
import androidx.compose.foundation.background
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
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Lightbulb
import androidx.compose.material.icons.filled.Star
import androidx.compose.material.icons.filled.TrendingUp
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import org.json.JSONArray
import org.json.JSONObject

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AnalyticsDashboardScreen(
    onNavigateBack: () -> Unit,
    viewModel: AnalyticsViewModel =
        androidx.lifecycle.viewmodel.compose
            .viewModel(),
) {
    val context = LocalContext.current
    val isLoading by viewModel.isLoading.collectAsState()
    val error by viewModel.error.collectAsState()
    val analyticsJson by viewModel.analyticsJson.collectAsState()
    val userLanguage by viewModel.userLanguage.collectAsState()

    fun getString(key: String): String =
        when (userLanguage.lowercase()) {
            "english" ->
                when (key) {
                    "title" -> "AI Learning Insights"
                    "back" -> "Back"
                    "analyzing" -> "AI is analyzing your learning history..."
                    "error" -> "Error:"
                    "retry" -> "Retry"
                    "quizzes_taken" -> "Quizzes Taken"
                    "accuracy" -> "Accuracy"
                    "study_time" -> "Study Time"
                    "strengths" -> "Your Strengths"
                    "improvements" -> "Areas for Improvement"
                    "habits" -> "Study Habits"
                    "recommendations" -> "Actionable Recommendations"
                    "mins" -> "mins"
                    "target" -> "Target:"
                    "benefit" -> "Benefit:"
                    else -> key
                }
            "sinhala" ->
                when (key) {
                    "title" -> "AI ඉගෙනුම් තීක්ෂ්ණ බුද්ධිය"
                    "back" -> "ආපසු"
                    "analyzing" -> "AI ඔබගේ ඉගෙනුම් ඉතිහාසය විශ්ලේෂණය කරයි..."
                    "error" -> "දෝෂය:"
                    "retry" -> "නැවත උත්සාහ කරන්න"
                    "quizzes_taken" -> "ලබාගත් ප්‍රශ්නාවලිය"
                    "accuracy" -> "නිරවද්‍යතාවය"
                    "study_time" -> "අධ්‍යයන කාලය"
                    "strengths" -> "ඔබේ ශක්තීන්"
                    "improvements" -> "වැඩිදියුණු කළ යුතු ක්ෂේත්‍ර"
                    "habits" -> "අධ්‍යයන පුරුදු"
                    "recommendations" -> "ක්‍රියාකාරී නිර්දේශ"
                    "mins" -> "මිනි"
                    "target" -> "ඉලක්කය:"
                    "benefit" -> "ප්‍රතිලාභ:"
                    else -> key
                }
            else ->
                when (key) {
                    "title" -> "AI கற்றல் நுண்ணறிவு"
                    "back" -> "பின்செல்"
                    "analyzing" -> "AI உங்கள் கற்றல் வரலாற்றை பகுப்பாய்வு செய்கிறது..."
                    "error" -> "பிழை:"
                    "retry" -> "மீண்டும் முயற்சி செய்"
                    "quizzes_taken" -> "விடை கொடுத்தவை"
                    "accuracy" -> "துல்லியம்"
                    "study_time" -> "படிப்பு நேரம்"
                    "strengths" -> "உங்கள் பலங்கள்"
                    "improvements" -> "மேம்படுத்த வேண்டிய பகுதிகள்"
                    "habits" -> "படிப்பு பழக்கவழக்கங்கள்"
                    "recommendations" -> "செயல்பாட்டு பரிந்துரைகள்"
                    "mins" -> "நிமி"
                    "target" -> "இலக்கு:"
                    "benefit" -> "நன்மை:"
                    else -> key
                }
        }

    LaunchedEffect(Unit) {
        viewModel.loadAnalytics(context)
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(getString("title")) },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = getString("back"))
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
            when {
                isLoading -> {
                    Column(
                        modifier = Modifier.fillMaxSize(),
                        verticalArrangement = Arrangement.Center,
                        horizontalAlignment = Alignment.CenterHorizontally,
                    ) {
                        CircularProgressIndicator()
                        Spacer(modifier = Modifier.height(16.dp))
                        Text(
                            getString("analyzing"),
                            color = MaterialTheme.colorScheme.onBackground,
                        )
                    }
                }
                error != null -> {
                    Column(
                        modifier =
                            Modifier
                                .fillMaxSize()
                                .padding(16.dp),
                        verticalArrangement = Arrangement.Center,
                        horizontalAlignment = Alignment.CenterHorizontally,
                    ) {
                        Text("${getString("error")} $error", color = MaterialTheme.colorScheme.error)
                        Spacer(modifier = Modifier.height(16.dp))
                        Button(onClick = { viewModel.loadAnalytics(context) }) {
                            Text(getString("retry"))
                        }
                    }
                }
                analyticsJson != null -> {
                    val json = JSONObject(analyticsJson!!)

                    var isVisible by androidx.compose.runtime.remember { androidx.compose.runtime.mutableStateOf(false) }
                    androidx.compose.runtime.LaunchedEffect(Unit) {
                        isVisible = true
                    }

                    Column(
                        modifier =
                            Modifier
                                .fillMaxSize()
                                .padding(16.dp)
                                .verticalScroll(rememberScrollState()),
                        verticalArrangement = Arrangement.spacedBy(16.dp),
                    ) {
                        // Summary Metrics
                        val metrics = json.optJSONObject("summary_metrics")
                        if (metrics != null) {
                            AnimatedVisibility(
                                visible = isVisible,
                                enter = fadeIn(tween(500)) + slideInVertically(tween(500)) { it / 4 },
                            ) {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                                ) {
                                    MetricCard(
                                        title = getString("quizzes_taken"),
                                        value = metrics.optInt("total_quizzes_taken").toString(),
                                        icon = Icons.Default.CheckCircle,
                                        modifier = Modifier.weight(1f),
                                    )
                                    MetricCard(
                                        title = getString("accuracy"),
                                        value = "${metrics.optDouble("overall_accuracy_percentage")}%",
                                        icon = Icons.Default.TrendingUp,
                                        modifier = Modifier.weight(1f),
                                    )
                                    MetricCard(
                                        title = getString("study_time"),
                                        value = "${metrics.optInt("total_study_time_minutes")} ${getString("mins")}",
                                        icon = Icons.Default.Star,
                                        modifier = Modifier.weight(1f),
                                    )
                                }
                            }
                        }

                        // Strengths
                        val strengths = json.optJSONArray("strengths")
                        if (strengths != null && strengths.length() > 0) {
                            AnimatedVisibility(
                                visible = isVisible,
                                enter = fadeIn(tween(500, delayMillis = 100)) + slideInVertically(tween(500, delayMillis = 100)) { it / 4 },
                            ) {
                                Column(verticalArrangement = Arrangement.spacedBy(16.dp)) {
                                    SectionTitle(getString("strengths"))
                                    for (i in 0 until strengths.length()) {
                                        val item = strengths.getJSONObject(i)
                                        InsightCard(
                                            title = "${item.optString("subject")} - ${item.optString("topic")}",
                                            description = item.optString("reason"),
                                            icon = Icons.Default.CheckCircle,
                                            iconTint = Color(0xFF4CAF50),
                                        )
                                    }
                                }
                            }
                        }

                        // Weaknesses
                        val weaknesses = json.optJSONArray("weaknesses_and_gaps")
                        if (weaknesses != null && weaknesses.length() > 0) {
                            AnimatedVisibility(
                                visible = isVisible,
                                enter = fadeIn(tween(500, delayMillis = 200)) + slideInVertically(tween(500, delayMillis = 200)) { it / 4 },
                            ) {
                                Column(verticalArrangement = Arrangement.spacedBy(16.dp)) {
                                    SectionTitle(getString("improvements"))
                                    for (i in 0 until weaknesses.length()) {
                                        val item = weaknesses.getJSONObject(i)
                                        InsightCard(
                                            title = "${item.optString(
                                                "subject",
                                            )} - ${item.optString("topic")} (${item.optString("priority")} முன்னுரிமை)",
                                            description = item.optString("issue"),
                                            icon = Icons.Default.Warning,
                                            iconTint = Color(0xFFF44336),
                                        )
                                    }
                                }
                            }
                        }

                        // Habits
                        val habits = json.optJSONArray("study_habit_insights")
                        if (habits != null && habits.length() > 0) {
                            AnimatedVisibility(
                                visible = isVisible,
                                enter = fadeIn(tween(500, delayMillis = 300)) + slideInVertically(tween(500, delayMillis = 300)) { it / 4 },
                            ) {
                                Column(verticalArrangement = Arrangement.spacedBy(16.dp)) {
                                    SectionTitle(getString("habits"))
                                    for (i in 0 until habits.length()) {
                                        val item = habits.getJSONObject(i)
                                        InsightCard(
                                            title = item.optString("insight_type"),
                                            description = item.optString("description"),
                                            icon = Icons.Default.Lightbulb,
                                            iconTint = Color(0xFFFFC107),
                                        )
                                    }
                                }
                            }
                        }

                        // Recommendations
                        val recommendations = json.optJSONArray("actionable_recommendations")
                        if (recommendations != null && recommendations.length() > 0) {
                            AnimatedVisibility(
                                visible = isVisible,
                                enter = fadeIn(tween(500, delayMillis = 400)) + slideInVertically(tween(500, delayMillis = 400)) { it / 4 },
                            ) {
                                Column(verticalArrangement = Arrangement.spacedBy(16.dp)) {
                                    SectionTitle(getString("recommendations"))
                                    for (i in 0 until recommendations.length()) {
                                        val item = recommendations.getJSONObject(i)
                                        InsightCard(
                                            title = item.optString("action_item"),
                                            description = "${getString("target")} ${item.optString(
                                                "target_document_or_topic",
                                            )}\n${getString("benefit")} ${item.optString("estimated_benefit")}",
                                            icon = Icons.Default.Star,
                                            iconTint = MaterialTheme.colorScheme.primary,
                                        )
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun SectionTitle(title: String) {
    Text(
        text = title,
        style = MaterialTheme.typography.titleLarge,
        fontWeight = FontWeight.Bold,
        color = MaterialTheme.colorScheme.onBackground,
        modifier = Modifier.padding(top = 8.dp, bottom = 4.dp),
    )
}

@Composable
fun MetricCard(
    title: String,
    value: String,
    icon: ImageVector,
    modifier: Modifier = Modifier,
) {
    Card(
        modifier = modifier,
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant),
    ) {
        Column(
            modifier = Modifier.padding(12.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
        ) {
            Icon(icon, contentDescription = null, tint = MaterialTheme.colorScheme.primary, modifier = Modifier.size(24.dp))
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                value,
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
            Text(title, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
        }
    }
}

@Composable
fun InsightCard(
    title: String,
    description: String,
    icon: ImageVector,
    iconTint: Color,
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
    ) {
        Row(
            modifier = Modifier.padding(16.dp),
            verticalAlignment = Alignment.Top,
        ) {
            Icon(icon, contentDescription = null, tint = iconTint, modifier = Modifier.size(24.dp))
            Spacer(modifier = Modifier.width(12.dp))
            Column {
                Text(
                    title,
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onSurface,
                )
                Spacer(modifier = Modifier.height(4.dp))
                Text(description, style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
            }
        }
    }
}
