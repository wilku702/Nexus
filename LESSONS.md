# Nexus: Lesson Plan

> Work through these lessons in order. Each one builds on the last. Don't skip ahead — the dependencies are real.

---

## How to use this document

Each lesson follows the same structure:

1. **Goal** — what you're building and why it matters
2. **Files** — which skeleton files to implement
3. **Concepts** — what you'll learn
4. **Steps** — ordered instructions with enough detail to unblock you, but not so much that you're just copying
5. **Hints** — expandable tips if you get stuck (try without them first)
6. **Checkpoint** — how to verify you did it right before moving on

Estimated total time: 12-20 hours depending on your Python/SQL experience.

---

## Lesson 1: PostgreSQL with Docker Compose

**Goal:** Get a PostgreSQL database running locally with the Chinook music dataset loaded automatically on startup.

**Files:** `backend/docker-compose.yml`

**Concepts:** Docker Compose syntax, container networking, init scripts, named volumes, environment variables

**Steps:**

1. Install Docker Desktop if you don't have it (`docker --version` to check)
2. Download the Chinook PostgreSQL SQL script from GitHub:
   - Repository: `lerocha/chinook-database`
   - You want the PostgreSQL version (the `.sql` file)
   - Save it somewhere inside `backend/scripts/`
3. Open `backend/docker-compose.yml` and fill in the TODOs:
   - The `image` field needs an image name and tag
   - The `environment` block sets variables _inside_ the container — PostgreSQL reads specific ones on startup
   - The `ports` block maps `host:container` — PostgreSQL listens on a well-known port
   - The `volumes` block does two things: mounts your SQL file for auto-seeding, and creates persistent storage
4. The `volumes` key at the bottom (top-level, outside `services`) declares named volumes
5. Run `docker compose up -d` and check the logs with `docker compose logs -f db`

**Hints:**

<details>
<summary>What image tag should I use?</summary>

`postgres:15` — the number is the major version. You specified this in the requirements.

</details>

<details>
<summary>What environment variables does the postgres image expect?</summary>

The official image docs list them: `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`. These create the database and user on first startup. Make them match your `.env` file values (`nexus` / `nexus` / `nexus` is fine for local dev).

</details>

<details>
<summary>How does the init script auto-run?</summary>

PostgreSQL's Docker image runs any `.sql` or `.sh` files in `/docker-entrypoint-initdb.d/` on first startup (only when the data directory is empty). Mount your Chinook SQL file there.

</details>

<details>
<summary>My database won't re-seed when I change the SQL file</summary>

Init scripts only run on a fresh data volume. Run `docker compose down -v` to delete the volume, then `docker compose up -d` to start fresh.

</details>

**Checkpoint:**

```bash
# Connect to the running database
docker compose exec db psql -U nexus -d nexus -c "SELECT COUNT(*) FROM \"Customer\";"
# Expected output: 59
```

---

## Lesson 2: Python Database Connection

**Goal:** Verify your Python environment can talk to PostgreSQL and the Chinook tables are all there.

**Files:** `backend/scripts/seed_db.py`, `backend/config.py` (already complete — just read it)

**Concepts:** psycopg2 connection strings, `information_schema`, cursor usage, error handling

**Steps:**

1. Set up a Python virtual environment:
   ```bash
   cd backend
   python -m venv .venv
   source .venv/bin/activate   # or .venv\Scripts\activate on Windows
   pip install -r requirements.txt
   ```
2. Copy `.env.example` to `.env` — the defaults should work if you used `nexus`/`nexus`/`nexus` in docker-compose
3. Open `backend/scripts/seed_db.py` and implement `verify_connection()`:
   - Use `psycopg2.connect()` with the URL from `Config.DATABASE_URL`
   - Query `information_schema.tables` where `table_schema = 'public'` to list all tables
   - Loop through and print each table name with its row count
4. Implement `run_init_sql()`:
   - Read the `scripts/init.sql` file
   - Execute it against the database
   - This creates the `query_log` table you'll need later
5. Run it: `python scripts/seed_db.py`

**Hints:**

<details>
<summary>How do I connect with psycopg2?</summary>

```python
import psycopg2
conn = psycopg2.connect("postgresql://user:pass@localhost:5432/dbname")
cursor = conn.cursor()
cursor.execute("SELECT 1")
print(cursor.fetchone())
```

