# Beyond Headlines — Editorial Publishing Platform & News Portal

[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.21-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-MIT-0f2b5c?style=flat-square)](LICENSE)

An enterprise-grade, full-stack news publishing and editorial management platform built with the MERN stack. Designed with a clean, high-contrast broadsheet aesthetic featuring a pure white background, deep editorial navy accenting (`#0f2b5c`), and rigorous typography engineered for authoritative journalism.

---

## Architectural Highlights

- **Pure Broadsheet Design System**: Zero garish gradients or distracting micro-animations. Built strictly with standard vanilla CSS tokens, clean dividing rules, and calibrated hierarchy.
- **Dual-Mode Data Layer**: Native MongoDB/Mongoose database engine with automatic zero-configuration in-memory persistence fallback for immediate development and testing without mandatory database provisioning.
- **Administrative Editorial Suite**: Dedicated control room featuring role-gated authentication, live telemetry, article lifecycle management (Draft, Review, Published), and responsive fixed-sidebar navigation.
- **Reader Engagement**: Threaded comment sections across all news items, bookmarks drawer with local cache persistence, live breaking-news ticker, and categorical filtering.
- **Asset Integrity**: Defensive media loading with automated image fallback handlers to prevent layout shifting or broken media links across all editorial components.

---

## Core Desks & Editorial Taxonomy

The publication organizes coverage across six principal bureaus:

1. **Politics**: Legislative records, governance frameworks, institutional hearings, and regulatory policy.
2. **Economy**: Sovereign debt markets, central bank benchmarks, logistics corridors, and trade statistics.
3. **Technology**: Semiconductor manufacturing, quantum protocols, optical satellite meshes, and neural hardware.
4. **Environment**: Oceanic carbon capture, offshore renewable grids, aquifer management, and ecology.
5. **Agriculture**: Precision irrigation telemetry, soil microbiome research, and grain market dynamics.
6. **Education**: Research university accreditations, STEM development metrics, and academic standards.

---

## Key Modules

### Reader Platform
- **Top Bar & Ticker**: Live real-time date/time telemetry, weather readout, and breaking dispatches.
- **Editorial Navigation**: Bureau-level classification with smooth category filtering and inline keyword search.
- **Article Presentation**: Lead story treatment, editorial sub-grids, reading time estimates, drop caps, and document metadata.
- **Interactive Discussions**: Per-story reader discussions with real-time submission, author attribution, and formatted timestamps.
- **Reading Drawer**: Persistent article bookmarking panel for offline reading lists.

### Administrative Control Room (`/admin`)
- **Independent Layout**: Split-panel workstation featuring a fixed administrative navigation sidebar and isolated scrollable workspace.
- **Authentication**: Isolated administrative credential verification with secure session token tracking.
- **Dashboard Telemetry**: Real-time counters for active readers, published reports, draft status, and bureau metrics.
- **Publishing Workflow**: Standardized article composition form with automatic slug generation, desk tagging, summary generation, and status controls.

---

## Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend Framework** | React 19, Vite 8, React Router 7 |
| **Styling & Design** | Vanilla CSS3 Variables, Google Fonts (`Playfair Display`, `Newsreader`, `Inter`) |
| **Icons** | Lucide React |
| **Backend Runtime** | Node.js (ES Modules) |
| **Web Server** | Express 4.x |
| **Data Persistence** | MongoDB, Mongoose 8.x, In-Memory Store Fallback |
| **Security & Auth** | JSON Web Tokens (JWT), Bcrypt.js, CORS middleware |

---

## Directory Structure

