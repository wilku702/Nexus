# Nexus: Implementation Plan & Phases

> A natural language data catalog agent — query databases in plain English, grounded in governed metadata.

---

## How This Document Works

Every section is tagged with one of three labels:

| Tag               | Meaning                                                                                                                                |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| **`[YOU BUILD]`** | You implement this yourself from scratch. Skeleton file structures, guidance, and checklists are provided, but you write all the code. |
| **`[PROVIDED]`**  | The React frontend is pre-built for you. You only need to wire up the API calls where `TODO [WIRE-UP]` comments appear.                |
| **`[OPTIONAL]`**  | Stretch goals. Mention these in interviews even if unfinished.                                                                         |

**The rule:** Everything on the backend is yours. The frontend is provided so you can focus on the AI/agent/data engineering work — the stuff that actually matters for the role.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│  React Frontend [PROVIDED]                                      │
│  ┌──────────┐ ┌──────────┐ ┌───────────┐ ┌──────────────────┐  │
│  │  Chat UI │ │ Catalog  │ │ Eval Dash │ │ Audit Log Viewer │  │
│  │          │ │ Browser  │ │           │ │                  │  │
│  └────┬─────┘ └────┬─────┘ └─────┬─────┘ └────────┬─────────┘  │
│       │             │             │                 │            │
│       └─────────────┴─────────────┴─────────────────┘            │
│                             │                                    │
│               Vite dev proxy (localhost:5173 → :5000)            │
└─────────────────────────────┬───────────────────────────────────┘
                              │  HTTP/JSON
┌─────────────────────────────┴───────────────────────────────────┐
│  Flask REST API [YOU BUILD]                                      │
│                                                                  │
│  POST /api/chat ──────────► LangChain Agent [YOU BUILD]          │
│                               │                                  │
│                               ├── get_schema_info (metadata)     │
│                               ├── generate_sql (text→SQL)        │
│                               ├── validate_sql (safety checks)   │
│                               ├── execute_sql (run query)        │
│                               └── synthesize_answer (NL output)  │
│                                                                  │
│  GET  /api/catalog/tables ──► Metadata Catalog [YOU BUILD]       │
│  GET  /api/catalog/tables/:n                                     │
│  GET  /api/health                                                │
│  GET  /api/audit ───────────► Query Audit Log [YOU BUILD]        │
│  POST /api/evaluate ────────► Eval Pipeline [YOU BUILD]          │
│  GET  /api/evaluate/results                                      │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                    ┌──────────┴──────────┐
                    │  PostgreSQL          │
                    │  [YOU BUILD/SETUP]   │
                    │                      │
                    │  - Chinook dataset   │
                    │  - query_log table   │
                    │  - (optional) catalog│
                    │    metadata table    │
                    └─────────────────────┘
```

---

## API Contract Reference

This is the source of truth for what the frontend expects. When you build each endpoint, match these shapes exactly.

### `POST /api/chat`

```
Request:
{
  "question": "How many customers are in Brazil?",
  "role": "analyst"                              // "analyst" | "admin"
}

