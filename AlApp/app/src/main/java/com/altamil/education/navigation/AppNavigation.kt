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
package com.altamil.education.navigation

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.altamil.education.admin.AdminDashboardScreen
import com.altamil.education.auth.LoginScreen
import com.altamil.education.auth.RegistrationScreen
import com.altamil.education.payment.PremiumCheckoutScreen
import com.altamil.education.pdf.PdfViewerScreen
import com.altamil.education.profile.ProfileScreen
import com.altamil.education.student.StudentDashboardScreen

@Composable
fun AppNavigation() {
    val navController = rememberNavController()

    val startDestination = "login"

    NavHost(
        navController = navController,
        startDestination = startDestination,
        enterTransition = {
            androidx.compose.animation.slideInHorizontally(
                initialOffsetX = { 1000 },
                animationSpec =
                    androidx.compose.animation.core
                        .tween(300),
            ) +
                androidx.compose.animation.fadeIn(
                    animationSpec =
                        androidx.compose.animation.core
                            .tween(300),
                )
        },
        exitTransition = {
            androidx.compose.animation.slideOutHorizontally(
                targetOffsetX = { -1000 },
                animationSpec =
                    androidx.compose.animation.core
                        .tween(300),
            ) +
                androidx.compose.animation.fadeOut(
                    animationSpec =
                        androidx.compose.animation.core
                            .tween(300),
                )
        },
        popEnterTransition = {
            androidx.compose.animation.slideInHorizontally(
                initialOffsetX = { -1000 },
                animationSpec =
                    androidx.compose.animation.core
                        .tween(300),
            ) +
                androidx.compose.animation.fadeIn(
                    animationSpec =
                        androidx.compose.animation.core
                            .tween(300),
                )
        },
        popExitTransition = {
            androidx.compose.animation.slideOutHorizontally(
                targetOffsetX = { 1000 },
                animationSpec =
                    androidx.compose.animation.core
                        .tween(300),
            ) +
                androidx.compose.animation.fadeOut(
                    animationSpec =
                        androidx.compose.animation.core
                            .tween(300),
                )
        },
    ) {
        composable("login") {
            LoginScreen(
                onLoginAdmin = { navController.navigate("admin_dashboard") { popUpTo("login") { inclusive = true } } },
                onLoginStudent = { navController.navigate("student_main") { popUpTo("login") { inclusive = true } } },
                onNavigateToRegister = { navController.navigate("register") },
            )
        }
        composable("register") {
            RegistrationScreen(
                onRegistrationSuccess = { navController.navigate("student_main") { popUpTo("login") { inclusive = true } } },
                onNavigateBack = { navController.popBackStack() },
            )
        }
        composable("admin_dashboard") {
            AdminDashboardScreen(
                onLogoutSuccess = { navController.navigate("login") { popUpTo(0) } },
            )
        }
        composable("student_main") {
            com.altamil.education.student.StudentMainScreen(
                onFolderClick = { id, name ->
                    navController.navigate("folder_viewer/$name")
                },
                onNavigateToUpgrade = { navController.navigate("payment") },
                onLogoutSuccess = { navController.navigate("login") { popUpTo(0) } },
                onSuggestClick = { navController.navigate("suggest_material") },
                onAnalyticsClick = { navController.navigate("analytics") },
            )
        }
        composable(
            "quiz/{subjectName}",
            arguments = listOf(androidx.navigation.navArgument("subjectName") { type = androidx.navigation.NavType.StringType }),
        ) { backStackEntry ->
            val subjectName = backStackEntry.arguments?.getString("subjectName") ?: "Subject"
            com.altamil.education.student.QuizScreen(
                subject = subjectName,
                onNavigateBack = { navController.popBackStack() },
            )
        }
        composable("suggest_material") {
            com.altamil.education.student.SuggestMaterialScreen(
                onNavigateBack = { navController.popBackStack() },
            )
        }
        composable("analytics") {
            com.altamil.education.student.AnalyticsDashboardScreen(
                onNavigateBack = { navController.popBackStack() },
            )
        }
        composable(
            "folder_viewer/{subjectName}",
            arguments = listOf(androidx.navigation.navArgument("subjectName") { type = androidx.navigation.NavType.StringType }),
        ) { backStackEntry ->
            val subjectName = backStackEntry.arguments?.getString("subjectName") ?: "Subject"
            val profileViewModel: com.altamil.education.profile.ProfileViewModel =
                androidx.lifecycle.viewmodel.compose
                    .viewModel()
            val uiState by profileViewModel.uiState.collectAsState()

            com.altamil.education.student.FolderViewerScreen(
                subjectName = subjectName,
                isUserPremium = uiState.isPremium,
                isLoading = uiState.isLoading,
                onNavigateBack = { navController.popBackStack() },
                onSubFolderClick = { subFolder ->
                    navController.navigate("pdf_viewer/$subjectName/$subFolder")
                },
                onQuizClick = { navController.navigate("quiz/$subjectName") },
                onNavigateToPremium = { navController.navigate("payment") },
            )
        }
        composable("payment") {
            PremiumCheckoutScreen(
                onPaymentComplete = { navController.popBackStack() },
                onNavigateBack = { navController.popBackStack() },
            )
        }
        composable(
            "pdf_viewer/{subjectName}/{folderName}",
            arguments =
                listOf(
                    androidx.navigation.navArgument("subjectName") { type = androidx.navigation.NavType.StringType },
                    androidx.navigation.navArgument("folderName") { type = androidx.navigation.NavType.StringType },
                ),
        ) { backStackEntry ->
            val subjectName = backStackEntry.arguments?.getString("subjectName") ?: "Subject"
            val folderName = backStackEntry.arguments?.getString("folderName") ?: "Folder"
            PdfViewerScreen(
                subjectName = subjectName,
                folderName = folderName,
                onNavigateBack = { navController.popBackStack() },
                onNavigateToPremium = { navController.navigate("payment") },
            )
        }
    }
}
