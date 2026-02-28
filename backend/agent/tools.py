"""Agent Tools — the 5 core functions the LangChain agent can call.

Each tool is a plain Python function that gets wrapped as a LangChain Tool
in agent.py. The agent decides which tools to call and in what order.

Typical flow:
  1. get_schema_info  → understand what tables/columns exist
  2. generate_sql     → write a SQL query grounded in the metadata
  3. validate_sql     → safety-check before execution
  4. execute_sql      → run against PostgreSQL
  5. synthesize_answer → turn raw results into a natural language response
"""

from catalog.loader import CatalogLoader
from auth.roles import UserRole


# ---------------------------------------------------------------------------
# Tool 1: get_schema_info
# ---------------------------------------------------------------------------

def get_schema_info(question: str, catalog: CatalogLoader) -> str:
    """Retrieve relevant table/column metadata for a user question.

    Input:  The user's natural language question
    Output: Formatted string of table names, descriptions, columns, types, samples

    TODO: Implement. Steps:
      1. Call catalog.get_context_for_question(question)
      2. Return the formatted context string
      3. Later: add keyword matching to return only relevant tables

    This is the foundation of "metadata-grounded" SQL generation.
    Without good context here, the LLM will hallucinate table/column names.
    """
    # TODO: Return formatted schema context
    pass


# ---------------------------------------------------------------------------
# Tool 2: generate_sql
# ---------------------------------------------------------------------------

def generate_sql(question: str, schema_context: str, role: str) -> str:
    """Generate a SQL query from a natural language question.

    Input:  User question + metadata context + user role
    Output: A PostgreSQL-compatible SQL query string

    TODO: Implement. Steps:
      1. Build a prompt using SQL_GENERATION_PROMPT from prompts.py
      2. Inject {schema_context}, {question}, {role} into the prompt
      3. Call the LLM (you'll need to pass the LLM instance — consider
         making this a method on a class, or pass it as a parameter)
      4. Parse the LLM response to extract just the SQL
      5. Strip markdown code blocks if the LLM wraps it in ```sql ... ```
      6. Return the clean SQL string

    Edge cases to handle:
      - LLM returns "I can't answer that" → return empty string or raise
      - LLM wraps SQL in markdown → strip the ``` markers
      - Column names need double-quoting for PostgreSQL (PascalCase)
    """
    # TODO: Build prompt, call LLM, extract SQL
    pass


# ---------------------------------------------------------------------------
# Tool 3: validate_sql
# ---------------------------------------------------------------------------

def validate_sql(sql: str, role: str, catalog: CatalogLoader) -> dict:
    """Safety-check generated SQL before execution.

    Input:  SQL string + user role
    Output: { "valid": True/False, "reason": "...", "sql": "..." }

    TODO: Implement. Checks to perform:
      1. Verify it's a SELECT statement (block DROP, DELETE, UPDATE, INSERT,
         ALTER, TRUNCATE, CREATE)
      2. Verify referenced tables exist in the catalog
      3. Check for a LIMIT clause — inject "LIMIT 50" if missing
      4. If role is "analyst":
         - Get PII columns for each referenced table
         - Check if any PII columns are in the SELECT clause
         - If so, either mask them or reject the query
         - Use filter_pii_from_sql() from auth/roles.py
      5. Return the (possibly modified) SQL in the result

    You can use the `sqlparse` library for parsing, or start with simple
    string matching (e.g., sql.strip().upper().startswith("SELECT")).
    """
    # TODO: Implement SQL validation checks
    pass


# ---------------------------------------------------------------------------
# Tool 4: execute_sql
# ---------------------------------------------------------------------------

def execute_sql(sql: str, db_connection) -> dict:
    """Execute validated SQL against PostgreSQL and return results.

    Input:  Validated SQL string + database connection
    Output: { "rows": [...], "row_count": int, "columns": [...] }

    TODO: Implement. Steps:
      1. Create a cursor from db_connection
      2. Set a statement timeout (e.g., SET statement_timeout = '10s')
      3. Execute the SQL
      4. Fetch all rows
      5. Get column names from cursor.description
      6. Convert to a list of dicts: [{"col1": val1, "col2": val2}, ...]
      7. Return { "rows": [...], "row_count": len(rows), "columns": [...] }
      8. Handle errors gracefully — catch psycopg2 errors and return
         { "rows": [], "row_count": 0, "error": "..." }

    Important:
      - Use a timeout to prevent runaway queries
      - Don't forget to handle the case where sql is empty or None
      - Connection pooling: reuse the connection, don't reconnect per query
    """
    # TODO: Execute query and return results
    pass


# ---------------------------------------------------------------------------
# Tool 5: synthesize_answer
# ---------------------------------------------------------------------------

def synthesize_answer(question: str, sql: str, results: dict) -> str:
    """Convert raw query results into a natural language answer.

    Input:  Original question + SQL used + query results dict
    Output: A concise natural language answer

    TODO: Implement. Steps:
      1. Build a prompt using ANSWER_SYNTHESIS_PROMPT from prompts.py
      2. Inject {question}, {sql}, {results} into the prompt
      3. Call the LLM
      4. Return the response text

    The prompt should instruct the LLM to:
      - Answer the question directly and concisely
      - Cite which tables/columns the data came from
      - Format numbers nicely (commas, percentages)
      - Say "no results found" if the query returned 0 rows
      - NOT just dump the raw data — summarize it
    """
    # TODO: Build prompt, call LLM, return natural language answer
    pass
