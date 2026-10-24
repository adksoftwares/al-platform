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
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import com.altamil.education.profile.ProfileScreen

@Composable
fun StudentMainScreen(
    onFolderClick: (String, String) -> Unit,
    onNavigateToUpgrade: () -> Unit,
    onLogoutSuccess: () -> Unit,
    onSuggestClick: () -> Unit = {},
    onAnalyticsClick: () -> Unit = {},
) {
    var selectedTab by remember { mutableIntStateOf(0) }

    Scaffold(
        bottomBar = {
            Column(
                modifier =
                    Modifier
                        .background(Color(0xFF1E1E2E))
                        .navigationBarsPadding(),
            ) {
                NavigationBar(
                    containerColor = Color.Transparent, // Let Column background show
                    contentColor = Color.White,
                    windowInsets = WindowInsets(0.dp), // Disable default insets to prevent double padding
                ) {
                    NavigationBarItem(
                        icon = { Icon(Icons.Default.Home, contentDescription = "Home") },
                        label = { Text("Home") },
                        selected = selectedTab == 0,
                        onClick = { selectedTab = 0 },
                        colors =
                            NavigationBarItemDefaults.colors(
                                selectedIconColor = Color(0xFF7C3AED), // Royal Indigo
                                selectedTextColor = Color(0xFF7C3AED),
                                indicatorColor = Color(0xFF2D2D44),
                                unselectedIconColor = Color.Gray,
                                unselectedTextColor = Color.Gray,
                            ),
                    )
                    NavigationBarItem(
                        icon = { Icon(Icons.Default.Search, contentDescription = "Search") },
                        label = { Text("Search") },
                        selected = selectedTab == 1,
                        onClick = { selectedTab = 1 },
                        colors =
                            NavigationBarItemDefaults.colors(
                                selectedIconColor = Color(0xFF7C3AED),
                                selectedTextColor = Color(0xFF7C3AED),
                                indicatorColor = Color(0xFF2D2D44),
                                unselectedIconColor = Color.Gray,
                                unselectedTextColor = Color.Gray,
                            ),
                    )
                    NavigationBarItem(
                        icon = { Icon(Icons.Default.Person, contentDescription = "Profile") },
                        label = { Text("Profile") },
                        selected = selectedTab == 2,
                        onClick = { selectedTab = 2 },
                        colors =
                            NavigationBarItemDefaults.colors(
                                selectedIconColor = Color(0xFF7C3AED),
                                selectedTextColor = Color(0xFF7C3AED),
                                indicatorColor = Color(0xFF2D2D44),
                                unselectedIconColor = Color.Gray,
                                unselectedTextColor = Color.Gray,
                            ),
                    )
                }
                Box(
                    modifier =
                        Modifier
                            .fillMaxWidth()
                            .padding(bottom = 8.dp),
                    contentAlignment = Alignment.Center,
                ) {
                    Text(
                        text = "Powered by ADK Software Solutions",
                        style = MaterialTheme.typography.labelSmall,
                        color = Color.Gray.copy(alpha = 0.6f),
                    )
                }
            }
        },
    ) { paddingValues ->
        Box(modifier = Modifier.padding(paddingValues)) {
            when (selectedTab) {
                0 ->
                    StudentDashboardScreen(
                        onFolderClick = onFolderClick,
                        onSuggestClick = onSuggestClick,
                        onAnalyticsClick = onAnalyticsClick,
                    )
                1 -> {
                    // Search Tab Placeholder
                    Box(
                        modifier = Modifier.fillMaxSize(),
                        contentAlignment = Alignment.Center,
                    ) {
                        Text("Advanced Search Coming Soon", color = Color.Gray)
                    }
                }
                2 ->
                    ProfileScreen(
                        onNavigateToUpgrade = onNavigateToUpgrade,
                        onLogoutSuccess = onLogoutSuccess,
                    )
            }
        }
    }
}