Response:
{
  "answer": "There are 5 customers in Brazil.",
  "sql": "SELECT COUNT(*) FROM Customer WHERE Country = 'Brazil';",
  "tables_used": ["Customer"],
  "latency_ms": 1243
}
```

### `GET /api/catalog/tables`

```
Response:
[
  {
    "table_name": "Customer",
    "description": "Stores customer account information",
    "owner": "sales_team",
    "governance_level": "internal",              // "public" | "internal" | "restricted"
    "column_count": 13
  },
  ...
]
```

### `GET /api/catalog/tables/:name`

```
Response:
{
  "table_name": "Customer",
  "description": "Stores customer account information",
  "owner": "sales_team",
  "governance_level": "internal",
  "columns": [
    {
      "column_name": "CustomerId",
      "data_type": "integer",
      "description": "Primary key, unique customer identifier",
      "is_pii": false,
      "sample_values": ["1", "2", "3"],
      "governance_tag": "public"                 // "public" | "pii" | "sensitive"
    },
    {
      "column_name": "Email",
      "data_type": "varchar(60)",
      "description": "Customer email address",
      "is_pii": true,
      "sample_values": ["luisg@embraer.com.br"],
      "governance_tag": "pii"
    },
    ...
  ]
}
```

### `GET /api/health`

```
Response:
{
  "status": "healthy",                           // "healthy" | "degraded" | "down"
  "database": "connected",
  "llm": "connected"
}
```

### `GET /api/audit`

```
Response:
[
  {
    "id": "a1b2c3",
    "timestamp": "2026-02-27T14:30:00Z",
    "user_role": "analyst",
    "original_question": "How many customers are in Brazil?",
    "generated_sql": "SELECT COUNT(*) FROM Customer WHERE Country = 'Brazil';",
    "was_pii_filtered": false,
    "result_row_count": 1,
    "latency_ms": 1243,
    "llm_model_used": "gpt-4o"
  },
  ...
]
```

### `POST /api/evaluate`

```
Response:
{
  "run_id": "eval-001",
  "timestamp": "2026-02-27T15:00:00Z",
  "summary": {
    "total_tests": 18,
    "passed": 13,
    "failed": 5,
    "pass_rate": 0.72,
    "avg_latency_ms": 1850,
    "governance_compliance_rate": 1.0
  },
  "by_difficulty": {
    "easy":   { "total": 6, "passed": 6, "pass_rate": 1.0 },
    "medium": { "total": 6, "passed": 5, "pass_rate": 0.83 },
    "hard":   { "total": 6, "passed": 2, "pass_rate": 0.33 }
  },
  "test_cases": [
    {
      "question": "How many customers are in Brazil?",
      "difficulty": "easy",
      "generated_sql": "SELECT COUNT(*) FROM Customer WHERE Country = 'Brazil';",
      "sql_correct": true,
      "sql_accuracy": 1.0,
      "answer_accuracy": 1.0,
      "latency_ms": 980,
      "governance_compliant": true,
      "passed": true
    },
    ...
  ]
}
```

### `GET /api/evaluate/results`

Same shape as `POST /api/evaluate` response — returns the most recent eval run.

---

## Tech Stack Summary

| Layer            | Technology                                   | Notes                             |
| ---------------- | -------------------------------------------- | --------------------------------- |
| LLM              | OpenAI GPT-4o or Claude                      | Via LangChain. You choose.        |
| Agent Framework  | LangChain                                    | Agents, tools, prompts, callbacks |
| Backend          | Flask + Python 3.11+                         | Flask-CORS for dev                |
| Database         | PostgreSQL 15+                               | Docker recommended                |
| Dataset          | Chinook                                      | 11 tables, music store data       |
| Metadata Store   | YAML file (start) → PostgreSQL table (later) | Your call                         |
| Evaluation       | Custom Python scripts                        | Optionally add LangFuse/LangSmith |
| Frontend         | React + Vite + TypeScript + Tailwind         | Pre-built for you                 |
| Containerization | Docker + docker-compose                      | For PostgreSQL at minimum         |

---

---

# Phase 1: Database & Catalog Foundation `[YOU BUILD]`

**Goal:** Get PostgreSQL running with the Chinook dataset loaded, and create a metadata catalog that describes every table and column with governance tags. This catalog is the foundation the AI agent will use to generate accurate SQL.

**Why it matters:** Alation's entire thesis is that AI agents produce 30-60% more accurate outputs when grounded in governed metadata. This phase builds that metadata layer.

---

## 1.1 PostgreSQL Setup

### What you need to do

- [ ] Install PostgreSQL locally or run it via Docker
- [ ] Create a database named `nexus`
- [ ] Download and load the Chinook dataset SQL script
- [ ] Verify the connection works from Python using `psycopg2`
- [ ] Confirm you can run a simple query like `SELECT COUNT(*) FROM "Customer"`

### Guidance

**Docker approach (recommended):**
You'll create a `docker-compose.yml` that runs PostgreSQL and optionally auto-seeds the Chinook data on first startup. The Chinook SQL script is available publicly — download it and mount it as an init script.

**Things to figure out yourself:**

- How to configure `docker-compose.yml` for a PostgreSQL service
- How to mount an init SQL script so the database seeds automatically
- How to set environment variables for the database credentials
- How to verify the connection from Python

### Skeleton file structure

```
backend/
  docker-compose.yml          ← PostgreSQL service definition
  scripts/
    seed_db.py                ← Python script to verify DB connection and seed if needed
```

**`docker-compose.yml`** — You write this. It should:

- Use the `postgres:15` image
- Expose port 5432
- Set `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`
- Mount the Chinook SQL file to `/docker-entrypoint-initdb.d/`

**`scripts/seed_db.py`** — You write this. It should:

- Connect to PostgreSQL using `psycopg2`
- Verify the Chinook tables exist (list all tables)
- Print table names and row counts as a sanity check
- Handle connection errors gracefully

### Chinook database tables you'll be working with

| Table         | Rows (approx) | Description                                          |
| ------------- | ------------- | ---------------------------------------------------- |
| Album         | 347           | Music albums, linked to Artist                       |
| Artist        | 275           | Musical artists/bands                                |
| Customer      | 59            | Customer accounts with contact info (has PII)        |
| Employee      | 8             | Company employees with reporting structure (has PII) |
| Genre         | 25            | Music genres                                         |
| Invoice       | 412           | Customer purchase invoices                           |
| InvoiceLine   | 2240          | Line items on each invoice                           |
| MediaType     | 5             | Audio format types                                   |
| Playlist      | 18            | Named playlists                                      |
| PlaylistTrack | 8715          | Track-to-playlist mapping                            |
| Track         | 3503          | Individual songs with pricing                        |

---

## 1.2 Metadata Catalog

### What you need to do

- [ ] Create a `metadata.yaml` (or `metadata.json`) file describing every Chinook table
- [ ] Include column-level metadata with data types, descriptions, PII flags, and governance tags
- [ ] Write a `CatalogLoader` class that parses this file and provides lookup methods
- [ ] Test that you can retrieve metadata for any table/column programmatically
- [ ] Add at least 2-3 sample values per column to help the LLM understand the data

### Guidance

The metadata catalog is a YAML/JSON file that stores human-written descriptions of what each table and column contains. The AI agent will read this metadata before generating SQL so it knows which tables to use and what the columns mean.

**Your catalog should answer these questions for every column:**

1. What does this column contain in plain English?
2. What data type is it?
3. Is it personally identifiable information (PII)?
4. What governance level does it have?
5. What are some example values?

**Governance levels to use:**

- `public` — Safe for anyone to see (genre names, track titles, etc.)
- `pii` — Personally identifiable information (emails, phone numbers, addresses)
- `sensitive` — Business-sensitive but not personal (revenue figures, employee salaries)

**PII columns in Chinook to tag:**

- `Customer.Email`, `Customer.Phone`, `Customer.Address`, `Customer.City`, `Customer.State`, `Customer.PostalCode`, `Customer.Fax`
- `Employee.Email`, `Employee.Phone`, `Employee.Address`, `Employee.City`, `Employee.State`, `Employee.PostalCode`, `Employee.Fax`, `Employee.BirthDate`

### Skeleton file structure

```
backend/
  catalog/
    __init__.py
    metadata.yaml             ← Full table/column descriptions + governance tags
    loader.py                 ← CatalogLoader class with lookup methods
