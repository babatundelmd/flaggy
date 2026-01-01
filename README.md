# Flag Master (flaggy) 🌍

A high-performance, minimalist flag learning application built with React 19, TypeScript, and Vite. Designed with a focus on smooth UX, precise game logic, and technical excellence.

## 🚀 Technical Architecture

The application is architected for speed and maintainability, leveraging modern React patterns and a robust data layer.

### Core Stack
- **Frontend**: [React 19](https://react.dev/) with functional components and hooks.
- **Language**: [TypeScript](https://www.typescriptlang.org/) for strict type safety across the domain model.
- **Build Tool**: [Vite](https://vitejs.dev/) for blazingly fast development and optimized production builds.
- **State Management**: [TanStack Query (React Query)](https://tanstack.com/query/latest) for declarative data fetching and caching.
- **Styling**: Vanilla CSS with CSS Variables for a dynamic "glassmorphism" design system.
- **Animations**: [Framer Motion](https://www.framer.com/motion/) for fluid UI transitions and micro-interactions.
- **Icons**: [Lucide React](https://lucide.dev/) for a clean, consistent icon set.

## 🧠 Game Logic & State Mechanics

The "heart" of Flag Master lies in its deterministic yet randomized question generation system.

### 1. Unique Cycle Algorithm (`queueRef`)
To prevent repetitive questions within a session, the app implements a queue-based presentation system using React's `useRef`:
- **Shuffled Queue**: On initialization or reset, the entire pool of countries (based on filters) is shuffled and stored in `queueRef`.
- **Zero-Repeat Guarantee**: Flags are popped from the queue until empty. This ensures every flag in the filtered set is seen exactly once before any repeats occur.
- **Seamless Refill**: When the queue exhausts, it automatically reshuffles and refills, with a safety check to ensure the last flag of the previous cycle isn't the first of the next.

### 2. Difficulty-Population Mapping
Difficulty levels aren't just for show; they filter the country dataset based on population density—a proxy for "recognition" difficulty:
- **Beginner**: Top 50 most populous countries.
- **Medium**: Top 100 countries.
- **Hard**: Top 200 countries.
- **Genius**: All ~250+ countries/territories.

### 3. High-Precision Timer
The timer is implemented via `window.setInterval` with a 100ms granularity, allowing for smooth visual progress bar updates and precise "Time's Up" detection across different difficulty-based limits (2s to 15s).

## 📡 Data Layer & API Integration

Flag Master consumes the [RestCountries API](https://restcountries.com/) via a typed fetcher:

- **Selective Fields**: Queries specifically request `name`, `flags`, `cca3`, `region`, `subregion`, and `population` to minimize payload size.
- **React Query Integration**: Provides automatic caching, loading states, and error handling with a custom `useFlags` hook.
- **Dynamic Filtering**: Logic for region and subregion filtering is performed client-side on the cached dataset for instantaneous UI updates without additional network overhead.

## 🎨 Design System

The UI follows a **Glassmorphism** aesthetic, utilizing:
- **Backdrop Filters**: `backdrop-filter: blur(8px)` for depth.
- **CSS Grid/Flexbox**: A responsive split-layout that adapts from widescreen desktops to mobile devices.
- **Design Tokens**: A comprehensive set of CSS variables (`--primary`, `--bg-gradient`, etc.) for consistent theme management.

## 🛠️ Development

### Setup
```bash
npm install
npm run dev
```

### Build
```bash
npm run build
```

### Linting
```bash
npm run lint
```

---
*Developed with ❤️ and React.*
