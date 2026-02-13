# Nexus: Natural Language Data Catalog Agent

## Overview

Build a natural language chat interface that lets non-technical users query a structured database using plain English. An AI agent powered by LangChain translates questions into SQL, executes them against a real database, and returns grounded, cited answers. On top of that, you add a metadata/governance layer (mimicking Alation's catalog), evaluation/observability, and role-based access control.

This project directly maps to the Alation ML/AI Engineer role: prototyping AI agents with LangChain, working with SQL/relational data, building evaluation pipelines, and understanding enterprise data governance.

---

## Architecture

```
User (React Frontend)
    |
    v
Flask REST API
    |
    +---> /chat  (main query endpoint)
    |       |
    |       v
    |   LangChain Agent
    |       |
    |       +---> Metadata Retriever (catalog context)
    |       |       - table descriptions, column docs, usage stats
    |       |       - governance tags (PII, restricted, public)
    |       |
    |       +---> Text-to-SQL Tool
    |       |       - generates SQL from user question + metadata context
    |       |       - validates against schema before execution
    |       |
    |       +---> SQL Executor Tool
    |       |       - runs validated query against PostgreSQL
    |       |       - enforces row limits, timeouts
    |       |
    |       +---> Answer Synthesizer
    |               - formats raw results into natural language
    |               - cites source tables/columns
    |
    +---> /evaluate  (evaluation endpoint)
    |       - logs query, generated SQL, result, latency
    |       - scores with custom metrics
    |
    +---> /catalog   (metadata CRUD)
    |       - browse tables, columns, descriptions
    |       - view governance tags
    |
    +---> /auth      (role-based access)
            - analyst vs. admin roles
            - PII column filtering per role
```

---

## Database: What to Use

Use a publicly available dataset loaded into PostgreSQL. Good options:

1. **Chinook Database** (music store: artists, albums, invoices, customers) - simple, well-documented, good for demos
2. **Pagila** (DVD rental: films, actors, rentals, payments) - richer schema with more joins
3. **Northwind** (classic business dataset: orders, products, employees, customers) - enterprise feel, good complexity

**Recommendation:** Use Chinook or Northwind. Both have enough tables (10-15) to make text-to-SQL interesting without being overwhelming. You can download SQL scripts to seed PostgreSQL directly.

---

## What to Build Yourself (Backend)

### Phase 1: Core Agent (Start Here)

**Goal:** User types a question, agent generates SQL, runs it, returns an answer.

#### 1.1 Database Setup
- Install PostgreSQL locally (or use Docker: `docker run --name nexus-db -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres`)
- Load your chosen dataset
- Verify you can connect and run queries via `psycopg2`

#### 1.2 Metadata Catalog Layer
This is the piece that makes your project feel like Alation. Create a `catalog` table or a JSON/YAML file that stores metadata about your database:

```
For each table:
  - table_name
  - description (human-readable, e.g. "Stores customer order history")
  - owner
  - governance_level: "public" | "internal" | "restricted"

For each column:
  - column_name
  - table_name
  - data_type
  - description (e.g. "Customer email address")
  - is_pii: true/false
  - sample_values (2-3 examples)
  - governance_tag: "public" | "pii" | "sensitive"
```

You can store this in a separate PostgreSQL table, a YAML file, or even a Python dict to start. The point is that the agent consults this metadata before generating SQL, just like Alation's agents use their catalog to ground responses.

**Why this matters for the interview:** Alation's core thesis is that AI agents produce 30-60% more accurate outputs when grounded in governed metadata. Your project demonstrates that you understand this.

#### 1.3 LangChain Agent with Tools

This is the main thing to implement yourself. Use LangChain's agent framework with custom tools.

**Tools to create:**

1. **`get_schema_info`** - Given a user question, retrieves relevant table/column metadata from your catalog. This is your "retrieval" step. Start simple: embed table descriptions and do similarity search, or just keyword match.

2. **`generate_sql`** - Takes the user question + retrieved metadata context and produces a SQL query. Use a prompt template that includes the table schemas, column descriptions, and governance tags. The prompt should instruct the LLM to only use columns/tables present in the metadata.

3. **`validate_sql`** - Parses the generated SQL and checks:
   - Only references tables/columns that exist in the schema
   - No destructive operations (DROP, DELETE, UPDATE, INSERT)
   - Has a LIMIT clause (enforce max rows)
   - Does not select PII columns unless the user role allows it

4. **`execute_sql`** - Runs the validated query against PostgreSQL with a timeout. Returns raw results.

5. **`synthesize_answer`** - Takes raw query results + original question and generates a natural language answer that cites which tables/columns were used.

**LangChain components to use:**
- `ChatOpenAI` or `ChatAnthropic` as the LLM
- `create_react_agent` or `AgentExecutor` to orchestrate tool calls
- `Tool` class to wrap each function above
- `PromptTemplate` for your system prompt
- `SQLDatabase` from langchain_community (optional, LangChain has a built-in SQL toolkit you can reference, but building your own tools teaches you more)

**Skeleton flow in pseudocode:**
```
def handle_chat(user_question, user_role):
    # 1. Retrieve metadata context
    metadata = get_schema_info(user_question)

    # 2. Build prompt with metadata + governance context
    prompt = build_prompt(user_question, metadata, user_role)

    # 3. Agent decides which tools to call
    agent = create_agent(llm, tools=[generate_sql, validate_sql, execute_sql, synthesize_answer])
    response = agent.invoke({"input": prompt})

    # 4. Log everything for evaluation
    log_query(user_question, generated_sql, results, latency, user_role)

    return response
```

#### 1.4 Flask API

Expose the agent via a REST API:

- `POST /api/chat` - Main endpoint. Accepts `{ "question": "...", "role": "analyst" }`. Returns `{ "answer": "...", "sql": "...", "tables_used": [...], "latency_ms": ... }`
- `GET /api/catalog/tables` - Returns all table metadata from your catalog
- `GET /api/catalog/tables/<name>` - Returns column-level metadata for a table
- `GET /api/health` - Health check

Use Flask-CORS so the React frontend can hit it.

---

### Phase 2: Governance and Access Control

**Goal:** Different user roles see different data. PII is protected.

#### 2.1 Role-Based Filtering
Define two roles:
- **analyst**: Can query all public and internal data. PII columns (emails, phone numbers, addresses) are masked or excluded from results.
- **admin**: Full access to everything.

Implement this in your `validate_sql` tool: before executing, check if the query selects any PII-tagged columns and the user role is "analyst". If so, either:
- Replace PII columns with a masked version (e.g., `'***' AS email`)
- Reject the query and tell the user they lack access

**Why this matters:** The JD lists "understanding of enterprise data governance and access control principles" as a desired qualification. This is a simple but effective demo.

#### 2.2 Query Audit Trail
Log every query to a `query_log` table:
```
- id
- timestamp
- user_role
- original_question
- generated_sql
- was_pii_filtered (boolean)
- result_row_count
- latency_ms
- llm_model_used
```

Add a `GET /api/audit` endpoint that returns recent logs. This shows you think about observability in production systems.

---

### Phase 3: Evaluation Pipeline

**Goal:** Benchmark your agent's accuracy systematically, not just vibes.

This is directly called out in the JD: "evaluate, benchmark, and refine performance."

#### 3.1 Test Suite
Create a JSON file of test cases:
```json
[
  {
    "question": "How many customers are in Brazil?",
    "expected_sql_contains": ["Customer", "Country", "Brazil"],
    "expected_answer_contains": ["5"],
    "difficulty": "easy"
  },
  {
    "question": "What artist has the most albums?",
    "expected_sql_contains": ["Artist", "Album", "COUNT", "ORDER BY"],
    "expected_answer_contains": ["Iron Maiden"],
    "difficulty": "medium"
  },
  {
    "question": "Show me total revenue by country for 2013",
    "expected_sql_contains": ["Invoice", "BillingCountry", "SUM", "Total"],
    "expected_answer_contains": [],
    "difficulty": "hard"
  }
]
```

Write 15-20 test cases across easy/medium/hard.

#### 3.2 Evaluation Metrics
For each test case, score:
- **SQL Correctness**: Does the generated SQL execute without errors? (binary)
- **SQL Accuracy**: Does it contain the expected tables/columns/keywords? (precision score)
- **Answer Accuracy**: Does the final answer contain the expected values? (recall score)
- **Latency**: End-to-end time in ms
- **Governance Compliance**: If test case involves PII, was it properly filtered?

#### 3.3 Evaluation Runner
Build a script (`evaluate.py`) that:
1. Loads test cases
2. Runs each through your agent
3. Scores each metric
4. Outputs a summary report (pass rate by difficulty, average latency, governance compliance rate)

Optionally integrate LangFuse or LangSmith for tracing. You already have LangFuse experience from KdanMobile, so you can mention this at the interview as something you'd add for production observability.

#### 3.4 Evaluation API
- `POST /api/evaluate` - Triggers the full eval suite, returns results
- `GET /api/evaluate/results` - Returns the latest eval run

---

### Phase 4: Stretch Goals (If Time Allows)

These are things you can mention at the interview as "next steps" even if you don't fully build them:

1. **Multi-turn conversations**: Agent remembers context from prior questions (use LangChain's `ConversationBufferMemory` or `ChatMessageHistory`)

2. **Query suggestions**: When the user opens the app, show suggested questions based on popular past queries from the audit log

3. **Metadata-aware RAG**: Embed your catalog descriptions into a vector store (pgvector or Chroma). When the user asks a question, retrieve the most relevant table/column docs before SQL generation. This is a meaningful upgrade over keyword matching.

4. **Confidence scoring**: Have the agent rate its own confidence (1-5) in the generated SQL. If confidence is below 3, ask the user a clarifying question before executing.

5. **Agent tracing UI**: Display the agent's reasoning steps in the frontend (which tools it called, in what order). LangChain's callbacks make this straightforward.

---

## Frontend (I Will Build This for You)

A React app with:
- Chat interface (message history, streaming responses)
- SQL display panel (shows generated query, highlighted)
- Catalog browser sidebar (tables, columns, governance tags)
- Role switcher (analyst vs admin toggle)
- Evaluation dashboard (pass rates, latency charts)

Just let me know when you want the frontend and I will build it out.

---

## Tech Stack Summary

| Layer | Technology |
|---|---|
| LLM | OpenAI GPT-4o or Claude via LangChain |
| Agent Framework | LangChain (agents, tools, prompts) |
| Backend | Flask, Python |
| Database | PostgreSQL |
| Metadata Store | PostgreSQL table or YAML |
| Evaluation | Custom Python + optionally LangFuse |
| Frontend | React (provided for you) |
| Containerization | Docker + docker-compose |

---

## Getting Started Checklist

1. [ ] Set up PostgreSQL (Docker recommended)
2. [ ] Load Chinook or Northwind dataset
3. [ ] Create your metadata catalog (YAML or DB table) with descriptions and governance tags for every table/column
4. [ ] Get a basic LangChain agent working that can answer one hardcoded question with text-to-SQL
5. [ ] Add the `validate_sql` tool with destructive query blocking
6. [ ] Add PII filtering based on user role
7. [ ] Wire it up to Flask with the `/api/chat` endpoint
8. [ ] Write 15-20 eval test cases
9. [ ] Build `evaluate.py` to run the suite and report metrics
10. [ ] Add the audit log table and `/api/audit` endpoint
11. [ ] Hook up the React frontend
12. [ ] Run eval, iterate on prompts to improve pass rate