```

**`metadata.yaml`** — You write this. Here's the structure for ONE table to show the pattern, then you do the rest:

```yaml
tables:
  - table_name: 'Customer'
    description: 'Stores customer account information including contact details and location'
    owner: 'sales_team'
    governance_level: 'internal'
    columns:
      - column_name: 'CustomerId'
        data_type: 'integer'
        description: 'Primary key, unique customer identifier'
        is_pii: false
        sample_values: ['1', '2', '3']
        governance_tag: 'public'
      - column_name: 'Email'
        data_type: 'varchar(60)'
        description: 'Customer email address'
        is_pii: true
        sample_values: ['luisg@embraer.com.br']
        governance_tag: 'pii'
      # ... you do the remaining columns for Customer
      # ... then do all 10 other tables

  - table_name: 'Album'
    # ... you fill this in
```

**`loader.py`** — You write this. It should have these methods:

```python
class CatalogLoader:
    """Loads and provides access to the metadata catalog."""

    def __init__(self, catalog_path: str):
        # TODO: Load the YAML file and parse it
        pass

    def get_all_tables(self) -> list[dict]:
        """Return metadata for all tables (used by GET /api/catalog/tables)."""
        # TODO: Implement
        pass

    def get_table(self, table_name: str) -> dict | None:
        """Return full metadata for a specific table including columns (used by GET /api/catalog/tables/:name)."""
        # TODO: Implement
        pass

    def get_pii_columns(self, table_name: str) -> list[str]:
        """Return list of PII column names for a table (used by validate_sql for role-based filtering)."""
        # TODO: Implement
        pass

    def get_context_for_question(self, question: str) -> str:
        """Return a formatted string of relevant table/column metadata to inject into the LLM prompt.
        This is the key method the agent uses to ground its SQL generation.

        Start simple: return ALL table metadata.
        Later: use keyword matching or embeddings to return only relevant tables.
        """
        # TODO: Implement
        pass
```

---

---

# Phase 2: LangChain Agent `[YOU BUILD]`

**Goal:** Build the core AI agent — the user types a question, the agent generates SQL using your metadata catalog for context, validates it, executes it, and returns a natural language answer.

**This is the heart of the project.** Take your time here. Get one question working end-to-end before trying to handle edge cases.

---

## 2.1 Agent Tools

### What you need to do

- [ ] Implement `get_schema_info` tool — retrieves relevant metadata from your catalog
- [ ] Implement `generate_sql` tool — produces SQL from question + metadata context
- [ ] Implement `validate_sql` tool — safety checks before execution
- [ ] Implement `execute_sql` tool — runs query against PostgreSQL with timeout
- [ ] Implement `synthesize_answer` tool — formats results into natural language
- [ ] Wire all tools into a LangChain agent using `create_react_agent` or `AgentExecutor`
- [ ] Test with at least 5 different questions manually before moving on

### Skeleton file structure

```
backend/
  agent/
    __init__.py
    agent.py                  ← Agent setup and orchestration
    tools.py                  ← All 5 tool implementations
    prompts.py                ← Prompt templates for the LLM
