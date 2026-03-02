# Nexus

AI-powered natural language interface for querying SQL databases with enterprise governance.

Ask questions in plain English, get answers backed by real SQL — with role-based access control, PII filtering, audit logging, and a data catalog built in.

## Features

- **Natural language chat** — type a question, get an AI-generated SQL query, execution results, and a synthesized answer
- **Data catalog browser** — explore table metadata, column descriptions, PII tags, and governance levels
- **Role-based access control** — admins see everything; analysts get PII columns automatically masked
- **Audit logging** — every query is logged with user role, SQL, tables accessed, and latency
- **Evaluation pipeline** — 17 test cases with automated scoring across SQL validity, correctness, latency, and PII compliance

## Tech Stack

**Backend:** Flask, LangChain, LangGraph, PostgreSQL, psycopg2, SQLParse

**Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Zustand, Recharts, Framer Motion, React Router

**LLM:** Claude (Anthropic) or GPT-4o (OpenAI) — configurable via environment variable

**Database:** Chinook music dataset (11 tables: artists, albums, tracks, customers, invoices, etc.)

## Prerequisites

- Python 3.11+
- Node.js 18+
- Docker and Docker Compose

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-username/Nexus.git
cd Nexus
```

### 2. Start PostgreSQL

```bash
cd backend
docker compose up -d
```

This starts PostgreSQL on port **5455** and seeds the Chinook database automatically.

### 3. Configure environment

```bash
cp .env.example .env
```

Edit `.env` and set your LLM API key:

```
LLM_API_KEY=sk-your-api-key-here
LLM_MODEL=claude-haiku-4-5-20251001   # or gpt-4o
```

### 4. Install backend dependencies

```bash
pip install -r requirements.txt
```

### 5. Run the backend

```bash
python app.py
```

The API starts on `http://localhost:5000`.

### 6. Install frontend dependencies

```bash
cd ../frontend
npm install
```

### 7. Run the frontend

```bash
npm run dev
```

The app opens at `http://localhost:5173`. The Vite dev server proxies `/api` requests to the Flask backend.

## Project Structure

```
Nexus/
├── backend/
│   ├── agent/           # LangChain agent, tools, and prompt templates
│   ├── audit/           # Query audit logger
│   ├── auth/            # Role definitions and PII filtering
│   ├── catalog/         # Data catalog loader and metadata.yaml
│   ├── eval/            # Evaluation pipeline, metrics, and test cases
│   ├── scripts/         # Chinook SQL seed data
│   ├── app.py           # Flask API (all route definitions)
│   ├── config.py        # Environment-based configuration
│   ├── docker-compose.yml
│   └── requirements.txt
├── frontend/
│   └── src/
│       ├── components/  # UI components (chat, catalog, audit, eval, layout, shared)
│       ├── pages/       # Route pages (Chat, Catalog, Audit, Eval)
│       ├── stores/      # Zustand state management
│       ├── api/         # API client functions
│       ├── hooks/       # Custom React hooks
│       ├── types/       # TypeScript type definitions
│       └── mocks/       # Mock data for development
└── Documentation/
    ├── LESSONS.md       # 12-lesson guided curriculum
    └── ADVANCED_LESSONS.md  # 10 advanced lessons
```

## Architecture

```
User question
  → Schema lookup (catalog metadata)
    → SQL generation (LLM agent with tools)
      → SQL validation and PII filtering (role-based)
        → Query execution (PostgreSQL)
          → Answer synthesis (LLM)
            → Response returned to frontend
```

The LangChain agent has access to tools for listing tables, looking up schemas, executing SQL, and filtering PII columns. The agent decides which tools to call and in what order based on the user's question.

The frontend communicates with the backend through a Vite dev proxy — all `/api/*` requests on port 5173 are forwarded to Flask on port 5000.

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/chat` | Send a natural language question, get an AI-generated answer |
| `GET` | `/api/catalog/tables` | List summary metadata for all tables |
| `GET` | `/api/catalog/tables/:name` | Get detailed metadata for a specific table |
| `GET` | `/api/health` | Health check (database + LLM status) |
| `GET` | `/api/audit` | Recent query audit log entries |
| `POST` | `/api/evaluate` | Trigger the evaluation suite |
| `GET` | `/api/evaluate/results` | Get the latest evaluation results |

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://nexus:nexus@localhost:5455/nexus` |
| `LLM_API_KEY` | Anthropic or OpenAI API key | (required) |
| `LLM_MODEL` | Model identifier | `claude-haiku-4-5-20251001` |
| `CATALOG_PATH` | Path to catalog metadata YAML | `catalog/metadata.yaml` |
| `MAX_QUERY_ROWS` | Maximum rows returned per query | `50` |
| `QUERY_TIMEOUT_SECONDS` | SQL query timeout | `10` |

## Lessons

This project includes a guided curriculum for building the system from scratch:

- [**LESSONS.md**](Documentation/LESSONS.md) — 12 lessons covering database setup, catalog loading, agent implementation, auth, audit logging, frontend, and evaluation (12-20 hours)
- [**ADVANCED_LESSONS.md**](Documentation/ADVANCED_LESSONS.md) — 10 advanced lessons adding conversation memory, streaming, caching, observability, and more (20-40 hours)
