# Intelligent Conversational AI & Crime Analytics Platform
## Phase 1: Project Foundation & Architecture

Welcome to the Karnataka State Police (KSP) Crime Analytics Platform. This project is built as a production-ready MERN stack application compatible with **Zoho Catalyst AppSail** serverless deployment.

---

## 1. Project Directory Structure

```
/KSP
├── README.md                     # Systems architecture and workflow documentation
├── client/                       # React Frontend (Vite)
│   ├── package.json              # Client libraries
│   ├── vite.config.js            # Port bindings and local backend proxy
│   ├── tailwind.config.js        # Color schemas (police-navy, neon-cyan)
│   ├── postcss.config.js
│   ├── index.html                # Google Font declarations
│   ├── .env.example              # Client endpoint variables
│   └── src/
│       ├── main.jsx              # Main React bootstrap
│       ├── App.jsx               # Client browser Router mapping
│       ├── index.css             # Tailwind imports & scrollbar scroll overlays
│       ├── assets/               # Local images & UI resources
│       ├── components/           # Reusable items (Sidebars, modals)
│       ├── constants/            # Client system properties (menus, configurations)
│       ├── context/              # Context Providers (Auth, Voice, Chat states)
│       ├── hooks/                # Custom React hook helpers
│       ├── layouts/              # MainLayout sidebar framing
│       ├── pages/                # Modular page wrappers
│       │   ├── DashboardPage.jsx
│       │   ├── ChatPage.jsx
│       │   ├── NetworkPage.jsx
│       │   ├── MapPage.jsx
│       │   ├── ProfilePage.jsx
│       │   ├── PredictionPage.jsx
│       │   └── LoginPage.jsx
│       ├── services/             # Axios API calls
│       └── utils/                # Date and audio handlers
└── server/                       # Node.js / Express Backend
    ├── package.json              # Server libraries
    ├── server.js                 # Express server launcher
    ├── .env.example              # Server environment secrets configuration
    ├── config/                   # Configuration Layer
    │   ├── db.js                 # Mongoose connector
    │   ├── gemini.js             # Google Gen AI client setup
    │   ├── catalyst.js           # Catalyst SDK environment detector
    │   ├── jwt.js                # Token signatures
    │   ├── roles.js              # Access Control matrix mapping
    │   └── logger.js             # Winston console / file logger
    ├── controllers/              # HTTP request handler layer
    ├── middleware/               # Middleware layer
    │   └── errorMiddleware.js    # Global error formatter
    ├── models/                   # Database schemas
    ├── prompts/                  # AI persona and templates
    ├── repositories/             # MongoDB Atlas queries
    ├── routes/                   # Endpoint routers
    │   ├── index.js              # Primary version router (/api/v1)
    │   ├── authRoutes.js         # Auth routes (login, register)
    │   ├── chatRoutes.js         # Chatbot history & speech routes
    │   ├── analyticsRoutes.js    # Chart metrics endpoints
    │   ├── networkRoutes.js      # Cytoscape graph nodes
    │   ├── mapsRoutes.js         # Geospatial coordinate arrays
    │   └── predictionRoutes.js   # Forecast trends and hotspots
    ├── seed/                     # program seeder for mock data
    └── utils/                    # Shared backend helper scripts
        ├── AppError.js           # Custom operational error class
        ├── asyncHandler.js       # Promise-error catch interceptor
        └── responseHandler.js    # REST payload normalizer
```

---

## 2. Dependency Registry & Rationales

### Backend Dependencies (`server/package.json`)
1.  **`express`**: Fast, unopinionated routing framework for the API layer.
2.  **`mongoose`**: Strict schema-based data modeling to map MongoDB Atlas structures.
3.  **`dotenv`**: Loads secret configurations from local `.env` into `process.env`.
4.  **`cors`**: Manages Cross-Origin Resource Sharing, preventing client connection blocks.
5.  **`helmet`**: Appends HTTP security headers to prevent common exploits (XSS, clickjacking).
6.  **`express-rate-limit`**: Limits requests to safeguard endpoints from DDoS or brute-force scripts.
7.  **`jsonwebtoken`**: Issues and verifies cryptographically signed authorization tokens.
8.  **`bcryptjs`**: Securely hashes user credentials before storage.
9.  **`winston`**: Professional logging manager that logs errors to disk and output streams in JSON.
10. **`zod`**: Schema validator verifying client body payloads before database execution.

