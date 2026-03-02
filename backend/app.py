"""Flask API — all route definitions for the Nexus backend.

Endpoints:
  POST /api/chat                → Send a question to the agent
  GET  /api/catalog/tables      → List all table metadata
  GET  /api/catalog/tables/:name → Get detailed metadata for one table
  GET  /api/health              → Health check (DB + LLM status)
  GET  /api/audit               → Recent query audit logs
  POST /api/evaluate            → Trigger the evaluation suite
  GET  /api/evaluate/results    → Get the latest evaluation results

Run with:
  python app.py                 → starts on http://localhost:5000
"""

import logging
import threading
from flask import Flask, request, jsonify
from flask_cors import CORS
from config import Config
from langchain_anthropic import ChatAnthropic

logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# ---------------------------------------------------------------------------
# Initialization
# ---------------------------------------------------------------------------
# TODO: Initialize these at app startup:
#
#   1. Database connection:
#        import psycopg2
#        db = psycopg2.connect(Config.DATABASE_URL)
#
#   2. Catalog loader:
#        from catalog.loader import CatalogLoader
#        catalog = CatalogLoader(Config.CATALOG_PATH)
#
#   3. Agent:
#        from agent.agent import create_langchain_agent
#        agent = create_langchain_agent(catalog, db)
#
# Store these as module-level variables so route handlers can use them.
# ---------------------------------------------------------------------------
import psycopg2
from catalog.loader import CatalogLoader
from agent.agent import handle_chat
from audit.logger import get_recent_logs
from eval.evaluate import load_test_cases, run_evaluation

db = psycopg2.connect(Config.DATABASE_URL)
catalog = CatalogLoader(Config.CATALOG_PATH)

agent = None
tool_context = None
try:
    from agent.agent import create_langchain_agent
    agent, tool_context = create_langchain_agent(catalog, db)
    if agent is None:
        logger.warning("create_langchain_agent() returned None — agent not yet implemented")
except Exception as e:
    logger.warning("Failed to initialize agent: %s", e)

chat_lock = threading.Lock()
_latest_eval_report = None

# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.route("/api/chat", methods=["POST"])
def chat():
    """Main chat endpoint — send a question, get an AI-generated answer.

    TODO: Implement. Steps:
      1. Parse request JSON: { "question": str, "role": "analyst" | "admin" }
      2. Validate that "question" is present and non-empty
      3. Validate that "role" is "analyst" or "admin" (default to "analyst")
      4. Call handle_chat(agent, question, role) from agent/agent.py
      5. Return the response as JSON (matches ChatResponse type)
      6. Handle errors → return { "error": "..." } with status 500

    Request:  { "question": "How many customers?", "role": "analyst" }
    Response: { "answer": "...", "sql": "...", "tables_used": [...], "latency_ms": 1234 }
    """
    # # TODO: Implement chat endpoint
    # pass
    try:
      data = request.get_json()
      question = data.get('question','')
      role = data.get('role','')
      
      if not question or not role:
        return jsonify({ "error": "Empty role or question" }), 500

      with chat_lock:
          response = handle_chat(agent, tool_context, question, role, db)
      return jsonify(response), 200
    except Exception as e:
      return jsonify({ "error": f"Error loading agent: {e}" }), 500



@app.route("/api/catalog/tables", methods=["GET"])
def get_tables():
    """Return summary metadata for all tables.

    TODO: Implement. Steps:
      1. Call catalog.get_all_tables()
      2. Return as JSON list with status 200

    Response: [{ "table_name": "...", "description": "...", "owner": "...",
                 "governance_level": "...", "column_count": 13 }, ...]
    """
    # # TODO: Implement catalog tables list
    # pass
    table_metadata = catalog.get_all_tables()
    return jsonify(table_metadata), 200


@app.route("/api/catalog/tables/<name>", methods=["GET"])
def get_table(name):
    """Return detailed metadata for a specific table, including all columns.

    TODO: Implement. Steps:
      1. Call catalog.get_table(name)
      2. If None, return { "error": "Table not found" } with status 404
      3. Return the table dict as JSON

    Response: { "table_name": "...", ..., "columns": [{ "column_name": "...", ... }, ...] }
    """
    # TODO: Implement single table detail
    # pass
    table_metadata = catalog.get_table(name)
    status = 200
    if not table_metadata:
      table_metadata = { "error": "Table not found" }
      status = 404

    return jsonify(table_metadata), status


@app.route("/api/health", methods=["GET"])
def health():
    """Health check — reports status of database and LLM connections.

    TODO: Implement. Steps:
      1. Check database: try running "SELECT 1" on the db connection
      2. Check LLM: optionally send a tiny test prompt (or just check if
         the API key is configured)
      3. Determine overall status:
         - "healthy"  → both DB and LLM are connected
         - "degraded" → one is down
         - "down"     → both are down
      4. Return the health response

    Response: { "status": "healthy", "database": "connected", "llm": "connected" }
    """
    status = ["", ""]
    # testing database
    try:
      db.cursor().execute("SELECT 1")
      status[0] = "connected"
    except Exception as e:
      logger.warning("Database health check failed: %s", e)
      status[0] = "disconnected"

    # testing llm
    try:
      llm = ChatAnthropic(model_name=Config.LLM_MODEL, api_key=Config.LLM_API_KEY)
      llm.invoke("Say hello")
      status[1] = "connected"
    except Exception as e:
      logger.warning("LLM health check failed: %s", e)
      status[1] = "disconnected"

    overall = ""
    count = status.count("connected")
    if count == 2:
      overall = "healthy"
    elif count == 1:
      overall = "degraded"
    else:
      overall = "down"

    return jsonify( { "status": overall, "database": status[0], "llm": status[1] } )



@app.route("/api/audit", methods=["GET"])
def get_audit_logs():
    """Return recent query audit log entries.

    TODO: Implement. Steps:
      1. Call get_recent_logs(db, limit=50) from audit/logger.py
      2. Return as JSON list

    Response: [{ "id": "...", "timestamp": "...", "user_role": "...", ... }, ...]
    """
    # TODO: Implement audit log retrieval
    # pass
    
    return jsonify(get_recent_logs(db, limit=50))
    


@app.route("/api/evaluate", methods=["POST"])
def run_eval():
    """Trigger the full evaluation suite."""
    global _latest_eval_report
    try:
        test_cases = load_test_cases("eval/test_cases.json")
        with chat_lock:
            report = run_evaluation(agent, tool_context, test_cases, db)
        _latest_eval_report = report
        return jsonify(report)
    except Exception as e:
        return jsonify({"error": f"Evaluation failed: {e}"}), 500


@app.route("/api/evaluate/results", methods=["GET"])
def get_eval_results():
    """Return the most recent evaluation run results."""
    if _latest_eval_report is None:
        return jsonify({"error": "No evaluation results"}), 404
    return jsonify(_latest_eval_report)


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    app.run(debug=True, port=5000)
