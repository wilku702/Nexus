"""Evaluation Metrics — scoring functions for benchmarking the agent.

Four dimensions of quality:
  1. SQL Correctness  — does the SQL execute without errors?
  2. SQL Accuracy     — does it reference the right tables/keywords?
  3. Answer Accuracy  — does the answer contain the expected values?
  4. Governance       — was PII properly handled for the user role?
"""


def score_sql_correctness(generated_sql: str, db_connection) -> bool:
    """Does the generated SQL execute without errors?

    TODO: Implement. Steps:
      1. If generated_sql is empty or None, return False
      2. Wrap the SQL in a safety net:
           - Add LIMIT 1 if no LIMIT exists (to avoid huge result sets)
           - Use a savepoint so a failed query doesn't break the connection
      3. Try executing the SQL
      4. Return True if it runs successfully, False if it throws an error
      5. Always rollback to the savepoint after (don't leave open transactions)

    Example:
      cursor.execute("SAVEPOINT test_sql")
      try:
          cursor.execute(generated_sql)
          cursor.execute("RELEASE SAVEPOINT test_sql")
          return True
      except Exception:
          cursor.execute("ROLLBACK TO SAVEPOINT test_sql")
          return False

    Args:
        generated_sql: The SQL query to test
        db_connection: psycopg2 connection

    Returns:
        True if SQL executes without error
    """
    # TODO: Try executing SQL and return success/failure
    pass


def score_sql_accuracy(generated_sql: str, expected_contains: list[str]) -> float:
    """What fraction of expected keywords appear in the generated SQL?

    TODO: Implement. Steps:
      1. If expected_contains is empty, return 1.0 (nothing to check)
      2. Convert generated_sql to uppercase for case-insensitive matching
      3. For each keyword in expected_contains:
         - Check if it appears in the SQL (case-insensitive)
         - Count matches
      4. Return: matched_count / len(expected_contains)

    Example:
      SQL: 'SELECT COUNT(*) FROM "Customer" WHERE "Country" = \'Brazil\''
      expected: ["Customer", "COUNT", "Country", "Brazil"]
      Result: 4/4 = 1.0

    Args:
        generated_sql: The SQL query to evaluate
        expected_contains: Keywords that should appear in the SQL

    Returns:
        Float between 0.0 and 1.0
    """
    # TODO: Count keyword matches and return ratio
    pass


def score_answer_accuracy(answer: str, expected_contains: list[str]) -> float:
    """What fraction of expected values appear in the answer text?

    TODO: Implement. Same approach as score_sql_accuracy but applied
    to the natural language answer.

    Special case: If expected_contains is empty, return 1.0
    (some test cases only check SQL, not the answer).

    Args:
        answer: The agent's natural language response
        expected_contains: Values that should appear in the answer

    Returns:
        Float between 0.0 and 1.0
    """
    # TODO: Count value matches and return ratio
    pass


def check_governance_compliance(
    generated_sql: str,
    role: str,
    involves_pii: bool,
    was_masked: bool,
) -> bool:
    """Was PII properly handled for the given role?

    TODO: Implement. Logic:
      - If involves_pii is False → always return True (no PII concern)
      - If involves_pii is True and role is "admin" → return True (admins see all)
      - If involves_pii is True and role is "analyst":
          → return True only if was_masked is True
          → return False if PII was exposed to an analyst

    This is the governance gate — it ensures that analyst-role queries
    never leak raw PII values.

    Args:
        generated_sql: The SQL that was executed
        role: "analyst" or "admin"
        involves_pii: Whether the test case involves PII data
        was_masked: Whether PII was masked in the response

    Returns:
        True if governance rules were followed
    """
    # TODO: Implement governance compliance check
    pass
