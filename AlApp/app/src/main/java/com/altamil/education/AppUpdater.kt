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
import androidx.core.content.ContextCompat
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
    private fun isValidApkUrl(rawUrl: String): Boolean = try {
        val uri = Uri.parse(rawUrl)
        uri.scheme.equals("https", ignoreCase = true) &&
            !uri.host.isNullOrBlank() &&
            uri.userInfo == null &&
            (uri.port == -1 || uri.port == 443)
    } catch (_: Exception) {
        false
    }

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

                        if (latestVersion > currentVersion) {
                            if (!isValidApkUrl(apkUrl)) {
                                onResult(null)
                                return
                            }
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
        if (!isValidApkUrl(apkUrl)) {
            Toast.makeText(context, "Update URL is invalid. Use a secure HTTPS link.", Toast.LENGTH_LONG).show()
            return
        }
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
                        val manager = context.getSystemService(Context.DOWNLOAD_SERVICE) as DownloadManager
                        val cursor = manager.query(DownloadManager.Query().setFilterById(downloadId))
                        try {
                            if (cursor != null && cursor.moveToFirst()) {
                                val status = cursor.getInt(cursor.getColumnIndexOrThrow(DownloadManager.COLUMN_STATUS))
                                if (status == DownloadManager.STATUS_SUCCESSFUL) {
                                    installApk(fileName)
                                } else {
                                    Toast.makeText(context, "Update download failed. Please try again.", Toast.LENGTH_LONG).show()
                                }
                            } else {
                                Toast.makeText(context, "Could not verify the downloaded update.", Toast.LENGTH_LONG).show()
                            }
                        } finally {
                            cursor?.close()
                            try {
                                context.unregisterReceiver(this)
                            } catch (_: Exception) {
                                // The receiver may already have been unregistered.
                            }
                        }
                    }
                }
            }

        // Only system-originated download completion broadcasts should reach this receiver.
        ContextCompat.registerReceiver(
            context,
            receiver,
            IntentFilter(DownloadManager.ACTION_DOWNLOAD_COMPLETE),
            ContextCompat.RECEIVER_NOT_EXPORTED,
        )
    }

    private fun installApk(fileName: String) {
        try {
            val file =
                File(
                    Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS),
                    fileName,
                )

            if (file.exists() && file.length() > 0L) {
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
