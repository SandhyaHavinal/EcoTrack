# 🌱 EcoTrack — AI-Powered Carbon Footprint Tracker & Sustainability Coach

EcoTrack is a production-ready, full-featured sustainability platform designed to help individuals track, understand, and reduce their carbon footprint. The codebase combines a **React + TypeScript** frontend with a **Tailwind CSS v4** styling system and **Firebase** cloud services. It integrates the **Gemini AI API** to provide custom motivational eco-coaching and the **Google Maps Platform** to compare transit routing footprints.

---

## ⚡ Core Features

*   **📊 Smart Dashboard**: High-fidelity glassmorphic dashboard tracking monthly footprint totals, sustainability scorecards (0-100), active carbon reduction goals, and lifetime gamification points. Incorporates responsive Recharts (Pie and stacked Bar) visualizations.
*   **🤖 AI Sustainability Coach (Gemini)**: Analyzes user consumption patterns to generate personalized footprint reports, 3 targeted eco-alternatives with exact CO₂ savings, 7-day checklists, and plateau-vs-action predictive emissions graphs.
*   **🧼 Multi-Step Calculator Wizard**: Simple calculators for transportation modes, utility bills (electricity/water), food diets, and waste generation (with recycling/composting credits).
*   **🗺️ Travel Route Tracker**: Integrated routing engine comparing emissions for standard cars, EVs, public buses, trains, and cycling for specific routes, allowing trips to be logged directly into user histories.
*   **🏆 Eco-Challenges & Goal Systems**: Gamified dashboard elements including XP, level progressions, custom goals targets, earned badge shelves, and active challenge join controls.
*   **📄 PDF Reports Hub**: Dynamic generation and download of verified carbon summary cards utilizing code-split `html2canvas` and `jspdf` libraries.
*   **🛡️ Admin Panel**: A secure back-office console allowing administrators to publish challenges, write markdown articles, and monitor user scorecards.

---

## 🛠️ Technology Stack

*   **Frontend**: React (Vite), TypeScript, Tailwind CSS v4, Recharts, Lucide Icons
*   **Backend & Security**: Firebase Auth (Google Sign-In, Email Sign-In), Firestore Database, Firebase Hosting, Firestore Rules
*   **AI & Maps**: Gemini 1.5 Flash API, Google Maps JavaScript Platform APIs
*   **Export Engines**: jsPDF, html2canvas (dynamically code-split)
*   **Functions**: Node 18, TypeScript, Firebase Functions, Google Gen AI SDK

---

## 📁 File Directory Structure

```
Carbontracker/
├── package.json              # Main package manifest
├── tailwind.config.js        # Tailwind legacy configuration mapping
├── postcss.config.js         # PostCSS Tailwind v4 adapter config
├── vite.config.ts            # Vite compile options
├── tsconfig.json             # TypeScript compiler settings
├── index.html                # Entry HTML (descriptive SEO meta tags)
├── firebase.json             # Firebase deployment rewrites and paths
├── firestore.rules           # Scoped role-based Firestore security rules
├── firestore.indexes.json    # Firestore empty index templates
├── .env.example              # Key environment variables reference
├── .gitignore                # Ignored system and build assets
├── src/
│   ├── main.tsx              # DOM mounter
│   ├── index.css             # Tailwind v4 import and custom @theme declarations
│   ├── App.tsx               # Client router switch
│   ├── firebase.ts           # Firebase client-side client config
│   ├── types.ts              # Global TypeScript interfaces
│   ├── context/
│   │   ├── AuthContext.tsx   # Auth scope, signin, and LocalStorage auth fallback
│   │   └── EcoTrackContext.tsx # Main state engine, calculators, and points
│   ├── services/
│   │   ├── emissions.ts      # Carbon emission factors and scoring algorithms
│   │   └── gemini.ts         # Gemini AI interface and offline coach fallback generator
│   ├── components/
│   │   ├── Layout.tsx        # Side-navigation and dark mode switcher
│   │   └── ProtectedRoute.tsx # Route authentication lock
│   └── pages/
│       ├── Login.tsx         # Tabbed authentication portal
│       ├── Dashboard.tsx     # Recharts summary and AI Coach panel
│       ├── Calculator.tsx    # Multi-step wizard log
│       ├── TravelTracker.tsx # Google Maps comparative router
│       ├── Challenges.tsx    # Badges, goals, and challenge cards
│       ├── EducationalHub.tsx # Article layout with reading time estimates
│       ├── Reports.tsx       # Peer benchmarking and PDF exports
│       └── AdminPanel.tsx    # Admin challenge and article publishers
└── functions/
    ├── package.json          # Server functions manifest
    ├── tsconfig.json         # TS compile options for functions
    └── src/
        └── index.ts          # Callable Gemini getEcoCoachRecommendations endpoint
```

---

## 🚀 Getting Started (Local Development)

### Prerequisites
Make sure you have Node.js (version 18 or higher) and npm installed.

### 1. Clone & Install
```bash
git clone https://github.com/your-username/ecotrack.git
cd ecotrack
npm install
```

### 2. Configure Credentials
Create a `.env` file in the root directory by copying the `.env.example`:
```bash
cp .env.example .env
```
Fill in your keys:
```env
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id

VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_GOOGLE_MAPS_API_KEY=your_maps_api_key
```

*Note: If no Firebase keys or API keys are specified, EcoTrack automatically enters **Offline Simulation Mode** (using LocalStorage auth, static route simulations, and local AI coaching heuristics), allowing you to run, test, and present the app immediately without setting up accounts.*

### 3. Run Development Server
```bash
npm run dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser.

---

## 📈 Testing Calculations

The codebase features 12 automated unit tests verifying the mathematical models of all emission categories and scoring equations. Run the tests using:
```bash
node brain/c75ae46e-9cde-4f0d-80fc-ae9a1fe4a150/scratch/test_calculations.js
```

---

## ☁️ Production Deployment

### 1. Enable Firestore & Auth
1. Go to the **[Firebase Console](https://console.firebase.google.com/)** and select your project.
2. Under **Authentication**, click *Get Started* and enable **Email/Password** and **Google** sign-in providers.
3. Under **Firestore Database**, click *Create Database* and start in **Test Mode**.

### 2. Deploy to Firebase
Run the following commands in your terminal:
```bash
# Log in to Google account
firebase login

# Add your target firebase project mapping
firebase use --add

# Compile client code for production
npm run build

# Deploy Hosting and Firestore security rules
firebase deploy --only hosting,firestore
```
Once deployed, the terminal will return your live **Hosting URL** (e.g. `https://your-project.web.app`).
