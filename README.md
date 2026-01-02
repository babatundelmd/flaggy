# Flag Master (flaggy) 🌍

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7.x-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-9.x-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Testing](https://img.shields.io/badge/Tests-passing-34D058?logo=vitest&logoColor=white)](https://vitest.dev/)
[![Cypress](https://img.shields.io/badge/E2E-Cypress-17202C?logo=cypress&logoColor=white)](https://www.cypress.io/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A high-performance, minimalist flag learning application built with React 19, TypeScript, and Vite. Now featuring a real-time **Global Leaderboard**, **Authentication**, and precise **Speed Tracking** for the ultimate competitive geography experience.

## ✨ New Features

### 🏆 Global Leaderboard & Competition
Compete with players worldwide!
-   **Real-Time Rankings**: Powered by **Firestore** live snapshots.
-   **Multi-Dimensional Sorting**: Ranked by **Score** (primary) and **Average Time** (tie-breaker)—speed matters!
-   **Global vs. Local**: Toggle between "World" and "Country" (IP-based) leaderboards.
-   **Time Frames**: View top scores for **Daily**, **Weekly**, and **All-Time** periods.
-   **Smart Deduplication**: The leaderboard automatically filters to show only your single *best* score per period.

### 🔐 Authentication
-   **Sign In with Google**: Secure, one-click login via Firebase Auth.
-   **Persist Your Stats**: Save your progress and competition history across devices.

### 🎮 Enhanced Game Flow
-   **Strict Pause Control**: The game puts YOU in control. The timer **never** starts automatically. You must explicitly click the **Play** button to begin or resume.
-   **Results Analysis**: After each round, get a detailed breakdown of your Accuracy, Score, and Speed.
-   **Region Mastery**: Filter flags by specific regions (e.g., "Africa", "Europe") or even subregions (e.g., "Western Europe") to focus your learning.

---

## Technical Architecture

### Core Stack
-   **Frontend**: React 19 + TypeScript + Vite.
-   **Backend / BaaS**: Firebase (Auth, Firestore).
-   **Analytics**: PostHog integration for usage tracking.
-   **State Management**: TanStack Query (React Query) + Context API.
-   **Styling**: Custom CSS Modules + Framer Motion for animations.

### Game Logic Mechanics

#### 1. Unique Cycle Algorithm (`queueRef`)
To prevent repetitive questions within a session:
-   **Shuffled Queue**: On initialization, the entire pool of filtered countries is shuffled.
-   **Zero-Repeat Guarantee**: Flags are popped from the queue until empty, ensuring every flag is seen exactly once before any repeats.
-   **Seamless Refill**: The queue automatically refills and reshuffles without breaking flow.

#### 2. Adaptive Difficulty
Difficulty filters the dataset based on population density (recognition proxy):
-   **Beginner**: Top 50 most populous countries.
-   **Medium**: Top 100 countries.
-   **Hard**: Top 200 countries.
-   **Genius**: All ~250+ countries/territories.

#### 3. Database Schema (Firestore)
-   **Users Collection**: Stores profile info and detected country.
-   **Scores Collection**: Stores individual game sessions with:
    -   `score` (Points)
    -   `accuracy` (%)
    -   `averageTime` (Seconds - critical for tie-breaking)
    -   `dayId` / `weekId` (For period filtering)

## 🚀 Getting Started

### Prerequisites
-   Node.js > 18
-   A Firebase Project with Auth (Google) and Firestore enabled.

### Setup
1.  **Clone the repo**
    ```bash
    git clone https://github.com/babatundelmd/flaggy.git
    cd flaggy
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Configure Environment**
    Create a `.env` file in the root directory:
    ```env
    VITE_FIREBASE_API_KEY=your_api_key
    VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
    VITE_FIREBASE_PROJECT_ID=your_project_id
    VITE_FIREBASE_STORAGE_BUCKET=your_bucket
    VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
    VITE_FIREBASE_APP_ID=your_app_id
    ```

4.  **Run Development Server**
    ```bash
    npm run dev
    ```

### Testing
Flag Master includes unit and E2E tests.
```bash
# Unit Tests (Vitest)
npm run test:unit

# E2E Tests (Cypress)
npm run cy:open
```

## 📄 License
MIT License. Built with ❤️ by Babatunde.
