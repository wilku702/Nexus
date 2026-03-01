# Code Review Corrections — Lessons 1-6

## Summary

| Severity | Count |
|----------|-------|
| High     | 1     |
| Medium   | 6     |
| Low      | 11    |
| Trivial  | 2     |
| Info     | 4     |

---

## High Severity

### 1. `execute_sql` missing `db_connection.rollback()` on error

**File:** `agent/tools.py` ~line 195
**Category:** Critical Logic Bug

After a failed SQL query, psycopg2 leaves the connection in a failed transaction state. Without calling `rollback()`, **all subsequent queries** on that connection will fail with `InFailedSqlTransaction`. One bad query breaks the agent until restart.

**Fix:**
```python
except Exception as e:
    db_connection.rollback()
    return {"success": False, "error": f"Error executing SQL query: {str(e)}", ...}
```

---

## Medium Severity

### 2. `seed_db.py` row count prints as tuple

**File:** `scripts/seed_db.py` line 43
**Category:** Logic Bug

`cursor.fetchall()[0]` returns `(59,)` not `59`, so output reads `Customer: (59,) rows` instead of `Customer: 59 rows`.

**Fix:** Use `cursor.fetchone()[0]` to extract the integer.

---

### 3. Health endpoint LLM check is fake

**File:** `app.py` lines 143-146
**Category:** Incomplete Implementation

The LLM status is hard-coded to `"connected"` without actually testing the LLM. The health endpoint will always report healthy even if the API key is invalid.

**Fix:** Make a real test call (e.g. a trivial completion) and catch exceptions.

---

### 4. `hire_date` listed as PII in SYSTEM_PROMPT but not in metadata.yaml

**File:** `agent/prompts.py` line 30
**Category:** Data Consistency

The prompt lists `hire_date` as PII, but `metadata.yaml` marks it as `is_pii: false` / `governance_tag: "public"`. LESSONS.md only lists `birth_date` as Employee PII.

**Fix:** Remove `hire_date` from the PII list in `SYSTEM_PROMPT`.

---

### 5. `validate_sql` only validates the first table after FROM

**File:** `agent/tools.py` ~line 138
**Category:** Logic Bug

JOINed tables are never validated against the catalog, and PII columns from joined tables are not checked.

**Fix:** Parse all table references (FROM, JOIN, LEFT JOIN, etc.) and validate each.

---

### 6. `validate_sql` fails with table aliases

**File:** `agent/tools.py` ~line 138
**Category:** Logic Bug

When sqlparse returns compound tokens like `customer c`, the check looks for `"customer c"` instead of `"customer"`, rejecting valid queries.

**Fix:** Extract only the base table name, stripping aliases.

---

### 7. `get_role_permissions()` is unimplemented

**File:** `auth/roles.py` line 43
**Category:** Missing Implementation

Function body is `pass`, returning `None`. Any caller will get `None` instead of a permissions dict.

**Fix:**
```python
if role == UserRole.ANALYST:
    return {"can_view_pii": False, "can_view_sensitive": True, "max_rows": 50}
elif role == UserRole.ADMIN:
    return {"can_view_pii": True, "can_view_sensitive": True, "max_rows": 1000}
```

---

## Low Severity

### 8. SQL injection pattern in `seed_db.py`

**File:** `scripts/seed_db.py` line 42
**Category:** Security

`f"SELECT COUNT(*) from {table}"` interpolates table names directly. Low risk since names come from `information_schema`, but still bad practice.

**Fix:** Use `psycopg2.sql.Identifier` or at minimum quote the table name.

---

### 9. Hard-coded relative file path in `run_init_sql()`

**File:** `scripts/seed_db.py` line 66
**Category:** Portability

`open("scripts/init.sql")` breaks if run from any directory other than `backend/`.

**Fix:** `os.path.join(os.path.dirname(__file__), "init.sql")`

---

### 10. File handle not closed in `run_init_sql()`

**File:** `scripts/seed_db.py` line 66
**Category:** Resource Leak