```

### Tool-by-tool guidance

#### Tool 1: `get_schema_info`

**Purpose:** Given a user's natural language question, find the relevant tables and columns from your metadata catalog and return them as formatted context.

**Input:** The user's question (string)
**Output:** A formatted string containing table names, descriptions, column names, data types, and sample values for the tables most likely relevant to the question.

**Implementation approach:**

- **Simple (start here):** Return metadata for ALL tables. The LLM is smart enough to figure out which ones matter. This works fine for Chinook's 11 tables.
- **Better (do later):** Keyword match the question against table/column descriptions. If the user says "customers," prioritize the Customer table.
- **Best (stretch goal):** Embed table descriptions into vectors, do similarity search against the question embedding.

**Things to think about:**

- How do you format the metadata so the LLM can easily parse it?
- Should you include sample values? (Yes — they help the LLM understand what values to filter on)
- How do you handle ambiguous questions that could involve multiple tables?

#### Tool 2: `generate_sql`

**Purpose:** Take the user's question plus metadata context and produce a SQL query.

**Input:** User question + metadata context string + user role
**Output:** A SQL query string

**This is really a prompt engineering problem.** Your prompt template should:

1. Include the full schema context from `get_schema_info`
2. Instruct the LLM to only use tables/columns present in the provided metadata
3. Tell the LLM to add a `LIMIT` clause (e.g., `LIMIT 50`)
4. If user role is `analyst`, instruct the LLM to avoid selecting PII columns
5. Tell the LLM to use PostgreSQL syntax specifically

**Things to think about:**

- How do you handle questions the database can't answer? (The LLM should say "I can't answer that" rather than hallucinating SQL)
- How do you handle column name case sensitivity in PostgreSQL? (Chinook uses PascalCase column names, which need double-quoting in PostgreSQL)
- What if the LLM wraps the SQL in markdown code blocks? (Strip them)

#### Tool 3: `validate_sql`

**Purpose:** Safety check the generated SQL before running it against your real database.

**Input:** SQL query string + user role
**Output:** `{ "valid": true/false, "reason": "..." }`

**Checks to implement:**

1. Parse the SQL and verify it's a `SELECT` statement (block `DROP`, `DELETE`, `UPDATE`, `INSERT`, `ALTER`, `TRUNCATE`)
2. Verify all referenced tables exist in your catalog
3. Verify a `LIMIT` clause is present (inject one if missing)
4. If user role is `analyst`, check if any PII-tagged columns are in the `SELECT` list — if so, either mask them or reject the query
5. Check for obviously dangerous patterns (e.g., `SELECT *` from restricted tables)

**Things to think about:**

- You can use Python's `sqlparse` library for SQL parsing, or do simple string matching to start
- What do you do when validation fails? Return an error message the LLM can work with?
- How do you handle subqueries or CTEs that might reference PII columns?

#### Tool 4: `execute_sql`

**Purpose:** Run the validated SQL query against PostgreSQL and return the results.

**Input:** Validated SQL query string
**Output:** Query results as a list of dicts + row count

**Requirements:**

- Use `psycopg2` to connect and execute
- Set a query timeout (e.g., 10 seconds) to prevent runaway queries
- Enforce the row limit from `validate_sql`
- Return results as a list of dictionaries `[{"column": value, ...}, ...]`
- Handle and report database errors gracefully

**Things to think about:**

- Connection pooling — create one connection at app startup, don't reconnect per query
- What do you return if the query returns 0 rows?
- How do you handle very wide result sets (many columns)?

#### Tool 5: `synthesize_answer`

**Purpose:** Take raw query results and the original question, produce a natural language answer.

**Input:** Original question + SQL used + query results + tables used
**Output:** A natural language answer that cites the source tables/columns

**This is another prompt engineering task.** Your prompt should:

1. Include the original question for context
2. Include the SQL that was executed (so the answer references it)
3. Include the raw results
4. Instruct the LLM to cite which tables/columns the answer comes from
5. Instruct the LLM to format numbers nicely (commas, percentages, etc.)
6. Instruct the LLM to be concise — don't repeat the raw data, summarize it

---

## 2.2 Agent Orchestration

### What you need to do

- [ ] Set up the LangChain agent with all 5 tools
- [ ] Configure the system prompt that guides the agent's behavior
- [ ] Test the full pipeline: question → metadata → SQL → validate → execute → answer
- [ ] Handle edge cases: unanswerable questions, SQL errors, empty results
- [ ] Measure end-to-end latency for a few sample questions

### Guidance

**`agent.py`** — You write this. The key function:

```python
def create_langchain_agent(catalog: CatalogLoader, db_connection):
    """Create and return the LangChain agent with all tools.

    TODO: You implement this. Steps:
    1. Initialize your LLM (ChatOpenAI or ChatAnthropic)
    2. Create Tool instances wrapping each function from tools.py
    3. Build the system prompt from prompts.py
    4. Use create_react_agent() or AgentExecutor to wire it all together
    5. Return the agent
    """
    pass


def handle_chat(agent, question: str, role: str) -> dict:
    """Process a user question through the agent and return the response.

    TODO: You implement this. Steps:
    1. Invoke the agent with the question and role
    2. Extract the answer, SQL, tables used
    3. Measure latency
    4. Log to audit trail
    5. Return the response dict matching the API contract
    """
    pass
```

**`prompts.py`** — You write this. Key prompt templates:

```python
SYSTEM_PROMPT = """
TODO: Write your system prompt here. It should:
1. Explain the agent's role (a data analyst assistant)
2. Describe the available tools
3. Set behavioral guidelines (be concise, cite sources, say "I don't know" when unsure)
4. Include governance rules (respect user roles, don't expose PII to analysts)
"""

SQL_GENERATION_PROMPT = """
TODO: Write the prompt template for SQL generation. It should:
1. Include a {schema_context} variable for the metadata
2. Include a {question} variable
3. Include a {role} variable
4. Instruct PostgreSQL-specific syntax
5. Instruct LIMIT clause inclusion
"""

ANSWER_SYNTHESIS_PROMPT = """
TODO: Write the prompt template for answer synthesis. It should:
1. Include {question}, {sql}, {results} variables
2. Instruct concise natural language response
3. Instruct table/column citation
"""
```

### LangChain components you'll use

| Component                       | From                                        | Purpose                                              |
| ------------------------------- | ------------------------------------------- | ---------------------------------------------------- |
| `ChatOpenAI` or `ChatAnthropic` | `langchain_openai` or `langchain_anthropic` | The LLM that powers the agent                        |
| `Tool`                          | `langchain_core.tools`                      | Wraps your Python functions as agent tools           |
| `create_react_agent`            | `langchain.agents`                          | Creates a ReAct agent that reasons step-by-step      |
| `AgentExecutor`                 | `langchain.agents`                          | Runs the agent loop (think → act → observe → repeat) |
| `PromptTemplate`                | `langchain_core.prompts`                    | Template for your system prompt                      |
| `CallbackHandler` (optional)    | `langchain_core.callbacks`                  | For logging/tracing agent steps                      |

---

---

# Phase 3: Flask API `[YOU BUILD]`

**Goal:** Expose your agent and catalog through a REST API that the frontend can call.

---

## 3.1 API Endpoints

### What you need to do

- [ ] Set up a Flask app with Flask-CORS
- [ ] Implement `POST /api/chat` — sends question to agent, returns response
- [ ] Implement `GET /api/catalog/tables` — returns all table metadata
- [ ] Implement `GET /api/catalog/tables/<name>` — returns single table with columns
- [ ] Implement `GET /api/health` — checks DB + LLM connectivity
- [ ] Implement `GET /api/audit` — returns recent query logs
- [ ] Implement `POST /api/evaluate` — triggers evaluation suite
- [ ] Implement `GET /api/evaluate/results` — returns latest eval run
- [ ] Test every endpoint with `curl` or Postman before connecting the frontend

### Skeleton file structure

```
backend/
  app.py                      ← Flask app with all route definitions
  config.py                   ← Configuration (DB URL, LLM API key, etc.)
  requirements.txt            ← All Python dependencies