</details>

<details>
<summary>How do I get row counts for each table?</summary>

You can't use a parameter for table names in SQL. Build the query string with f-strings, but use double quotes around the table name since Chinook uses PascalCase: `f'SELECT COUNT(*) FROM "{table_name}"'`

</details>

<details>
<summary>I get "connection refused"</summary>

Make sure Docker is running and `docker compose up -d` was successful. Check that the port in your `.env` matches the port in `docker-compose.yml`.

</details>

**Checkpoint:**

```
$ python scripts/seed_db.py
Album: 347 rows
Artist: 275 rows
Customer: 59 rows
Employee: 8 rows
Genre: 25 rows
Invoice: 412 rows
InvoiceLine: 2240 rows
MediaType: 5 rows
Playlist: 18 rows
PlaylistTrack: 8715 rows
Track: 3503 rows
query_log: 0 rows
Found 12 tables, all OK
```

---

## Lesson 3: Metadata Catalog

**Goal:** Describe every Chinook table and column in YAML so the AI agent knows what data exists.

**Files:** `backend/catalog/metadata.yaml`, `backend/catalog/loader.py`

**Concepts:** YAML syntax, data governance (PII tagging), catalog design, Python class design

### Part A: Complete the YAML catalog

**Steps:**

1. The Customer table is already done in `metadata.yaml` — study the pattern
2. Add the remaining 10 tables. For each table you need:
   - `table_name` — exact match to PostgreSQL (PascalCase)
   - `description` — what does this table store, in plain English?
   - `owner` — make something up (`sales_team`, `music_team`, `finance_team`, etc.)
   - `governance_level` — `"public"`, `"internal"`, or `"restricted"`
   - All columns with types, descriptions, PII flags, sample values, and governance tags
3. To discover column names and types, query your running database:
   ```sql
   SELECT column_name, data_type, character_maximum_length
   FROM information_schema.columns
   WHERE table_name = 'Album'
   ORDER BY ordinal_position;
   ```
4. To get sample values, query the actual data:
   ```sql
   SELECT DISTINCT "Name" FROM "Artist" LIMIT 3;
   ```

**Hints:**

<details>
<summary>Which tables have PII?</summary>

Only `Customer` and `Employee`. Their contact info columns (Email, Phone, Address, City, State, PostalCode, Fax) are PII. Employee also has BirthDate as PII.

</details>

<details>
<summary>Which columns are "sensitive" vs "public"?</summary>

Revenue/price columns are `sensitive`: `Invoice.Total`, `InvoiceLine.UnitPrice`, `Track.UnitPrice`. Everything else that isn't PII is `public`.

</details>

<details>
<summary>Do I need all 11 tables?</summary>

Yes — the agent will generate bad SQL if it doesn't know about a table. Missing tables mean missing JOINs and wrong answers. This is tedious but it's the _most important_ part of the project: metadata quality directly determines agent accuracy.

</details>

### Part B: Implement CatalogLoader

**Steps:**

1. Open `backend/catalog/loader.py` and implement `__init__`:
   - Use `yaml.safe_load()` to parse the file
   - Build a lookup dict keyed by table name for O(1) access
2. Implement `get_all_tables()` — return summaries (no columns), add a `column_count` field
3. Implement `get_table()` — return the full table dict including columns
4. Implement `get_pii_columns()` — filter columns where `is_pii == True`
5. Implement `get_context_for_question()` — format all metadata as a readable string

**Hints:**

<details>
<summary>How should get_context_for_question format the output?</summary>

The LLM needs to read this, so clarity matters more than brevity. Something like:

```
Table: Customer
Description: Stores customer account information...
Columns:
  - CustomerId (integer): Primary key [sample: 1, 2, 3]
  - Email (varchar): Customer email [PII] [sample: luisg@embraer.com.br]
  ...

Table: Album
...
```

</details>

**Checkpoint:**

```bash
python -c "
from catalog.loader import CatalogLoader
c = CatalogLoader('catalog/metadata.yaml')
print(f'Tables loaded: {len(c.get_all_tables())}')
print(f'Customer columns: {len(c.get_table(\"Customer\")[\"columns\"])}')
print(f'Customer PII cols: {c.get_pii_columns(\"Customer\")}')
"
# Expected: 11 tables, 13 Customer columns, PII list includes Email, Phone, etc.
```

