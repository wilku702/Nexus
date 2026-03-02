"""Evaluation Metrics — scoring functions for benchmarking the agent.

Four dimensions of quality:
  1. SQL Correctness  — does the SQL execute without errors?
  2. SQL Accuracy     — does it reference the right tables/keywords?
  3. Answer Accuracy  — does the answer contain the expected values?
  4. Governance       — was PII properly handled for the user role?
"""

import re


def score_sql_correctness(generated_sql: str, db_connection) -> bool:
    """Does the generated SQL execute without errors?

    Args:
        generated_sql: The SQL query to test
        db_connection: psycopg2 connection

    Returns:
        True if SQL executes without error
    """
    if not generated_sql:
        return False

    sql = generated_sql.strip()
    if not re.search(r'\bLIMIT\b', sql, re.IGNORECASE):
        sql = sql.rstrip(';') + ' LIMIT 1'

    cursor = db_connection.cursor()
    cursor.execute("SAVEPOINT test_sql")
    try:
        cursor.execute(sql)
        cursor.execute("RELEASE SAVEPOINT test_sql")
        return True
    except Exception:
        cursor.execute("ROLLBACK TO SAVEPOINT test_sql")
        return False


def score_sql_accuracy(generated_sql: str, expected_contains: list[str]) -> float:
    """What fraction of expected keywords appear in the generated SQL?

    Args:
        generated_sql: The SQL query to evaluate
        expected_contains: Keywords that should appear in the SQL

    Returns:
        Float between 0.0 and 1.0
    """
    if not expected_contains:
        return 1.0

    sql_upper = (generated_sql or "").upper()
    matched = sum(1 for kw in expected_contains if kw.upper() in sql_upper)
    return matched / len(expected_contains)


def score_answer_accuracy(answer: str, expected_contains: list[str]) -> float:
    """What fraction of expected values appear in the answer text?

    Args:
        answer: The agent's natural language response
        expected_contains: Values that should appear in the answer

    Returns:
        Float between 0.0 and 1.0
    """
    if not expected_contains:
        return 1.0

    answer_upper = (answer or "").upper()
    matched = sum(1 for val in expected_contains if val.upper() in answer_upper)
    return matched / len(expected_contains)


def check_governance_compliance(
    generated_sql: str,
    role: str,
    involves_pii: bool,
    was_masked: bool,
) -> bool:
    """Was PII properly handled for the given role?

    Args:
        generated_sql: The SQL that was executed
        role: "analyst" or "admin"
        involves_pii: Whether the test case involves PII data
        was_masked: Whether PII was masked in the response

    Returns:
        True if governance rules were followed
    """
    if not involves_pii:
        return True
    if role == "admin":
        return True
    if role == "analyst":
        return was_masked
    return True