```

### Guidance

**`app.py`** — You write this. Here's the structure with every route:

```python
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# TODO: Initialize your CatalogLoader, DB connection, and Agent here

@app.route('/api/chat', methods=['POST'])
def chat():
    """Main chat endpoint.

    TODO: Implement this. Steps:
    1. Parse request JSON: { "question": "...", "role": "analyst" }
    2. Validate the role is "analyst" or "admin"
    3. Pass to handle_chat(agent, question, role)
    4. Return the response as JSON
    5. Handle errors gracefully
    """
    pass


@app.route('/api/catalog/tables', methods=['GET'])
def get_tables():
    """Return all table metadata.

    TODO: Implement this. Steps:
    1. Call catalog.get_all_tables()
    2. Return as JSON list
    """
    pass


@app.route('/api/catalog/tables/<name>', methods=['GET'])
def get_table(name):
    """Return detailed metadata for a specific table.

    TODO: Implement this. Steps:
    1. Call catalog.get_table(name)
    2. Return 404 if table not found
    3. Return as JSON
    """
    pass


@app.route('/api/health', methods=['GET'])
def health():
    """Health check endpoint.

    TODO: Implement this. Steps:
    1. Check DB connection (run a simple "SELECT 1")
    2. Check LLM connectivity (optional: send a test prompt)
    3. Return { "status": "healthy"|"degraded"|"down", "database": "...", "llm": "..." }
    """
    pass


@app.route('/api/audit', methods=['GET'])
def get_audit_logs():
    """Return recent query audit logs.

    TODO: Implement this. Steps:
    1. Query the query_log table (most recent first)
    2. Return as JSON list
    """
    pass


@app.route('/api/evaluate', methods=['POST'])
def run_evaluation():
    """Trigger the full evaluation suite.

    TODO: Implement this. Steps:
    1. Load test cases from eval/test_cases.json
    2. Run each through the agent
    3. Score each metric
    4. Return the full evaluation report as JSON
    """
    pass


@app.route('/api/evaluate/results', methods=['GET'])
def get_eval_results():
    """Return the latest evaluation run.

    TODO: Implement this. Steps:
    1. Load the most recent eval results (from file or DB)
    2. Return as JSON
    """
    pass


if __name__ == '__main__':
    app.run(debug=True, port=5000)
```

**`config.py`** — You write this:

```python
class Config:
    """Application configuration.

    TODO: Set these values. Use environment variables for secrets.
    """
    DATABASE_URL = ""          # e.g., "postgresql://user:pass@localhost:5432/nexus"
    LLM_API_KEY = ""           # Your OpenAI or Anthropic API key
    LLM_MODEL = ""             # e.g., "gpt-4o" or "claude-sonnet-4-20250514"
    CATALOG_PATH = ""          # Path to your metadata.yaml
    MAX_QUERY_ROWS = 50        # Max rows returned per query
    QUERY_TIMEOUT_SECONDS = 10 # Max query execution time
```

**`requirements.txt`** — You write this. At minimum:

```
flask
flask-cors
psycopg2-binary
langchain
langchain-openai          # or langchain-anthropic
langchain-core
langchain-community
pyyaml
sqlparse
python-dotenv
```

---

---

# Phase 4: Governance & Access Control `[YOU BUILD]`

**Goal:** Different user roles see different data. PII is protected. Every query is logged.

**Why it matters:** The job description lists "understanding of enterprise data governance and access control principles" as a desired qualification. This phase demonstrates exactly that.

---

## 4.1 Role-Based Filtering

### What you need to do

- [ ] Define two roles: `analyst` (restricted) and `admin` (full access)
- [ ] Modify `validate_sql` to detect PII column access for `analyst` role
- [ ] Implement PII masking strategy (mask values or reject query)
- [ ] Test with at least 3 queries that touch PII columns under each role
- [ ] Verify `analyst` cannot see raw emails, phone numbers, or addresses

### Skeleton file structure

```
backend/
  auth/
    __init__.py
    roles.py                  ← Role definitions and PII filtering logic
```

### Guidance

**`roles.py`** — You write this:

```python
from enum import Enum

class UserRole(Enum):
    """User roles for access control.

    TODO: Implement the role-based filtering logic below.
    """
    ANALYST = "analyst"
    ADMIN = "admin"


def get_role_permissions(role: UserRole) -> dict:
    """Return the permissions for a given role.

    TODO: Implement. Returns something like:
    {
        "can_view_pii": True/False,
        "can_view_restricted": True/False,
        "max_rows": 50 or 1000,
    }
    """
    pass


def filter_pii_from_sql(sql: str, pii_columns: list[str], role: UserRole) -> str:
    """If role is ANALYST, modify the SQL to mask PII columns.

    TODO: Implement. Two approaches:
    1. Replace PII columns in SELECT with masked versions:
       "Email" → "'***' AS Email"
    2. Or remove PII columns from SELECT entirely

    This is one of the trickier functions to implement. Consider:
    - What if the query uses SELECT *? (Expand it first, then mask)
    - What about PII columns in WHERE clauses? (Probably allow filtering BY them but not SEEING them)
    - What about JOINs involving PII columns? (Allow the JOIN, mask the output)
    """
    pass
