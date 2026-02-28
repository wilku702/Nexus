"""Evaluation Runner — loads test cases, runs them through the agent, scores results.

This powers the POST /api/evaluate and GET /api/evaluate/results endpoints.
The frontend Evaluation Dashboard displays the results.
"""

import json
import time
import uuid
from datetime import datetime, timezone


def load_test_cases(path: str) -> list[dict]:
    """Load test cases from a JSON file.

    TODO: Implement. Steps:
      1. Open the JSON file at `path`
      2. Parse with json.load()
      3. Return the list of test case dicts

    Each test case has:
      - question: str
      - expected_sql_contains: list[str]
      - expected_answer_contains: list[str]
      - difficulty: "easy" | "medium" | "hard"
      - involves_pii: bool
      - governance_test: optional dict with "role" and "should_mask_pii"

    Args:
        path: File path to test_cases.json

    Returns:
        List of test case dicts
    """
    # TODO: Load and return test cases from JSON
    pass


def run_evaluation(agent, test_cases: list[dict], db_connection) -> dict:
    """Run the full evaluation suite and return a report.

    This is the main evaluation function. For each test case, it:
      1. Sends the question through the agent
      2. Scores every metric
      3. Determines pass/fail
      4. Aggregates into a summary report

    TODO: Implement. Steps:
      1. Generate a run_id (e.g., f"eval-{{uuid.uuid4().hex[:8]}}")
      2. Record the timestamp
      3. For each test case:
         a. Determine the role (use governance_test.role if present, else "admin")
         b. Call handle_chat(agent, question, role)
         c. Score with:
            - score_sql_correctness(generated_sql, db_connection)
            - score_sql_accuracy(generated_sql, expected_sql_contains)
            - score_answer_accuracy(answer, expected_answer_contains)
            - check_governance_compliance(...)
         d. Measure latency_ms
         e. Determine passed = sql_correct AND sql_accuracy >= 0.8
                                AND answer_accuracy >= 0.5
                                AND governance_compliant
         f. Append to results list

      4. Calculate summary:
         - total_tests, passed, failed, pass_rate
         - avg_latency_ms
         - governance_compliance_rate

      5. Calculate by_difficulty breakdown:
         - For each difficulty level (easy, medium, hard):
           {{ total, passed, pass_rate }}

      6. Return the full report dict matching the EvalReport API contract:
         {{
             "run_id": str,
             "timestamp": str (ISO format),
             "summary": {{ total_tests, passed, failed, pass_rate,
                          avg_latency_ms, governance_compliance_rate }},
             "by_difficulty": {{
                 "easy":   {{ total, passed, pass_rate }},
                 "medium": {{ total, passed, pass_rate }},
                 "hard":   {{ total, passed, pass_rate }}
             }},
             "test_cases": [ ... ]  (list of individual results)
         }}

    Args:
        agent: The LangChain AgentExecutor from create_agent()
        test_cases: List of test case dicts from load_test_cases()
        db_connection: psycopg2 connection for SQL correctness checking

    Returns:
        Dict matching the EvalReport API contract
    """
    # TODO: Run each test case, score metrics, aggregate results
    pass
