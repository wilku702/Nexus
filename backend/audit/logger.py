"""Audit Logger — records every query for compliance and debugging.

Every question asked through the agent gets logged to the query_log table.
This powers the Audit Log Viewer in the frontend.
"""

from psycopg2.extras import RealDictCursor

def log_query(db_connection, entry: dict) -> None:
    """Insert a query log entry into the query_log table.

    TODO: Implement. Steps:
      1. Create a cursor from db_connection
      2. Execute an INSERT INTO query_log (...) VALUES (%s, %s, ...)
      3. Commit the transaction
      4. Handle errors gracefully (don't let logging failures crash the app)

    The entry dict contains:
      - user_role: str         ("analyst" or "admin")
      - original_question: str (the user's question)
      - generated_sql: str     (the SQL that was generated)
      - was_pii_filtered: bool (True if PII columns were masked)
      - result_row_count: int  (number of rows returned)
      - latency_ms: int        (end-to-end processing time in ms)
      - llm_model_used: str    (e.g., "gpt-4o")

    Args:
        db_connection: psycopg2 connection
        entry: Dict with the fields listed above
    """
    # TODO: INSERT into query_log table
    # pass
    try:
        cursor = db_connection.cursor()
        cursor.execute(
            """INSERT INTO query_log
            (user_role, original_question, generated_sql, was_pii_filtered,
                result_row_count, latency_ms, llm_model_used)
            VALUES (%s, %s, %s, %s, %s, %s, %s)""",
            (entry["user_role"], entry["original_question"], entry["generated_sql"],
             entry["was_pii_filtered"], entry["result_row_count"], entry["latency_ms"],
             entry["llm_model_used"])
        )
        db_connection.commit()
    except Exception as e:
        db_connection.rollback()
        print(f"An error logging: {e}")


def get_recent_logs(db_connection, limit: int = 50) -> list[dict]:
    """Retrieve recent query logs, newest first.

    Used by: GET /api/audit

    TODO: Implement. Steps:
      1. Create a cursor from db_connection
      2. Execute: SELECT * FROM query_log ORDER BY timestamp DESC LIMIT %s
      3. Fetch all rows
      4. Convert to a list of dicts matching the AuditLogEntry API contract:
           {
               "id": str,
               "timestamp": str (ISO format),
               "user_role": str,
               "original_question": str,
               "generated_sql": str,
               "was_pii_filtered": bool,
               "result_row_count": int,
               "latency_ms": int,
               "llm_model_used": str
           }
      5. Return the list

    Note: The frontend expects "id" as a string, so convert the integer
    primary key with str(row["id"]).

    Args:
        db_connection: psycopg2 connection
        limit: Max number of entries to return (default 50)

    Returns:
        List of dicts matching the API contract
    """
    # TODO: Query and return recent audit logs
    # pass
    try:
        cursor = db_connection.cursor()
        cursor.execute(
            """SELECT * FROM query_log ORDER BY timestamp DESC LIMIT %s""",
            (limit,)
        )
        
        columns = [desc[0] for desc in cursor.description]
        rows = cursor.fetchall()
        
        logs = []
        for row in rows:
            raw = dict(zip(columns, row))
            logs.append({
                "id": str(raw["id"]),
                "timestamp": raw["timestamp"].isoformat(),
                "user_role": raw["user_role"],
                "original_question": raw["original_question"],
                "generated_sql": raw["generated_sql"],
                "was_pii_filtered": raw["was_pii_filtered"],
                "result_row_count": raw["result_row_count"],
                "latency_ms": raw["latency_ms"],
                "llm_model_used": raw["llm_model_used"],
            })
        
        return logs
    except Exception as e:
        print(f"Error getting recent logs: {e}")
        return []
