plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
    id("com.google.gms.google-services")
    id("com.google.firebase.crashlytics")
}

android {
    namespace = "com.altamil.education"
    compileSdk = 36

    defaultConfig {
        applicationId = "com.altamil.education"
        minSdk = 23
        targetSdk = 36
        versionCode = 3
        versionName = "3.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        vectorDrawables {
            useSupportLibrary = true
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro",
            )
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlin {
        compilerOptions {
            jvmTarget.set(org.jetbrains.kotlin.gradle.dsl.JvmTarget.JVM_17)
        }
    }
    buildFeatures {
        compose = true
    }
    packaging {
        resources {
            excludes.add("/META-INF/{AL2.0,LGPL2.1}")
        }
    }
}

dependencies {
    implementation(libs.androidx.core.ktx)

    implementation(libs.bundles.androidx.lifeycle)

    implementation(libs.androidx.activity.compose)

    implementation(libs.bundles.compose.ui)
    implementation("androidx.compose.material:material-icons-extended:1.6.7")
    implementation("androidx.compose.ui:ui-text-google-fonts:1.6.7")

    implementation(libs.accompanist.systemuicontroller)

    implementation(libs.vinchamp77.buildutils)

    implementation(platform("com.google.firebase:firebase-bom:32.8.0"))
    implementation("com.google.firebase:firebase-auth")
    implementation("com.google.firebase:firebase-database")
    implementation("com.google.firebase:firebase-storage")
    implementation("com.google.firebase:firebase-analytics")
    implementation("com.google.firebase:firebase-crashlytics")

    implementation("androidx.navigation:navigation-compose:2.7.7")

    // Coroutines Play Services (For Firebase await)
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-play-services:1.7.3")

    // PayHere
    implementation("com.github.PayHereDevs:payhere-android-sdk:v3.0.18")
    implementation("com.google.code.gson:gson:2.8.0")

    // PDFBox-Android
    implementation("com.tom-roush:pdfbox-android:2.0.27.0")

    // Generative AI
    implementation("com.google.ai.client.generativeai:generativeai:0.6.0")

    // OkHttp for API calls
    implementation("com.squareup.okhttp3:okhttp:4.11.0")
}