```

**PII masking strategies (pick one or combine):**

| Strategy                       | Pros                        | Cons                               |
| ------------------------------ | --------------------------- | ---------------------------------- |
| Replace in SELECT with `'***'` | Simple, preserves row count | Doesn't prevent WHERE clause leaks |
| Remove PII columns from SELECT | Clean output                | Changes result shape               |
| Reject query entirely          | Safest                      | Poor UX, too restrictive           |
| Hash PII values                | Allows grouping/counting    | Still reveals patterns             |

**Recommendation:** Start with "Replace in SELECT with `'***'`" — it's the simplest and most visually clear for demo purposes. You can explain the tradeoffs in an interview.

---

## 4.2 Query Audit Trail

### What you need to do

- [ ] Create a `query_log` table in PostgreSQL
- [ ] Log every query that runs through the agent
- [ ] Implement the audit logging function
- [ ] Wire the logging into `handle_chat` in `agent.py`
- [ ] Implement `GET /api/audit` to query the logs
- [ ] Test that every chat request produces an audit log entry

### Guidance

**`query_log` table schema** — Create this in PostgreSQL:

```sql
CREATE TABLE query_log (
    id              SERIAL PRIMARY KEY,
    timestamp       TIMESTAMP DEFAULT NOW(),
    user_role       VARCHAR(20) NOT NULL,
    original_question TEXT NOT NULL,
    generated_sql   TEXT,
    was_pii_filtered BOOLEAN DEFAULT FALSE,
    result_row_count INTEGER,
    latency_ms      INTEGER,
    llm_model_used  VARCHAR(50)
);
```

### Skeleton file structure

```
backend/
  audit/
    __init__.py
    logger.py                 ← Audit logging functions
```

**`logger.py`** — You write this:

```python
def log_query(db_connection, entry: dict):
    """Insert a query log entry into the query_log table.

    TODO: Implement. The entry dict contains:
    - user_role: str
    - original_question: str
    - generated_sql: str
    - was_pii_filtered: bool
    - result_row_count: int
    - latency_ms: int
    - llm_model_used: str
    """
    pass


def get_recent_logs(db_connection, limit: int = 50) -> list[dict]:
    """Retrieve recent query logs, newest first.

    TODO: Implement. Query the query_log table with ORDER BY timestamp DESC.
    Return as a list of dicts matching the API contract.
    """
    pass
```

---

---

# Phase 5: Evaluation Pipeline `[YOU BUILD]`

**Goal:** Systematically benchmark your agent's accuracy — not just vibes.

**Why it matters:** The job description directly calls this out: "evaluate, benchmark, and refine performance." This shows you can measure AI quality quantitatively.

---

## 5.1 Test Suite

### What you need to do

- [ ] Write 15-20 test cases across easy/medium/hard difficulties
- [ ] Cover single-table queries, multi-table joins, aggregations, and edge cases
- [ ] Include at least 2 PII governance test cases
- [ ] Store test cases in a JSON file

### Guidance

### Skeleton file structure

```
backend/
  eval/
    __init__.py
    test_cases.json           ← All test cases
    evaluate.py               ← Evaluation runner
    metrics.py                ← Scoring functions
```

**`test_cases.json`** — You write this. Here are 3 examples to start with, then you add 12-17 more:

```json
[
  {
    "question": "How many customers are there?",
    "expected_sql_contains": ["Customer", "COUNT"],
    "expected_answer_contains": ["59"],
    "difficulty": "easy",
    "involves_pii": false
  },
  {
    "question": "What artist has the most albums?",
    "expected_sql_contains": ["Artist", "Album", "COUNT", "ORDER BY"],
    "expected_answer_contains": ["Iron Maiden"],
    "difficulty": "medium",
    "involves_pii": false
  },
  {
    "question": "Show me customer emails from Brazil",
    "expected_sql_contains": ["Customer", "Email", "Country", "Brazil"],
    "expected_answer_contains": [],
    "difficulty": "medium",
    "involves_pii": true,
    "governance_test": {
      "role": "analyst",
      "should_mask_pii": true
    }
  }
]
```

**Test case difficulty guidelines:**

- **Easy** — Single table, simple aggregation or filter. E.g., "How many genres are there?"
- **Medium** — 2-table join, GROUP BY, or ORDER BY. E.g., "What genre has the most tracks?"
- **Hard** — 3+ table join, subquery, date filtering, or complex aggregation. E.g., "Total revenue by country for 2013"

---

## 5.2 Evaluation Metrics

### What you need to do

- [ ] Implement SQL Correctness scoring (does it execute?)
- [ ] Implement SQL Accuracy scoring (does it contain expected keywords?)
- [ ] Implement Answer Accuracy scoring (does the answer contain expected values?)
- [ ] Implement Latency measurement
- [ ] Implement Governance Compliance checking

### Guidance

**`metrics.py`** — You write this:

```python
def score_sql_correctness(generated_sql: str, db_connection) -> bool:
    """Does the generated SQL execute without errors?

    TODO: Implement. Try executing the SQL (with a LIMIT 1 safeguard).
    Return True if it runs, False if it throws an error.
    """
    pass


def score_sql_accuracy(generated_sql: str, expected_contains: list[str]) -> float:
    """What fraction of expected keywords appear in the SQL?

    TODO: Implement. For each keyword in expected_contains,
    check if it appears in the generated SQL (case-insensitive).
    Return: matched_count / total_expected (0.0 to 1.0)
    """
    pass