`open(...)` without a context manager; handle is never explicitly closed.

**Fix:** `with open(...) as f: sql = f.read()`

---

### 11. Generic exception handling in `seed_db.py`

**File:** `scripts/seed_db.py` lines 48-49
**Category:** Code Quality

Catches bare `Exception`, making debugging harder.

**Fix:** Use `psycopg2.OperationalError`, `psycopg2.ProgrammingError`, etc.

---

### 12. Missing context managers for DB connections in `seed_db.py`

**File:** `scripts/seed_db.py` lines 35-47
**Category:** Resource Leak

Connection and cursor opened/closed manually. An exception between open and close leaks the connection.

**Fix:** Use `with` for both connection and cursor.

---

### 13. Obsolete `version` attribute in docker-compose.yml

**File:** `docker-compose.yml` line 27
**Category:** Deprecation

`version: "3.9"` is obsolete in modern Docker Compose and produces a warning.

**Fix:** Remove the `version: "3.9"` line.

---

### 14. File not opened with context manager in CatalogLoader

**File:** `catalog/loader.py` line 32
**Category:** Resource Leak

`content = open(catalog_path).read()` relies on garbage collection to close the handle.

**Fix:** `with open(catalog_path) as f: content = f.read()`

---

### 15. `app.py` calls stub `create_agent()` at import time

**File:** `app.py` lines 48-49
**Category:** Import Safety

`create_agent()` body is `pass`, so `agent` is `None` at module level. Won't crash on startup but fails on first chat request.

**Fix:** Guard the call or defer until agent.py is implemented (Lesson 7+).

---

### 16. SYSTEM_PROMPT PII list missing Invoice billing columns

**File:** `agent/prompts.py` line 30
**Category:** Data Consistency

`metadata.yaml` marks `billing_address`, `billing_city`, `billing_state`, `billing_postal_code` as PII, but the prompt omits them. The `filter_pii_from_sql()` function (catalog-based) will still catch them, but the prompt-level guardrail has a gap.

**Fix:** Either add these to the prompt PII list, or remove PII markings from Invoice billing columns in metadata.yaml (LESSONS.md says only Customer and Employee have PII).

---

### 17. Module-level LLM instantiation in `tools.py`

**File:** `agent/tools.py` line 22
**Category:** Design

`ChatAnthropic(...)` runs at import time. If the API key is missing, the import fails.

**Fix:** Lazy-initialize the LLM client or validate the key first.

---

### 18. `filter_pii_from_sql()` limited for complex SQL

**File:** `auth/roles.py` lines 46-108
**Category:** Logic Limitation

Does not handle `SELECT *` expansion, substring false matches, subqueries, or CTEs.

**Fix:** Expand `SELECT *` to explicit columns; use word-boundary matching or AST-based replacement.

---

## Trivial

### 19. Inconsistent SQL keyword casing

**File:** `scripts/seed_db.py` line 42
**Category:** Style

`"SELECT COUNT(*) from {table}"` — `from` should be `FROM`.

---

### 20. Misleading error message in `execute_sql`

**File:** `agent/tools.py` line 196
**Category:** Wording

Says `"Error executing script"` instead of `"Error executing SQL query"`.

---

## Informational

### 21. `get_context_for_question()` ignores the question parameter

**File:** `catalog/loader.py`

Always returns metadata for all tables regardless of the question. A future enhancement could filter to relevant tables only.

---

### 22. LESSONS.md vs actual naming convention mismatch

LESSONS.md describes PascalCase (`"Customer"`) but the actual Chinook SQL file and implementation use snake_case. Not a code bug — the implementation is internally consistent.

---

### 23. No logging module used anywhere

All error reporting uses `print()` or returned dicts. Using `logging.getLogger(__name__)` would improve production debuggability.

---

### 24. Hard-coded values in `tools.py`

Statement timeout (`'10s'`) and default LIMIT (`50`) are hard-coded. Moving them to `Config` would improve configurability.