```
Beyond-Headlines/
├── client/                     # Frontend Single Page Application
│   ├── public/                 # Static brand assets
│   ├── src/
│   │   ├── components/         # Reusable presentation and layout components
│   │   │   ├── ArticleCard.jsx
│   │   │   ├── BookmarksDrawer.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── Header.jsx
│   │   │   ├── LoginModal.jsx
│   │   │   └── SearchModal.jsx
│   │   ├── pages/              # Primary route views
│   │   │   ├── AdminDashboardPage.jsx
│   │   │   ├── AdminLoginPage.jsx
│   │   │   ├── ArticleDetailPage.jsx
│   │   │   ├── CategoryPage.jsx
│   │   │   ├── HomePage.jsx
│   │   │   └── SettingsPage.jsx
│   │   ├── App.jsx             # Top-level routing and layout orchestrator
│   │   ├── index.css           # Global typography and design system variables
│   │   └── main.jsx            # Application mount point
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── server/                     # Backend REST API Service
│   ├── config/
│   │   └── db.js               # Database initialization with in-memory fallback
│   ├── controllers/            # Request handlers
│   │   ├── adminController.js
│   │   ├── articleController.js
│   │   └── authController.js
│   ├── data/                   # Seed data and in-memory persistence store
│   │   ├── seedArticles.js
│   │   └── store.js
│   ├── middleware/             # Authentication and authorization guards
│   │   └── auth.js
│   ├── models/                 # Mongoose schema definitions
│   │   ├── Article.js
│   │   ├── Comment.js
│   │   └── User.js
│   ├── routes/                 # API endpoint routers
│   │   ├── adminRoutes.js
│   │   ├── articleRoutes.js
│   │   └── authRoutes.js
│   ├── package.json
│   └── server.js               # Server entry point and middleware configuration
│
├── .gitignore
├── package.json                # Root concurrent runner scripts
└── README.md
```

---

## Installation & Setup

### Prerequisites
- Node.js version 18.x or later
- npm version 9.x or later
- (Optional) Local or remote MongoDB instance

### 1. Clone the Repository
```bash
git clone https://github.com/IshangiDubey/Beyond-Headlines.git
cd Beyond-Headlines
```

### 2. Install Dependencies
Run the installation command in the root, client, and server directories:

```bash
# Root dependencies
npm install

# Backend dependencies
cd server
npm install

# Frontend dependencies
cd ../client
npm install
cd ..
```

### 3. Environment Configuration

Create a `.env` file in the `server` directory (optional for local development, as the platform automatically defaults to an in-memory database if no URI is supplied):

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/beyond_headlines
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development
```

---

## Running the Application

### Concurrent Development (Recommended)
From the root workspace directory, launch both the client and server concurrently:

```bash
npm run dev
```

### Independent Execution

#### Start Backend API Service
```bash
cd server
npm run dev
```
- API Base URL: `http://localhost:5000`
- Health Endpoint: `http://localhost:5000/api/health`

#### Start Frontend Client
```bash
cd client
npm run dev
```
- Application Interface: `http://localhost:5173`
- Admin Login Portal: `http://localhost:5173/admin/login`

---

## REST API Specification

### Articles (`/api/articles`)
- `GET /api/articles` — Retrieve paginated articles with optional category, search, and sort filters.
- `GET /api/articles/:id` — Retrieve a single article with full content and comment thread.
- `POST /api/articles/:id/comments` — Post a reader comment to an article thread.
- `POST /api/articles/:id/bookmark` — Increment bookmark count.

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Create a new reader account.
- `POST /api/auth/login` — Authenticate reader and receive JWT.
- `GET /api/auth/profile` — Fetch authenticated user profile.

### Administration (`/api/admin`)
- `POST /api/admin/login` — Authenticate editorial administrator.
- `GET /api/admin/dashboard` — Fetch editorial telemetry, publication statistics, and system metrics.
- `POST /api/admin/articles` — Compose and publish a new news dispatch.
- `PUT /api/admin/articles/:id` — Update article metadata, content, or publication status.
- `DELETE /api/admin/articles/:id` — Archive or remove an article.

---

## Quality Assurance & Defensive Engineering

- **Media Fallbacks**: All article images include native error listeners to intercept unreachable external image assets and immediately replace them with a verified editorial fallback asset.
- **Database Graceful Degradation**: If MongoDB connectivity encounters network latency or failure, the backend shifts to the in-memory transactional store to prevent application downtime.
- **Production Bundle Validation**: The client builds strictly via Vite Rollup with zero CSS or JSX bundling warnings.

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for further information.
