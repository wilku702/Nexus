"""Evaluation Runner — loads test cases, runs them through the agent, scores results.

This powers the POST /api/evaluate and GET /api/evaluate/results endpoints.
The frontend Evaluation Dashboard displays the results.
"""

import json
import time
import uuid
from datetime import datetime, timezone

from agent.agent import handle_chat
from eval.metrics import (
    score_sql_correctness,
    score_sql_accuracy,
    score_answer_accuracy,
    check_governance_compliance,
)


def load_test_cases(path: str) -> list[dict]:
    """Load test cases from a JSON file.

    Args:
        path: File path to test_cases.json

    Returns:
        List of test case dicts
    """
    with open(path, "r") as f:
        return json.load(f)


def run_evaluation(agent, tool_context, test_cases: list[dict], db_connection) -> dict:
    """Run the full evaluation suite and return a report.

    Args:
        agent: The LangChain AgentExecutor from create_langchain_agent()
        tool_context: Shared dict populated by tool closures during agent.invoke()
        test_cases: List of test case dicts from load_test_cases()
        db_connection: psycopg2 connection for SQL correctness checking

    Returns:
        Dict matching the EvalReport API contract
    """
    run_id = f"eval-{uuid.uuid4().hex[:8]}"
    timestamp = datetime.now(timezone.utc).isoformat()
    results = []

    for tc in test_cases:
        role = tc.get("governance_test", {}).get("role", "admin")
        question = tc["question"]

        start = time.time()
        response = handle_chat(agent, tool_context, question, role, db_connection)
        latency_ms = int((time.time() - start) * 1000)

        sql = response.get("sql", "")
        answer = response.get("answer", "")

        sql_correct = score_sql_correctness(sql, db_connection)
        sql_accuracy = score_sql_accuracy(sql, tc["expected_sql_contains"])
        answer_accuracy = score_answer_accuracy(answer, tc["expected_answer_contains"])

        involves_pii = tc.get("involves_pii", False)
        was_masked = "***" in answer if involves_pii else False
        governance_compliant = check_governance_compliance(sql, role, involves_pii, was_masked)

        passed = (
            sql_correct
            and sql_accuracy >= 0.8
            and answer_accuracy >= 0.5
            and governance_compliant
        )

        results.append({
            "question": question,
            "difficulty": tc["difficulty"],
            "sql": sql,
            "answer": answer,
            "scores": {
                "sql_correctness": sql_correct,
                "sql_accuracy": round(sql_accuracy, 2),
                "answer_accuracy": round(answer_accuracy, 2),
                "governance_compliant": governance_compliant,
            },
            "passed": passed,
            "latency_ms": latency_ms,
        })

    total = len(results)
    passed_count = sum(1 for r in results if r["passed"])
    governance_tests = [r for r in results if any(
        tc.get("involves_pii") for tc in test_cases if tc["question"] == r["question"]
    )]
    governance_passed = sum(1 for r in governance_tests if r["scores"]["governance_compliant"])
    latencies = [r["latency_ms"] for r in results]

    by_difficulty = {}
    for level in ("easy", "medium", "hard"):
        level_results = [r for r in results if r["difficulty"] == level]
        level_total = len(level_results)
        level_passed = sum(1 for r in level_results if r["passed"])
        by_difficulty[level] = {
            "total": level_total,
            "passed": level_passed,
            "pass_rate": round(level_passed / level_total, 2) if level_total else 0,
        }

    return {
        "run_id": run_id,
        "timestamp": timestamp,
        "summary": {
            "total_tests": total,
            "passed": passed_count,
            "failed": total - passed_count,
            "pass_rate": round(passed_count / total, 2) if total else 0,
            "avg_latency_ms": round(sum(latencies) / len(latencies)) if latencies else 0,
            "governance_compliance_rate": round(
                governance_passed / len(governance_tests), 2
            ) if governance_tests else 1.0,
        },
        "by_difficulty": by_difficulty,
        "test_cases": results,
    }
