# The Daily Chronicle — Professional MERN News Portal

A state-of-the-art, dignified news portal built using the **MERN** stack (MongoDB, Express, React, Node.js). Designed with an authoritative editorial aesthetic: a pure white background, restrained single-accent deep navy palette, and elegant typography without distracting animations or rainbow colors.

---

## 🏛️ Key Features

### 1. Editorial Navigation Bar
- **6 Core News Desks**:
  1. **Politics**: Policy reforms, legislative updates, and governance dispatches.
  2. **Agriculture**: Sustainable farming tech, irrigation telemetry, and agricultural markets.
  3. **Education**: STEM research benchmarks, university accreditations, and digital literacy.
  4. **Economy**: Central bank policy, GDP metrics, manufacturing indices, and commerce.
  5. **Technology**: Semiconductor fabrication, AI infrastructure, and battery breakthroughs.
  6. **Health**: Regional genomic surveillance, clinical trials, and pediatric cardiology.
- **Search Icon**: Clean inline expanding search bar with instant title, summary, content, and author search.
- **Login & Profile**: Seamless authentication modal supporting user sign-in and registration, with an **Auto-Fill Demo Account** (`reader@gazette.org` / `password123`).
- **Saved Articles (Bookmarks)**: Slide-out reading drawer to save and manage reports for later offline reading.

### 2. Design Aesthetic
- **Single Professional Accent**: Deep Editorial Navy (`#0f2b5c` / `#1e3a8a`).
- **Minimalist & Pure**: Clean white surfaces (`#ffffff`), hairline dividing rules, and zero noisy animations.
- **Authoritative Typography**: Google Fonts `Playfair Display` for headlines, `Newsreader` for long-form reportage, and `Inter` for crisp UI elements.

### 3. Full-Stack MERN Architecture
- **Backend (`/server`)**:
  - Express API with JWT authentication and bcrypt password hashing.
  - Mongoose models for `Article` and `User`.
  - Automatic fallback to high-fidelity in-memory data store if MongoDB is offline or not installed locally, ensuring 100% crash-free startup.
  - Full MongoDB persistence enabled automatically when `MONGODB_URI` is supplied in `.env`.
- **Frontend (`/client`)**:
  - Built with React 19 and Vite for lightning-fast bundling.
  - Clean vanilla CSS design system in [index.css](file:///d:/Projects/News%20Portal/client/src/index.css) and [App.css](file:///d:/Projects/News%20Portal/client/src/App.css).
  - Lucide React icons for sharp SVG graphics.

---

## 🚀 Running the Project

### Prerequisites
- Node.js (v18+)
- npm (v9+)

### Quick Start (Both Backend and Frontend)
From the project root:
```bash
# Start both server and client concurrently
npm run dev
```

Alternatively, run each service independently:

#### 1. Backend Server
```bash
cd server
npm run dev
```
*API runs at `http://localhost:5000`*

#### 2. Frontend Client
```bash
cd client
npm run dev
```
*Application runs at `http://localhost:5173`*

---

## 🔑 Demo Account Credentials
- **Email**: `reader@gazette.org`
- **Password**: `password123`
*(A convenient "Auto-Fill Demo" button is provided in the Sign In modal).*
