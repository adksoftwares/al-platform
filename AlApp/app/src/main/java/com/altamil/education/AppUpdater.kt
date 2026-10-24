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

import android.app.DownloadManager
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.net.Uri
import android.os.Build
import android.os.Environment
import android.widget.Toast
import androidx.core.content.FileProvider
import com.google.firebase.database.DataSnapshot
import com.google.firebase.database.DatabaseError
import com.google.firebase.database.FirebaseDatabase
import com.google.firebase.database.ValueEventListener
import java.io.File

data class UpdateInfo(
    val isUpdateAvailable: Boolean,
    val latestVersionCode: Int,
    val apkUrl: String,
    val releaseNotes: String,
)

class AppUpdater(
    private val context: Context,
) {
    fun checkForUpdate(onResult: (UpdateInfo?) -> Unit) {
        val dbRef = FirebaseDatabase.getInstance().getReference("admin_settings/app_version")
        dbRef.addListenerForSingleValueEvent(
            object : ValueEventListener {
                override fun onDataChange(snapshot: DataSnapshot) {
                    try {
                        val latestVersion = snapshot.child("versionCode").getValue(Int::class.java) ?: 0
                        val apkUrl = snapshot.child("apkUrl").getValue(String::class.java) ?: ""
                        val notes = snapshot.child("releaseNotes").getValue(String::class.java) ?: "Bug fixes and improvements"

                        val pInfo = context.packageManager.getPackageInfo(context.packageName, 0)
                        val currentVersion =
                            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                                pInfo.longVersionCode.toInt()
                            } else {
                                @Suppress("DEPRECATION")
                                pInfo.versionCode
                            }

                        if (latestVersion > currentVersion && apkUrl.isNotEmpty()) {
                            onResult(UpdateInfo(true, latestVersion, apkUrl, notes))
                        } else {
                            onResult(UpdateInfo(false, latestVersion, apkUrl, notes))
                        }
                    } catch (e: Exception) {
                        onResult(null)
                    }
                }

                override fun onCancelled(error: DatabaseError) {
                    onResult(null)
                }
            },
        )
    }

    fun downloadAndInstallUpdate(apkUrl: String) {
        Toast.makeText(context, "Downloading update...", Toast.LENGTH_LONG).show()

        val fileName = "update_v${System.currentTimeMillis()}.apk"
        val request =
            DownloadManager
                .Request(Uri.parse(apkUrl))
                .setTitle("Downloading Update")
                .setDescription("Please wait while the new version is downloaded.")
                .setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED)
                .setDestinationInExternalPublicDir(Environment.DIRECTORY_DOWNLOADS, fileName)
                .setAllowedOverMetered(true)
                .setAllowedOverRoaming(true)

        val downloadManager = context.getSystemService(Context.DOWNLOAD_SERVICE) as DownloadManager
        val downloadId = downloadManager.enqueue(request)

        val receiver =
            object : BroadcastReceiver() {
                override fun onReceive(
                    context: Context,
                    intent: Intent,
                ) {
                    val id = intent.getLongExtra(DownloadManager.EXTRA_DOWNLOAD_ID, -1)
                    if (id == downloadId) {
                        installApk(fileName)
                        try {
                            context.unregisterReceiver(this)
                        } catch (e: Exception) {
                            e.printStackTrace()
                        }
                    }
                }
            }

        // Register receiver for when download is complete
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            context.registerReceiver(
                receiver,
                IntentFilter(DownloadManager.ACTION_DOWNLOAD_COMPLETE),
                Context.RECEIVER_EXPORTED,
            )
        } else {
            context.registerReceiver(
                receiver,
                IntentFilter(DownloadManager.ACTION_DOWNLOAD_COMPLETE),
            )
        }
    }

    private fun installApk(fileName: String) {
        try {
            val file =
                File(
                    Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS),
                    fileName,
                )

            if (file.exists()) {
                val intent = Intent(Intent.ACTION_VIEW)
                val uri =
                    FileProvider.getUriForFile(
                        context,
                        "${context.packageName}.provider",
                        file,
                    )

                intent.setDataAndType(uri, "application/vnd.android.package-archive")
                intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_GRANT_READ_URI_PERMISSION
                context.startActivity(intent)
            } else {
                Toast.makeText(context, "Update file not found", Toast.LENGTH_SHORT).show()
            }
        } catch (e: Exception) {
            e.printStackTrace()
            Toast.makeText(context, "Failed to install update: ${e.message}", Toast.LENGTH_LONG).show()
        }
    }
}