---

## Lesson 4: Flask API — Catalog Endpoints

**Goal:** Get your first two API endpoints working and visible in the frontend Catalog Browser.

**Files:** `backend/app.py` (just the catalog routes + health + initialization)

**Concepts:** Flask routing, JSON responses, CORS, Vite dev proxy

**Steps:**

1. In `app.py`, implement the initialization section:
   - Create a psycopg2 connection to your database
   - Create a `CatalogLoader` instance
   - (Skip the agent for now — you'll add it later)
2. Implement `GET /api/catalog/tables`:
   - Call `catalog.get_all_tables()`
   - Return with `jsonify()`
3. Implement `GET /api/catalog/tables/<name>`:
   - Call `catalog.get_table(name)`
   - Return 404 if None
4. Implement `GET /api/health` (partial — just check the database, skip LLM for now)
5. Start the server: `python app.py`
6. Test with curl:
   ```bash
   curl http://localhost:5173/api/catalog/tables | python -m json.tool
   curl http://localhost:5173/api/catalog/tables/Customer | python -m json.tool
   curl http://localhost:5000/api/health
   ```

**Hints:**

<details>
<summary>Flask keeps crashing on import errors</summary>

Make sure you're running from the `backend/` directory so Python can find your modules. Or use: `PYTHONPATH=. python app.py`

</details>

<details>
<summary>CORS errors in the browser</summary>

`flask-cors` handles this. Make sure `CORS(app)` is called right after `Flask(__name__)`. For the Vite dev proxy to work, check `frontend/vite.config.ts` has a proxy entry mapping `/api` to `http://localhost:5000`.

</details>

**Checkpoint:**

```bash
# API returns data
curl -s http://localhost:5000/api/catalog/tables | python -m json.tool | head -20

# Wire up the frontend:
# 1. Open frontend/src/components/catalog/CatalogBrowser.tsx
# 2. Follow the TODO [WIRE-UP] comments
# 3. Run: cd frontend && npm run dev
# 4. Open http://localhost:5173 → Catalog page should show your real tables
```

---

## Lesson 5: Prompt Engineering

**Goal:** Write the prompt templates that tell the LLM how to behave.

**Files:** `backend/agent/prompts.py`

**Concepts:** System prompts, few-shot examples, prompt variables, prompt engineering best practices

**Steps:**

1. Write `SYSTEM_PROMPT` — this defines the agent's personality and rules. Think about:
   - What role is the agent playing?
   - What should it never do? (modify data, expose PII to analysts)
   - What database is it querying? What syntax?
   - How should it handle questions it can't answer?
2. Write `SQL_GENERATION_PROMPT` — this turns questions into SQL. Include:
   - The `{schema_context}` placeholder (metadata goes here)
   - The `{question}` placeholder
   - The `{role}` placeholder
   - Explicit instructions about PostgreSQL syntax, LIMIT clauses, PascalCase quoting
3. Write `ANSWER_SYNTHESIS_PROMPT` — this turns raw results into English

**Hints:**

<details>
<summary>How long should the system prompt be?</summary>

200-500 words is a good range. Too short and the LLM makes assumptions. Too long and it ignores parts. Be specific about rules, vague about personality.

</details>

<details>
<summary>Should I include examples in the SQL prompt?</summary>

Yes — 1-2 examples of question/SQL pairs dramatically improve accuracy. This is called "few-shot prompting." Example:

```
Question: How many customers are in Brazil?
SQL: SELECT COUNT(*) FROM "Customer" WHERE "Country" = 'Brazil';
```

</details>

<details>
<summary>My LLM generates SQL without double quotes</summary>

Add explicit instructions: "Chinook uses PascalCase table and column names. In PostgreSQL, you MUST double-quote them: SELECT \"Name\" FROM \"Artist\", not SELECT Name FROM Artist."

</details>

**Checkpoint:** No code to run yet — you'll test these prompts in the next lesson. But read each prompt aloud. Does it clearly tell the LLM what to do? Could you follow these instructions yourself?

---

## Lesson 6: Agent Tools

**Goal:** Implement the 5 tool functions that the LangChain agent will call.

**Files:** `backend/agent/tools.py`

**Concepts:** LangChain tools, SQL parsing, psycopg2 cursor management, text-to-SQL, PII awareness

**Steps:**

Implement the tools in this order (each builds on the previous):

1. **`get_schema_info`** — Easiest. Just call `catalog.get_context_for_question()`. This is your Lesson 3 work paying off.

2. **`execute_sql`** — Second easiest. Use psycopg2 to run a query and return results as dicts. Set a statement timeout. Handle errors.

3. **`validate_sql`** — Medium difficulty. Start with basic string checks:
   - Does it start with SELECT?
   - Does it have a LIMIT clause? If not, add one.
   - Is it trying to DROP/DELETE/UPDATE anything?
   - Save PII filtering for after you get the basic flow working.

4. **`generate_sql`** — This is a prompt engineering + LLM call. You'll need to:
   - Import your LLM (ChatOpenAI or ChatAnthropic)
   - Build the prompt from your template
   - Call the LLM and extract the SQL from the response
   - Strip markdown code fences if the LLM wraps it

5. **`synthesize_answer`** — Similar to generate_sql but for the answer synthesis prompt.

**Hints:**

<details>
<summary>How do I call the LLM from a tool function?</summary>

You have a design choice: pass the LLM instance as a parameter, or make the tools methods on a class that holds the LLM. The simpler approach for now:

```python
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(model="gpt-4o", api_key=Config.LLM_API_KEY)
response = llm.invoke("Your prompt here")
answer = response.content  # string
```

</details>

<details>
<summary>How do I strip markdown code blocks from SQL?</summary>

````python
sql = sql.strip()
if sql.startswith("```"):
    sql = sql.split("\n", 1)[1]  # remove first line
if sql.endswith("```"):
    sql = sql.rsplit("```", 1)[0]  # remove last line
sql = sql.strip()
````

</details>

<details>
<summary>How do I convert cursor results to a list of dicts?</summary>

```python
columns = [desc[0] for desc in cursor.description]
rows = [dict(zip(columns, row)) for row in cursor.fetchall()]
```

</details>

**Checkpoint:**

```python
# Test each tool individually before wiring them together
from agent.tools import get_schema_info, execute_sql, validate_sql

# 1. Schema info returns a non-empty string
context = get_schema_info("How many customers?", catalog)
assert len(context) > 100

# 2. Execute SQL runs a real query
result = execute_sql('SELECT COUNT(*) FROM "Customer"', db)
assert result["row_count"] == 1

# 3. Validate blocks dangerous SQL
result = validate_sql("DROP TABLE Customer", "admin", catalog)
assert result["valid"] == False
```

---

## Lesson 7: Agent Orchestration

**Goal:** Wire all 5 tools into a LangChain agent that can answer questions end-to-end.

**Files:** `backend/agent/agent.py`

**Concepts:** LangChain AgentExecutor, ReAct pattern, tool binding, error handling, latency measurement

**Steps:**

1. Implement `create_langchain_agent()`:
   - Initialize your LLM
   - Wrap each tool function as a `langchain_core.tools.Tool`
   - Use `create_react_agent()` or build a simpler chain if ReAct is too complex
   - Return the executor
2. Implement `handle_chat()`:
   - Measure start time
   - Invoke the agent
   - Extract answer, SQL, and tables_used from the result
   - Calculate latency
   - Return the response dict
3. Test manually with 3-5 questions:
   - "How many customers are there?"
   - "What genre has the most tracks?"
   - "Show me the top 5 artists by album count"

**Hints:**

<details>
<summary>ReAct agent is hard to set up — is there a simpler approach?</summary>

Yes. For v1, you can skip the full agent loop and just chain the tools yourself:

```python
def handle_chat(agent_deps, question, role):
    context = get_schema_info(question, catalog)
    sql = generate_sql(question, context, role)
    validation = validate_sql(sql, role, catalog)
    if not validation["valid"]:
        return {"answer": validation["reason"], "sql": "", ...}
    results = execute_sql(validation["sql"], db)
    answer = synthesize_answer(question, sql, results)
    return {"answer": answer, "sql": sql, ...}
```

This is a perfectly valid approach. You can upgrade to a full ReAct agent later.

</details>

<details>
<summary>How do I extract tables_used?</summary>

Parse the SQL for table names. A simple approach: compare each table name in your catalog against the SQL string. If "Customer" appears in the SQL, it was used.

</details>

**Checkpoint:**

```python
from agent.agent import create_langchain_agent, handle_chat
agent = create_langchain_agent(catalog, db)
result = handle_chat(agent, "How many customers are there?", "admin")
print(result)
# Should contain: answer mentioning "59", sql with SELECT COUNT(*),
# tables_used including "Customer", and a latency_ms value
```

---

## Lesson 8: Chat API + Frontend Wire-Up

**Goal:** The Chat UI in the frontend sends questions to your backend and displays real answers.

**Files:** `backend/app.py` (chat route), frontend wire-up

**Concepts:** POST request handling, JSON parsing, error responses, end-to-end integration

**Steps:**

1. Implement `POST /api/chat` in `app.py`:
   - Parse `request.get_json()`
   - Validate `question` and `role`
   - Call `handle_chat(agent, question, role)`
   - Return with `jsonify()`
   - Wrap in try/except to catch agent errors
2. Test with curl:
   ```bash
   curl -X POST http://localhost:5000/api/chat \
     -H "Content-Type: application/json" \
     -d '{"question": "How many customers?", "role": "admin"}'
   ```
3. Wire up the frontend:
   - Open `frontend/src/components/chat/ChatWindow.tsx`
   - Change `USE_MOCKS` from `true` to `false` on line 10
   - The `else` branch already calls `sendChatMessage()` which hits your API
4. Start both servers and test in the browser

**Checkpoint:** Type "How many customers are there?" in the Chat UI. You should see a real answer from your agent with actual SQL displayed.

---

## Lesson 9: Role-Based Access Control

**Goal:** Analysts cannot see PII (emails, phone numbers, addresses). Admins see everything.

**Files:** `backend/auth/roles.py`, update `backend/agent/tools.py` (validate_sql)

**Concepts:** RBAC, PII masking, SQL rewriting, governance compliance

**Steps:**

1. Implement `get_role_permissions()` — return a permissions dict for each role
2. Implement `filter_pii_from_sql()`:
   - If role is ADMIN, return SQL unchanged
   - If role is ANALYST, find PII columns in the SELECT clause and replace them with `'***' AS "ColumnName"`
   - Start with the simplest case: explicit column names in SELECT (ignore `SELECT *` for now)
3. Update `validate_sql` in `tools.py` to call `filter_pii_from_sql` when the role is analyst
4. Test by switching roles in the frontend header and asking about customer emails

**Hints:**

<details>
<summary>How do I detect PII columns in a SELECT clause?</summary>

Simple approach: for each PII column name, check if it appears in the portion of the SQL before the FROM keyword. This isn't perfect for complex queries but works for 90% of cases.

</details>

<details>
<summary>What about SELECT *?</summary>

For v1, you can either:

- Reject `SELECT *` queries and ask the agent to be explicit
- Or add a note in your SQL generation prompt: "Never use SELECT \*, always list columns explicitly"

The second approach is better UX and avoids complex SQL rewriting.

</details>

**Checkpoint:**

```bash
# As admin — should see real emails
curl -X POST http://localhost:5000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"question": "Show me customer emails from Brazil", "role": "admin"}'

# As analyst — emails should be masked as ***
curl -X POST http://localhost:5000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"question": "Show me customer emails from Brazil", "role": "analyst"}'
```

---

## Lesson 10: Audit Logging

**Goal:** Every query is logged to a database table. The Audit Log Viewer shows the history.

**Files:** `backend/audit/logger.py`, `backend/app.py` (audit route), `backend/agent/agent.py` (add logging call)

**Concepts:** INSERT queries, audit trails, data compliance, ISO timestamps

**Steps:**

1. Implement `log_query()` in `logger.py`:
   - INSERT into the `query_log` table (created in Lesson 2)
   - Use parameterized queries (`%s` placeholders) to prevent SQL injection
   - Commit the transaction
   - Wrap in try/except so logging failures don't crash the app
2. Implement `get_recent_logs()`:
   - SELECT from `query_log` ORDER BY timestamp DESC
   - Convert to list of dicts matching the API contract
   - Convert the integer `id` to a string (frontend expects string IDs)
   - Format timestamps as ISO strings
3. Add a `log_query()` call inside `handle_chat()` in `agent.py`
4. Implement `GET /api/audit` in `app.py`
5. Wire up the frontend Audit Log Viewer (follow the WIRE-UP comment)

**Hints:**

<details>
<summary>How do I format timestamps as ISO strings?</summary>

```python
row["timestamp"] = row["timestamp"].isoformat() + "Z"
```

</details>

<details>
<summary>psycopg2 parameterized INSERT</summary>

```python
cursor.execute(
    """INSERT INTO query_log
       (user_role, original_question, generated_sql, was_pii_filtered,
        result_row_count, latency_ms, llm_model_used)
       VALUES (%s, %s, %s, %s, %s, %s, %s)""",
    (entry["user_role"], entry["original_question"], ...)
)
conn.commit()
```

</details>

**Checkpoint:** Ask 3 questions in the Chat UI, then navigate to the Audit page. You should see all 3 logged with timestamps, SQL, and latency.

---

## Lesson 11: Evaluation Pipeline

**Goal:** Systematically benchmark your agent's accuracy with scored test cases.

**Files:** `backend/eval/test_cases.json`, `backend/eval/metrics.py`, `backend/eval/evaluate.py`, `backend/app.py` (eval routes)

**Concepts:** Automated testing, scoring metrics, keyword matching, benchmark aggregation

### Part A: Add test cases

1. Open `eval/test_cases.json` — 3 examples are provided
2. Add 12-17 more test cases covering:
   - **Easy** (6 total): Single table, simple COUNT/filter. E.g., "How many genres are there?"
   - **Medium** (6 total): 2-table JOIN, GROUP BY. E.g., "What genre has the most tracks?"
   - **Hard** (6 total): 3+ table JOIN, subquery. E.g., "Total revenue by country for 2013"
   - At least 2 PII governance tests with the `governance_test` field

### Part B: Implement scoring functions

1. Implement all 4 functions in `metrics.py`:
   - `score_sql_correctness` — try running the SQL, return True/False
   - `score_sql_accuracy` — keyword matching, return 0.0-1.0
   - `score_answer_accuracy` — same approach for the answer text
   - `check_governance_compliance` — simple boolean logic

### Part C: Implement the evaluation runner

1. Implement `load_test_cases()` in `evaluate.py` — just `json.load()`
2. Implement `run_evaluation()`:
   - Loop through each test case
   - Run through the agent
   - Score each metric
   - Aggregate into summary and by_difficulty breakdowns
3. Implement `POST /api/evaluate` and `GET /api/evaluate/results` in `app.py`
4. Wire up the frontend Eval Dashboard (follow the WIRE-UP comments)

**Checkpoint:** Click "Run Evaluation" in the frontend. The dashboard should populate with real scores, a difficulty breakdown chart, and a scrollable test case table.

---

## Lesson 12: Final Integration

**Goal:** Everything works end-to-end. All mock data is replaced with real API calls.

**Files:** All 5 frontend files with `TODO [WIRE-UP]` comments

**Steps:**

1. Find all remaining wire-up points:
   ```bash
   grep -rn "WIRE-UP" frontend/src/
   ```
2. Replace each mock block following the instructions in the comment
3. Verify each page works:
   - **Chat** — ask 5 different questions, try both roles
   - **Catalog** — browse all 11 tables, check column details
   - **Audit** — see your recent queries logged
   - **Eval** — run an evaluation, see scores
   - **Health** — indicator should show green in the header
4. Final check: `cd frontend && npx tsc --noEmit` still passes

**Checkpoint:** You should be able to demo the full application to someone, showing:

- Natural language questions turning into real SQL
- PII being masked for analysts but visible for admins
- An audit trail of every query
- A quantitative evaluation of your agent's accuracy

---

## What to do next

Once all 12 lessons are complete, consider the stretch goals from PLAN.md:

- **Multi-turn conversations** — "How many customers in Brazil?" followed by "What about Argentina?"
- **Query suggestions** — show popular queries from the audit log on the empty chat screen
- **LangFuse/LangSmith integration** — production-grade LLM observability
- **Embedding-based catalog search** — use vector similarity instead of keyword matching in `get_context_for_question`

Each of these is worth mentioning in interviews even if you only get halfway through.