def score_answer_accuracy(answer: str, expected_contains: list[str]) -> float:
    """What fraction of expected values appear in the answer?

    TODO: Implement. Same approach as SQL accuracy but against the answer text.
    Return: matched_count / total_expected (0.0 to 1.0)
    If expected_contains is empty, return 1.0 (no expected values to check).
    """
    pass


def check_governance_compliance(generated_sql: str, role: str, involves_pii: bool, was_masked: bool) -> bool:
    """Was PII properly handled for the given role?

    TODO: Implement. Logic:
    - If involves_pii is False, always return True
    - If involves_pii is True and role is "admin", return True
    - If involves_pii is True and role is "analyst", return True only if was_masked is True
    """
    pass
```

---

## 5.3 Evaluation Runner

### What you need to do

- [ ] Build a script that loads test cases, runs each through the agent, scores them
- [ ] Generate summary statistics (pass rate by difficulty, avg latency, governance compliance)
- [ ] Save results to a JSON file or database
- [ ] Wire into `POST /api/evaluate` and `GET /api/evaluate/results` endpoints

### Guidance

**`evaluate.py`** — You write this:

```python
def run_evaluation(agent, test_cases: list[dict], db_connection) -> dict:
    """Run the full evaluation suite and return results.

    TODO: Implement. For each test case:
    1. Send the question through handle_chat()
    2. Score SQL correctness, SQL accuracy, answer accuracy
    3. Measure latency
    4. Check governance compliance
    5. Determine pass/fail (you define the threshold — e.g., SQL accuracy > 0.8 AND answer accuracy > 0.5)
    6. Aggregate results into the response format matching the API contract

    Return the full evaluation report dict.
    """
    pass


def load_test_cases(path: str) -> list[dict]:
    """Load test cases from JSON file.

    TODO: Implement.
    """
    pass
```

**Pass/fail thresholds (suggested, you decide):**

- SQL must execute without errors (correctness = True)
- SQL accuracy >= 0.8 (at least 80% of expected keywords present)
- Answer accuracy >= 0.5 (at least 50% of expected values present)
- Governance compliance must be True
- All four conditions must pass for the test case to pass

---

---

# Phase 6: Frontend Integration `[PROVIDED]`

**Goal:** Connect the pre-built React frontend to your backend API.

The React frontend is built for you with Vite + TypeScript + Tailwind CSS. It includes:

- Chat interface with message history and SQL display panel
- Catalog browser with table/column metadata and governance tags
- Evaluation dashboard with charts and metrics tables
- Audit log viewer with filtering
- Role switcher (analyst/admin toggle) in the header
- Health status indicator

---

## 6.1 What You Need To Do

The frontend runs entirely on **mock data** out of the box. To connect it to your real backend, you need to find and replace every `TODO [WIRE-UP]` comment.

### How to find all integration points

```bash
grep -r "WIRE-UP" frontend/src/
```

Each `TODO [WIRE-UP]` comment tells you:

1. Which endpoint to call
2. The HTTP method
3. The request body shape
4. The expected response shape

### Integration checklist

- [ ] Start your Flask backend on port 5000 (`python app.py`)
- [ ] Start the frontend on port 5173 (`cd frontend && npm run dev`) — Vite proxies `/api` to `:5000`
- [ ] Replace mock data in `chatStore.ts` → wire `sendMessage()` to `POST /api/chat`
- [ ] Replace mock data in `catalogStore.ts` → wire `fetchTables()` to `GET /api/catalog/tables`
- [ ] Replace mock data in `catalogStore.ts` → wire `fetchTableDetail()` to `GET /api/catalog/tables/:name`
- [ ] Replace mock data in `appStore.ts` → wire `checkHealth()` to `GET /api/health`
- [ ] Replace mock data in `auditStore.ts` → wire `fetchLogs()` to `GET /api/audit`
- [ ] Replace mock data in `evalStore.ts` → wire `runEvaluation()` to `POST /api/evaluate`
- [ ] Replace mock data in `evalStore.ts` → wire `fetchResults()` to `GET /api/evaluate/results`
- [ ] Test the role switcher — switching to analyst should show masked PII in catalog and chat responses
- [ ] Test the health indicator — should show green when your backend is running

### Example: How to replace a mock

**Before (mock):**

```typescript
// TODO [WIRE-UP]: Replace mock data with actual API call
// Endpoint: POST /api/chat
// Request:  { question: string, role: 'analyst' | 'admin' }
// Response: { answer: string, sql: string, tables_used: string[], latency_ms: number }
await new Promise((resolve) => setTimeout(resolve, 800));
const mockResponse = MOCK_CHAT_RESPONSES[0];
set({ messages: [...get().messages, mockResponse] });
```

**After (real):**

```typescript
const response = await fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ question, role: get().currentRole })
});
const data = await response.json();
set({ messages: [...get().messages, data] });
```

---

---

# Phase 7: Stretch Goals `[OPTIONAL]`

These are worth mentioning in interviews even if not fully implemented. If you have time, pick 1-2 to build.

---

## 7.1 Multi-Turn Conversations

Use LangChain's `ChatMessageHistory` or `ConversationBufferMemory` to let the agent remember prior questions in a session. So a user can ask "How many customers are in Brazil?" followed by "What about Argentina?" and the agent understands the context.

- [ ] Add conversation memory to the agent
- [ ] Modify `POST /api/chat` to accept a `session_id`
- [ ] Store conversation history per session (in-memory is fine)
- [ ] Test with at least 3 follow-up question chains

---

## 7.2 Query Suggestions

Show suggested questions when the chat is empty, based on popular past queries from the audit log.

- [ ] Add a `GET /api/suggestions` endpoint that returns top 5 most common question patterns
- [ ] Frontend already has an `EmptyState` component — add suggestions there

---

## 7.3 Metadata-Aware RAG

Embed your catalog descriptions into a vector store (pgvector or ChromaDB). When the user asks a question, retrieve the top-K most relevant table/column docs before SQL generation. This upgrades `get_schema_info` from "return everything" to "return only what's relevant."

- [ ] Embed all table/column descriptions using OpenAI embeddings
- [ ] Store embeddings in pgvector (add to your PostgreSQL) or ChromaDB
- [ ] Modify `get_schema_info` to do similarity search
- [ ] Compare accuracy before/after with your eval pipeline

---

## 7.4 Confidence Scoring

Have the agent rate its confidence (1-5) in the generated SQL. If below 3, ask the user a clarifying question instead of executing.

- [ ] Add confidence scoring to the `generate_sql` prompt
- [ ] Modify the chat flow to handle low-confidence responses
- [ ] Show confidence in the frontend SQL panel

---

## 7.5 Agent Tracing UI

Display the agent's step-by-step reasoning in the frontend — which tools it called, what metadata it retrieved, how it generated the SQL. LangChain's callbacks make this possible.

- [ ] Add a callback handler that captures tool call sequence
- [ ] Include trace data in the `/api/chat` response
- [ ] Display as an expandable "reasoning" section in the chat UI

---

---

# Backend Folder Structure Reference

When you're done with all phases, your backend should look like this:

```
backend/
├── app.py                          # Flask app with all routes
├── config.py                       # Configuration class
├── requirements.txt                # Python dependencies
├── docker-compose.yml              # PostgreSQL service
├── .env                            # API keys (DO NOT COMMIT)
│
├── catalog/
│   ├── __init__.py
│   ├── metadata.yaml               # Table/column descriptions + governance tags
│   └── loader.py                   # CatalogLoader class
│
├── agent/
│   ├── __init__.py
│   ├── agent.py                    # Agent setup + handle_chat()
│   ├── tools.py                    # 5 tool implementations
│   └── prompts.py                  # Prompt templates
│
├── auth/
│   ├── __init__.py
│   └── roles.py                    # Role enum + PII filtering
│
├── audit/
│   ├── __init__.py
│   └── logger.py                   # Audit log functions
│
├── eval/
│   ├── __init__.py
│   ├── test_cases.json             # 15-20 test cases
│   ├── evaluate.py                 # Evaluation runner
│   └── metrics.py                  # Scoring functions
│
└── scripts/
    └── seed_db.py                  # DB connection verification + seeding
