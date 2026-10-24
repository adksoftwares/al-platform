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
package com.altamil.education

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import com.altamil.education.navigation.AppNavigation
import com.altamil.education.ui.theme.AlAppTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val appUpdater = AppUpdater(this)

        setContent {
            var updateInfo by remember { mutableStateOf<UpdateInfo?>(null) }

            LaunchedEffect(Unit) {
                appUpdater.checkForUpdate { info ->
                    if (info != null && info.isUpdateAvailable) {
                        updateInfo = info
                    }
                }
            }

            AlAppTheme {
                AppNavigation()

                updateInfo?.let { info ->
                    AlertDialog(
                        onDismissRequest = {
                            // Uncomment to force update
                            // updateInfo = null
                        },
                        title = { Text(text = "Update Available") },
                        text = { Text(text = "A new version of the app is available.\n\n${info.releaseNotes}") },
                        confirmButton = {
                            Button(
                                onClick = {
                                    appUpdater.downloadAndInstallUpdate(info.apkUrl)
                                    updateInfo = null
                                },
                            ) {
                                Text("Update Now")
                            }
                        },
                        dismissButton = {
                            TextButton(
                                onClick = { updateInfo = null },
                            ) {
                                Text("Later")
                            }
                        },
                    )
                }
            }
        }
    }
}
