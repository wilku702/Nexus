"""Prompt Templates — the instructions that guide the LLM's behavior.

Good prompts are the difference between a demo that works 30% of the time
and one that works 90% of the time. Spend real time on these.

Each template uses Python f-string or .format() placeholders.
"""

# ---------------------------------------------------------------------------
# System Prompt — sets the agent's overall behavior
# ---------------------------------------------------------------------------

SYSTEM_PROMPT = """
TODO: Write your system prompt here. This is the most important prompt —
it defines the agent's personality and boundaries.

It should:
  1. Explain the agent's role
     → "You are a data analyst assistant for the Chinook music database..."
  2. Describe what tools are available
     → "You can look up schema info, generate SQL, validate it, execute it,
        and synthesize answers."
  3. Set behavioral guidelines
     → "Be concise. Cite your sources. If you're unsure, say so."
  4. Include governance rules
     → "Respect user roles. Never expose PII to analyst-role users."
  5. Set safety boundaries
     → "Only generate SELECT queries. Never modify data."
  6. Specify the database
     → "You are querying a PostgreSQL database with the Chinook dataset."

Tips for good system prompts:
  - Be specific, not vague ("use PostgreSQL syntax" not "use proper SQL")
  - Include examples of good vs bad behavior
  - Mention the LIMIT clause requirement
  - Mention PascalCase column names need double-quoting in PostgreSQL
"""

# ---------------------------------------------------------------------------
# SQL Generation Prompt — turns a question into SQL
# ---------------------------------------------------------------------------

SQL_GENERATION_PROMPT = """
TODO: Write the prompt template for SQL generation.

Available placeholders (use curly braces):
  {{schema_context}} — metadata about tables and columns (from get_schema_info)
  {{question}}       — the user's natural language question
  {{role}}           — "analyst" or "admin"

The prompt should instruct the LLM to:
  1. Read the provided schema context carefully
  2. Only use tables and columns that exist in the context
  3. Write PostgreSQL-compatible SQL
  4. Double-quote PascalCase identifiers (e.g., "CustomerId", "FirstName")
  5. Always include a LIMIT clause (default LIMIT 50)
  6. If role is "analyst", avoid selecting PII columns
  7. If the question can't be answered with the available data, say so
  8. Return ONLY the SQL query, no explanation

Example format:
  "Given the following database schema:
   {{schema_context}}

   Write a PostgreSQL query to answer: {{question}}
   User role: {{role}}
   ..."
"""

# ---------------------------------------------------------------------------
# Answer Synthesis Prompt — turns query results into English
# ---------------------------------------------------------------------------

ANSWER_SYNTHESIS_PROMPT = """
TODO: Write the prompt template for answer synthesis.

Available placeholders:
  {{question}} — the original user question
  {{sql}}      — the SQL query that was executed
  {{results}}  — the query results (as a formatted string or JSON)

The prompt should instruct the LLM to:
  1. Answer the user's question directly
  2. Be concise — 1-3 sentences for simple questions
  3. Cite which tables the data came from
  4. Format numbers with commas (e.g., "2,240 tracks")
  5. If there are no results, say "No matching data was found"
  6. Do NOT just dump the raw result rows
  7. Summarize large result sets (e.g., "The top 5 artists are...")
"""
