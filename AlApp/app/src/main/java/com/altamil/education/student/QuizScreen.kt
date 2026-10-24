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
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedCard
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateMapOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.database.FirebaseDatabase
import kotlinx.coroutines.launch
import kotlinx.coroutines.tasks.await

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun QuizScreen(
    subject: String,
    onNavigateBack: () -> Unit,
    viewModel: QuizViewModel =
        androidx.lifecycle.viewmodel.compose
            .viewModel(),
) {
    val context = LocalContext.current
    val coroutineScope = androidx.compose.runtime.rememberCoroutineScope()
    val quizQuestions by viewModel.quizQuestions.collectAsState()
    val isLoading by viewModel.isLoading.collectAsState()
    val error by viewModel.error.collectAsState()

    var currentQuestionIndex by remember { mutableIntStateOf(0) }
    var selectedOptionIndex by remember { mutableStateOf<Int?>(null) }
    var score by remember { mutableIntStateOf(0) }
    var isQuizFinished by remember { mutableStateOf(false) }
    var isReviewing by remember { mutableStateOf(false) }
    var reviewQuestionIndex by remember { mutableIntStateOf(0) }
    val userAnswers = remember { mutableStateMapOf<Int, Int>() }
    val quizStartTime = remember { System.currentTimeMillis() }

    LaunchedEffect(subject) {
        viewModel.loadDailyQuiz(subject, context)
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("$subject Daily Quiz", style = MaterialTheme.typography.titleLarge) },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = MaterialTheme.colorScheme.primaryContainer),
            )
        },
    ) { paddingValues ->
        Box(
            modifier =
                Modifier
                    .fillMaxSize()
                    .padding(paddingValues)
                    .background(MaterialTheme.colorScheme.background),
            contentAlignment = Alignment.Center,
        ) {
            when {
                isLoading -> {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        CircularProgressIndicator(color = MaterialTheme.colorScheme.primary)
                        Spacer(modifier = Modifier.height(16.dp))
                        Text(
                            "Generating today's quiz...\nThis might take a few moments.",
                            textAlign = TextAlign.Center,
                            color = MaterialTheme.colorScheme.onBackground,
                        )
                    }
                }
                error != null -> {
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally,
                        modifier = Modifier.padding(16.dp),
                    ) {
                        Text("Error: $error", color = MaterialTheme.colorScheme.error, textAlign = TextAlign.Center)
                        Spacer(modifier = Modifier.height(16.dp))
                        Button(onClick = { viewModel.loadDailyQuiz(subject, context) }) {
                            Text("Retry")
                        }
                    }
                }
                isQuizFinished && !isReviewing -> {
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally,
                        modifier = Modifier.padding(16.dp),
                    ) {
                        Text("Quiz Completed!", style = MaterialTheme.typography.headlineLarge, fontWeight = FontWeight.Bold)
                        Spacer(modifier = Modifier.height(16.dp))
                        Text("Your Score: $score / ${quizQuestions?.size ?: 10}", style = MaterialTheme.typography.headlineMedium)
                        Spacer(modifier = Modifier.height(32.dp))
                        Button(onClick = {
                            isReviewing = true
                            reviewQuestionIndex = 0
                        }, modifier = Modifier.fillMaxWidth().height(50.dp)) {
                            Text("Review Answers")
                        }
                        Spacer(modifier = Modifier.height(16.dp))
                        OutlinedButton(onClick = onNavigateBack, modifier = Modifier.fillMaxWidth().height(50.dp)) {
                            Text("Back to Dashboard")
                        }
                    }
                }
                quizQuestions != null && quizQuestions!!.isNotEmpty() -> {
                    val isReviewMode = isQuizFinished && isReviewing
                    val currentQIndex = if (isReviewMode) reviewQuestionIndex else currentQuestionIndex
                    val question = quizQuestions!![currentQIndex]

                    Column(
                        modifier =
                            Modifier
                                .fillMaxSize()
                                .padding(24.dp),
                        verticalArrangement = Arrangement.Top,
                    ) {
                        Column(
                            modifier =
                                Modifier
                                    .fillMaxWidth()
                                    .weight(1f)
                                    .verticalScroll(rememberScrollState()),
                        ) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically,
                            ) {
                                Text(
                                    text =
                                        "Question ${currentQIndex + 1} of ${quizQuestions!!.size}" + if (isReviewMode) " (Review)" else "",
                                    style = MaterialTheme.typography.labelLarge,
                                    color = MaterialTheme.colorScheme.primary,
                                )
                                Text(
                                    text = "${((currentQIndex + 1).toFloat() / quizQuestions!!.size * 100).toInt()}%",
                                    style = MaterialTheme.typography.labelMedium,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                                )
                            }
                            Spacer(modifier = Modifier.height(8.dp))
                            androidx.compose.material3.LinearProgressIndicator(
                                progress = { (currentQIndex + 1).toFloat() / quizQuestions!!.size },
                                modifier =
                                    Modifier
                                        .fillMaxWidth()
                                        .height(8.dp)
                                        .clip(RoundedCornerShape(4.dp)),
                                color = MaterialTheme.colorScheme.primary,
                                trackColor = MaterialTheme.colorScheme.surfaceVariant,
                            )
                            Spacer(modifier = Modifier.height(8.dp))

                            Text(
                                text = question.question,
                                style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.SemiBold),
                                color = MaterialTheme.colorScheme.onBackground,
                            )
                            Spacer(modifier = Modifier.height(32.dp))

                            question.options.forEachIndexed { index, optionText ->
                                val isSelected = if (isReviewMode) userAnswers[currentQIndex] == index else selectedOptionIndex == index

                                val cardColor =
                                    if (isReviewMode) {
                                        when {
                                            index == question.answerIndex ->
                                                androidx.compose.ui.graphics
                                                    .Color(0xFF4CAF50)
                                                    .copy(alpha = 0.2f)
                                            isSelected && index != question.answerIndex ->
                                                androidx.compose.ui.graphics
                                                    .Color(0xFFF44336)
                                                    .copy(alpha = 0.2f)
                                            else -> MaterialTheme.colorScheme.surfaceVariant
                                        }
                                    } else {
                                        if (isSelected) {
                                            MaterialTheme.colorScheme.primaryContainer
                                        } else {
                                            MaterialTheme.colorScheme.surfaceVariant
                                        }
                                    }

                                val textColor =
                                    if (isReviewMode) {
                                        when {
                                            index == question.answerIndex ->
                                                androidx.compose.ui.graphics
                                                    .Color(0xFF2E7D32)
                                            isSelected && index != question.answerIndex ->
                                                androidx.compose.ui.graphics
                                                    .Color(0xFFC62828)
                                            else -> MaterialTheme.colorScheme.onSurfaceVariant
                                        }
                                    } else {
                                        if (isSelected) {
                                            MaterialTheme.colorScheme.onPrimaryContainer
                                        } else {
                                            MaterialTheme.colorScheme.onSurfaceVariant
                                        }
                                    }

                                OutlinedCard(
                                    modifier =
                                        Modifier
                                            .fillMaxWidth()
                                            .padding(vertical = 8.dp)
                                            .clickable(enabled = !isReviewMode) { selectedOptionIndex = index },
                                    shape = RoundedCornerShape(20.dp),
                                    colors =
                                        CardDefaults.outlinedCardColors(containerColor = cardColor),
                                    border =
                                        androidx.compose.foundation.BorderStroke(
                                            width = if (isSelected || isReviewMode) 2.dp else 1.dp,
                                            color =
                                                if (isSelected &&
                                                    !isReviewMode
                                                ) {
                                                    MaterialTheme.colorScheme.primary
                                                } else if (isReviewMode &&
                                                    index == question.answerIndex
                                                ) {
                                                    androidx.compose.ui.graphics
                                                        .Color(0xFF4CAF50)
                                                } else if (isReviewMode &&
                                                    isSelected
                                                ) {
                                                    androidx.compose.ui.graphics
                                                        .Color(0xFFF44336)
                                                } else {
                                                    MaterialTheme.colorScheme.outlineVariant
                                                },
                                        ),
                                ) {
                                    Text(
                                        text = optionText,
                                        modifier = Modifier.padding(20.dp),
                                        style =
                                            MaterialTheme.typography.bodyLarge.copy(
                                                fontWeight =
                                                    if (isSelected ||
                                                        (isReviewMode && index == question.answerIndex)
                                                    ) {
                                                        FontWeight.Bold
                                                    } else {
                                                        FontWeight.Normal
                                                    },
                                            ),
                                        color = textColor,
                                    )
                                }
                            }

                            if (isReviewMode && question.rationale.isNotBlank()) {
                                Spacer(modifier = Modifier.height(16.dp))
                                OutlinedCard(
                                    modifier = Modifier.fillMaxWidth(),
                                    colors = CardDefaults.outlinedCardColors(containerColor = MaterialTheme.colorScheme.surface),
                                ) {
                                    Column(modifier = Modifier.padding(16.dp)) {
                                        Text(
                                            "Explanation",
                                            style = MaterialTheme.typography.titleMedium,
                                            fontWeight = FontWeight.Bold,
                                            color = MaterialTheme.colorScheme.primary,
                                        )
                                        Spacer(modifier = Modifier.height(8.dp))
                                        Text(
                                            question.rationale,
                                            style = MaterialTheme.typography.bodyMedium,
                                            color = MaterialTheme.colorScheme.onSurface,
                                        )
                                    }
                                }
                            }
                        }

                        Spacer(modifier = Modifier.height(16.dp))

                        if (!isReviewMode) {
                            Button(
                                onClick = {
                                    userAnswers[currentQuestionIndex] = selectedOptionIndex!!

                                    if (selectedOptionIndex == question.answerIndex) {
                                        score++
                                    }

                                    if (currentQuestionIndex < quizQuestions!!.size - 1) {
                                        currentQuestionIndex++
                                        selectedOptionIndex = null
                                    } else {
                                        isQuizFinished = true

                                        val timeTakenMs = System.currentTimeMillis() - quizStartTime
                                        val userId = FirebaseAuth.getInstance().currentUser?.uid
                                        if (userId != null && quizQuestions != null) {
                                            val totalQuestions = quizQuestions!!.size
                                            val historyRef =
                                                FirebaseDatabase
                                                    .getInstance()
                                                    .getReference(
                                                        "users/$userId/history/quizzes",
                                                    ).push()
                                            val quizData =
                                                mapOf(
                                                    "id" to historyRef.key,
                                                    "subject" to subject,
                                                    "topic" to "Daily Quiz",
                                                    "score" to score,
                                                    "totalQuestions" to totalQuestions,
                                                    "timeTakenSeconds" to timeTakenMs / 1000,
                                                    "correctAnswers" to score,
                                                    "incorrectAnswers" to totalQuestions - score,
                                                    "timestamp" to com.google.firebase.database.ServerValue.TIMESTAMP,
                                                )
                                            coroutineScope.launch {
                                                try {
                                                    historyRef.setValue(quizData).await()
                                                } catch (e: Exception) {
                                                    // Ignore if history fails to save
                                                }
                                            }
                                        }
                                    }
                                },
                                enabled = selectedOptionIndex != null,
                                modifier = Modifier.fillMaxWidth().height(50.dp),
                                shape = RoundedCornerShape(12.dp),
                            ) {
                                Text(if (currentQuestionIndex < quizQuestions!!.size - 1) "Next Question" else "Finish Quiz")
                            }
                        } else {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                            ) {
                                Button(
                                    onClick = { if (reviewQuestionIndex > 0) reviewQuestionIndex-- },
                                    enabled = reviewQuestionIndex > 0,
                                    modifier = Modifier.weight(1f).height(50.dp),
                                    shape = RoundedCornerShape(12.dp),
                                ) {
                                    Text("Previous")
                                }
                                Spacer(modifier = Modifier.width(16.dp))
                                if (reviewQuestionIndex < quizQuestions!!.size - 1) {
                                    Button(
                                        onClick = { reviewQuestionIndex++ },
                                        modifier = Modifier.weight(1f).height(50.dp),
                                        shape = RoundedCornerShape(12.dp),
                                    ) {
                                        Text("Next")
                                    }
                                } else {
                                    Button(
                                        onClick = { isReviewing = false },
                                        modifier = Modifier.weight(1f).height(50.dp),
                                        shape = RoundedCornerShape(12.dp),
                                    ) {
                                        Text("Close")
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