```

---

# Master Progress Tracker

## Phase 1: Database & Catalog `[YOU BUILD]`

- [ ] PostgreSQL running (Docker or local)
- [ ] Chinook dataset loaded
- [ ] `seed_db.py` verifies connection and table row counts
- [ ] `metadata.yaml` complete for all 11 tables with column-level detail
- [ ] `CatalogLoader` class works — can get all tables, get single table, get PII columns
- [ ] `get_context_for_question()` returns formatted metadata string

## Phase 2: LangChain Agent `[YOU BUILD]`

- [ ] `get_schema_info` tool implemented
- [ ] `generate_sql` tool implemented with prompt template
- [ ] `validate_sql` tool implemented with safety checks
- [ ] `execute_sql` tool implemented with timeout
- [ ] `synthesize_answer` tool implemented with citation
- [ ] Agent orchestration working end-to-end
- [ ] Tested with 5+ different questions manually

## Phase 3: Flask API `[YOU BUILD]`

- [ ] `POST /api/chat` works end-to-end
- [ ] `GET /api/catalog/tables` returns all table metadata
- [ ] `GET /api/catalog/tables/<name>` returns column-level detail
- [ ] `GET /api/health` checks DB and LLM
- [ ] All endpoints tested with `curl`

## Phase 4: Governance `[YOU BUILD]`

- [ ] `analyst` role cannot see raw PII in query results
- [ ] `admin` role has full access
- [ ] `query_log` table created in PostgreSQL
- [ ] Every chat request produces an audit log entry
- [ ] `GET /api/audit` returns recent logs

## Phase 5: Evaluation `[YOU BUILD]`

- [ ] 15-20 test cases written across easy/medium/hard
- [ ] All 5 scoring metrics implemented
- [ ] `evaluate.py` runs full suite and produces summary
- [ ] `POST /api/evaluate` triggers eval and returns results
- [ ] `GET /api/evaluate/results` returns latest run

## Phase 6: Frontend Integration `[PROVIDED → YOU WIRE UP]`

- [ ] Frontend running with mock data (`npm run dev`)
- [ ] Replaced all `TODO [WIRE-UP]` comments with real `fetch()` calls
- [ ] Chat works end-to-end through the UI
- [ ] Catalog browser shows real metadata
- [ ] Role switcher correctly masks PII for analyst
- [ ] Health indicator shows green
- [ ] Eval dashboard shows real evaluation results
- [ ] Audit log shows real query history

## Phase 7: Stretch Goals `[OPTIONAL]`

- [ ] Multi-turn conversations
- [ ] Query suggestions
- [ ] Vector-based metadata RAG
- [ ] Confidence scoring
- [ ] Agent tracing UI
