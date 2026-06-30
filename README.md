# Trendy AI

Trendy AI is a fully autonomous content operations platform that automates the lifecycle of digital publishing. The platform manages the entire process: from real-time trend discovery and automated SEO brief generation to AI-assisted writing, draft review, and multi-platform publishing.

---

---

# Project Overview

Trendy AI is an AI-powered content operations platform that automatically transforms trending internet topics into publish-ready content workflows.

The system continuously monitors trend sources, evaluates relevance using AI, generates content briefs, assigns writers, reviews submitted drafts, and prepares content for publishing.

The goal is to reduce the content creation cycle from days to hours while keeping humans involved in critical decisions.

---

# Problem Statement

Content teams often miss trending opportunities because:

* Topic discovery is manual
* Research takes too long
* Brief creation is repetitive
* Writer assignment is inefficient
* SEO optimization is inconsistent
* Publishing workflows are fragmented

Trendy AI automates these processes while preserving editorial control.

---

# Target Users

* Digital Marketing Agencies
* SaaS Companies
* News Organizations
* Bloggers
* Content Teams
* Startup Marketing Departments

---

# Core Workflow

## Phase 1: Trend Detection

System collects trending topics from:

* Google Trends
* Reddit
* News Sources

Output:

* Topic Title
* Trend Score
* Relevance Score
* Opportunity Score
* AI Explanation

---

## Phase 2: Brief Generation

AI generates:

* Topic Summary
* Audience Analysis
* Unique Content Angle
* SEO Keywords
* H1 Suggestions
* H2/H3 Structure
* Recommended Word Count

---

## Phase 3: Human Approval

Editor can:

* Approve Brief
* Reject Brief
* Edit Brief

Or 
Auto Pass with AI
---

## Phase 4: Writer Assignment

System recommends best writer using:

* Expertise
* Availability
* Historical Performance

### Backend & Database
- **Runtime**: Node.js (v18+)
- **Server Framework**: Express
- **ORM**: Prisma ORM
- **Database**: PostgreSQL (Supabase)
- **Validations**: Zod

### Integrations & AI
- **LLM Engine**: Qwen API (for brief generation, copywriting agents, and structural SEO reviews)
- **Publishing Targets**: Dev.to API / Webhooks
- **Social Media**: Twitter API (via `twitter-api-v2`)

---

## Folder Structure

```text
├── backend/                  # Express API & Orchestration Engine
│   ├── prisma/               # Database schema definition and migrations
│   │   ├── schema.prisma     # Prisma database models
│   │   └── migrations/       # SQL migration history
│   ├── src/                  # Backend application source code
│   │   ├── controllers/      # Express controllers handling business logic
│   │   ├── middleware/       # Express middlewares (auth, errorHandler)
│   │   ├── routes/           # Express routes mapping HTTP endpoints to controllers
│   │   ├── services/         # Orchestrator, AI services (Qwen), publishers, and scorers
│   │   └── index.js          # App entrypoint & initialization
│   ├── seed.js               # Database seeder script with mock data
│   └── package.json          # Node dependencies and scripts
└── frontend/                 # React client SPA
    ├── public/               # Static assets served directly
    ├── src/                  # Frontend source code
    │   ├── assets/           # Images, logo, and graphic files
    │   ├── components/       # Reusable components (e.g. Chat, Terminal logs, panels)
    │   ├── context/          # React Context providers for state management
    │   ├── hooks/            # Custom React hooks
    │   ├── layouts/          # Dashboard layouts & sidebars
    │   ├── pages/            # Individual route pages (Dashboard, Trends, Briefs, Drafts, Settings, etc.)
    │   ├── routes/           # Routing configuration and components
    │   ├── services/         # API request clients and Axios instances
    │   ├── styles/           # Global styles and styling assets
    │   ├── types/            # TypeScript type declarations
    │   ├── utils/            # Helper functions and utilities
    │   ├── App.tsx           # Root App component
    │   ├── index.css         # CSS entrypoint with custom styling
    │   └── main.tsx          # Client entrypoint
    ├── tsconfig.json         # TypeScript configurations
    ├── vite.config.ts        # Vite configuration
    └── package.json          # Package manifest and npm scripts
```

---

## How to Set Up and Run

Follow these instructions to run Trend Pilot AI locally.

### Prerequisites
- **Node.js** (v18 or higher)
- **npm** (v9 or higher)
- **PostgreSQL** database instance (or Supabase URL)

### 1. Database & Backend Setup

Navigate to the `backend` directory, install dependencies, and configure your environment:

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory based on the following template:

```env
# Database Connections
DATABASE_URL="postgresql://<user>:<password>@<host>:5432/postgres"
DIRECT_URL="postgresql://<user>:<password>@<host>:5432/postgres"

# Authentication
JWT_SECRET="your-jwt-secret-key"

# AI Integrations (Qwen API)
QWEN_API_KEY="your-qwen-api-key"
QWEN_API_URL="your-qwen-api-endpoint"

# Publishing APIs
DEVTO_API_KEY="your-devto-api-key"
```

Sync the database models and seed mock data:

```bash
# Push schema to database
npx prisma db push

# Seed mock database values (admin accounts, trends, briefs, drafts)
npm run db:seed
```

Start the backend development server:

```bash
npm run dev
```
*The backend server will run on `http://localhost:3000`.*

---

### 2. Frontend Setup

Navigate to the `frontend` directory, install dependencies, and configure the environment:

```bash
cd ../frontend
npm install
```

Create a `.env` file in the `frontend` directory with the backend server API url:

```env
VITE_API_URL="http://localhost:3000"
```

Start the frontend development server:

```bash
npm run dev
```
*The frontend application will start on `http://localhost:5173`.*

---

### Default Credentials

After launching the frontend server, open `http://localhost:5173` in your browser. Log in with the pre-seeded administrator account:

| Field | Value |
| :--- | :--- |
| **Email** | `admin@trendpilot.com` |
| **Password** | `password123` |