### Backend DevDependencies
*   **`nodemon`**: Automatically restarts local servers upon file changes.
*   **`jest` & `supertest`**: Test framework asserting REST response payloads.

### Frontend Dependencies (`client/package.json`)
1.  **`react` & `react-dom`**: Frontend library.
2.  **`react-router-dom`**: Decoupled browser routing for app page states.
3.  **`axios`**: Promise-based HTTP client for calling Express services.
4.  **`lucide-react`**: Clean, modern UI icon assets.
5.  **`recharts`**: Responsive, premium SVG charts.
6.  **`cytoscape`**: Relationship graph rendering library for criminal networks.
7.  **`leaflet` & `react-leaflet`**: Geospatial tile and marker overlays for heatmaps.
8.  **`jspdf`**: Dynamic PDF generator for saving chat registers.

---

## 3. Configuration & Runtime Layer

*   **`server/config/logger.js`**: Enforces unified logs. Prints formatted, colorized text to the console during development, and writes JSON logs to `/logs` files for indexing.
*   **`server/config/db.js`**: Manages Mongoose connections. Configures pool size (`10`) and selection timeouts (`5s`) to keep response times fast.
*   **`server/config/gemini.js`**: Configures Google Gen AI SDK utilizing `GoogleGenAI` constructor with API key detection.
*   **`server/config/roles.js`**: Defines the access permissions matrix. Roles (`Investigator`, `Analyst`, `Supervisor`, `Policymaker`) are mapped to granular operations.

---

## 4. Error Handling Framework

We implement a centralized error architecture:

```
Async Operation (Controller)
   ↓ (throws Exception or validation failure)
asyncHandler.js (Catches error and routes to next(err))
   ↓
globalErrorHandler (middleware/errorMiddleware.js)
   ↓
Detects Error Type (CastError, DuplicateKey, ValidationError, JWT)
   ↓
Returns Formatted JSON: { status: "fail/error", message: "..." }
```

### Files Involved:
*   **`server/utils/AppError.js`**: Extends `Error` to attach status codes and mark errors as **operational** (trusted, user-fixable errors like validation failure) vs. **systemic** (database crashes, code bugs).
*   **`server/utils/asyncHandler.js`**: Eliminates verbose `try-catch` structures by wrapping async functions.
*   **`server/middleware/errorMiddleware.js`**: In development, prints full stack traces. In production, logs the error internally via Winston, but yields clean, secure messages.

---

## 5. Coding Standards & Development Guidelines

### Naming Conventions
*   **Folders**: Lowercase separated by dashes or camelCase (e.g., `controllers`, `context`).
*   **JavaScript Files**: camelCase (e.g., `authController.js`, `db.js`).
*   **React Component Files**: PascalCase (e.g., `MainLayout.jsx`, `DashboardPage.jsx`).
*   **Variables/Functions**: camelCase (e.g., `connectDB`, `signToken`).
*   **Database Models**: PascalCase Singular (e.g., `User.js`, `FIR.js`).

### Import Order
Group ES modules logically:
1. Core libraries (e.g. `react`, `express`).
2. Config and custom utilities.
3. Middleware handlers.
4. Database models and services.

### Git workflow
We operate a **Git Flow** strategy:
*   `main`: Mirror of the production deployment. Only merge approved code from `develop`.
*   `develop`: Integration branch where features are gathered.
*   `feature/<name>`: Developer branch spawned off `develop` (e.g. `feature/jwt-auth`). Integrate via Pull Requests.
*   *Merge Strategy*: Merge commits are performed with `--no-ff` (No Fast Forward) to maintain historical branch structures.

---

## 6. How to Run Locally

### Prerequisites
*   Node.js (v18+)
*   MongoDB Atlas connection string

### Steps
1.  **Repository Setup**:
    Clone this directory and navigate to the project root.
2.  **Run Backend Server**:
    ```bash
    cd server
    # Install dependencies
    npm install
    # Copy env template and set credentials (MONGODB_URI, GEMINI_API_KEY, JWT_SECRET)
    cp .env.example .env
    # Start nodemon local runtime
    npm run development
    ```
3.  **Run Frontend Client**:
    ```bash
    cd ../client
    # Install dependencies
    npm install
    # Copy env template
    cp .env.example .env
    # Launch Vite local preview
    npm run dev
    ```
4.  **Local URLs**:
    *   Frontend Client: `http://localhost:5173`
    *   Backend Health-Check: `http://localhost:5000/api/v1/health`
