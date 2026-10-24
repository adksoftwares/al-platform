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

### Environment Variables
Copy `.env.example` to `.env` in the root folder and fill in your credentials:

```bash
cp .env.example .env
```

```env
FIREBASE_API_KEY=your_firebase_web_api_key
FIREBASE_EMAIL=your_admin_email@example.com
FIREBASE_PASSWORD=your_admin_password
FIREBASE_DB_URL=https://your-project-default-rtdb.firebaseio.com
GEMINI_API_KEY=your_gemini_api_key
```

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
