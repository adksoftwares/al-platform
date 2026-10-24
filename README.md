# 🎓 AL Education Platform

> Comprehensive digital learning ecosystem and Sri Lankan National Curriculum (A/L) exam preparation platform. Built with native Android (Kotlin), modern Web (React + TypeScript), and an AI-driven Daily Quiz & Terminology Verification Engine.

---

## 🌟 Architecture & Project Structure

The repository unifies all components of the Advanced Level (A/L) education system:

```text
AL/
├── AlApp/              # Native Android App (Kotlin, Jetpack Compose, Firebase)
│   ├── app/            # Mobile application modules & UI screens
│   └── scripts/        # Automated Gemini AI Daily & Unit Quiz generation pipeline
├── web/                # Modern Web Portal & Administration Dashboard (React 19, TypeScript, Vite)
│   ├── src/            # Components, pages, NIE terminology master services
│   └── scripts/        # Multi-stage NIE Terminology Validators & Sanitizers
├── backend/            # Backend API services & Cloud Function handlers
└── telegram-bot/       # Automated resource scraper & community bot
```

---

## 🚀 Key Features

### 1. 📱 Android Application (`AlApp/`)
* **Daily & Unit Quizzes:** Subject-wise (Biology, Chemistry, Physics) MCQs rotated daily.
* **Sri Lankan Exam Standard:** Indistinguishable from official Department of Examinations (DoE) G.C.E. A/L national exam papers.
* **Modern UI:** Built using Jetpack Compose, Material 3 design, and smooth animations.
* **Offline-friendly & Firebase Sync:** Realtime Database integration for instant syncing.

### 2. 💻 Web Portal (`web/`)
* **Student & Teacher Experience:** Interactive quiz practice, review modes, and detailed rationales.
* **Strict NIE Terminology Guard:** Live dictionary enforcement preventing Indian Tamil transliterations and enforcing pure Sri Lankan NIE terms (e.g., `DNA` instead of `டி.என்.ஏ`, `படிமச்சு` instead of `தாங்குருப்பி`, `குருதி` instead of `இரத்தம்`, `மீடிறன்` instead of `அதிர்வெண்`).

### 3. 🤖 AI-Powered Quiz & Audit Pipeline
* **Gemini 2.5 Engine:** Reads official NIE Resource Book chapters natively.
* **Double-Check AI Auditor:** Reviews generated MCQs against the source PDF to eliminate hallucinations.
* **Node.js Automated Failsafe:** Scrubs all blacklist terms and applies exact NIE replacements before uploading to Firebase.

---

## 🛠️ Setup & Configuration

### Prerequisites
* **Android Studio:** Ladybug / Koala or newer with JDK 17+
* **Node.js:** v18+ (Node.js 20+ recommended)
* **Python:** 3.10+
* **Firebase:** A Firebase Project with Realtime Database & Authentication enabled

### Environment and secrets

The root `.env.example` is for the backend service. Copy it locally and keep the real `.env` file out of Git:

```bash
cp .env.example .env
```

Configure these values in the backend host's secret manager for deployment:

- `FIREBASE_DB_URL`: the project's Realtime Database URL.
- `FIREBASE_SERVICE_ACCOUNT`: minified service-account JSON stored only as a server secret.
- `CORS_ALLOWED_ORIGINS`: exact HTTPS origin(s) of the deployed web portal, comma-separated.
- `TRUST_PROXY_HOPS`: leave as `0` unless the deployment's reverse-proxy chain is known and configured.
- `GEMINI_API_KEY`: use a GitHub Actions secret for quiz generation; do not place it in client-side code.

The web Firebase client configuration in `web/src/config/firebase.ts` is public client configuration, not an admin credential. Protect data with Firebase Authentication and Realtime Database rules. **Never add `FIREBASE_EMAIL`, `FIREBASE_PASSWORD`, service-account JSON, or private keys to frontend code or committed files.** Admin access must be granted through a trusted Firebase custom claim (`admin: true`), not by matching an email address or a profile field.

Set `VITE_BACKEND_BASE_URL` in `web/.env` to the deployed backend's HTTPS origin (without an `/api` suffix). For Android, pass the deployed HTTPS backend origin to Gradle with `-PbackendBaseUrl=https://YOUR_DEPLOYED_HOST`. The app updater reads `admin_settings/app_version`; signed-in users can read update metadata, while only a trusted administrator can publish it.

Existing accounts that used the old predictable password scheme must use verified Firebase password recovery before access is restored. Do not reintroduce the legacy fallback.

### Running the Web Portal
```bash
cd web
npm install
npm run dev
```

### Building the Android App
Open `AlApp` in Android Studio and build the project via Gradle:
```bash
cd AlApp
./gradlew assembleDebug
```

---

## 📄 License
All rights reserved © 2026 ADK Softwares.
