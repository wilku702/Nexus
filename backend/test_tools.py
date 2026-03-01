"""Tests for the non-LLM agent tools: get_schema_info, execute_sql, validate_sql.

Run from backend/:
    pytest test_tools.py -v

Requires Docker PostgreSQL to be running (docker compose up -d).
"""

import os

# Set a dummy LLM key so the module-level ChatAnthropic init doesn't fail on import
os.environ.setdefault("LLM_API_KEY", "sk-test-dummy-key")

import pytest
import psycopg2
from catalog.loader import CatalogLoader
from config import Config
from agent.tools import get_schema_info, execute_sql, validate_sql


@pytest.fixture(scope="module")
def catalog():
    return CatalogLoader(Config.CATALOG_PATH)


@pytest.fixture(scope="module")
def db():
    conn = psycopg2.connect(Config.DATABASE_URL)
    conn.autocommit = True  # prevent stale transaction state after error tests
    yield conn
    conn.close()


# ---------------------------------------------------------------------------
# get_schema_info
# ---------------------------------------------------------------------------

class TestGetSchemaInfo:
    def test_returns_nonempty_string(self, catalog):
        result = get_schema_info("How many customers?", catalog)
        assert isinstance(result, str)
        assert len(result) > 100

    def test_contains_table_names(self, catalog):
        result = get_schema_info("Tell me about albums and customers", catalog)
        assert "customer" in result.lower()
        assert "album" in result.lower()

    def test_contains_column_info(self, catalog):
        result = get_schema_info("Show customer details", catalog)
        assert "customer_id" in result.lower()


# ---------------------------------------------------------------------------
# execute_sql
# ---------------------------------------------------------------------------

class TestExecuteSql:
    def test_count_returns_one_row(self, db):
        result = execute_sql("SELECT COUNT(*) FROM customer", db)
        assert result["row_count"] == 1
        assert "error" not in result

    def test_multiple_rows_returns_columns(self, db):
        result = execute_sql("SELECT customer_id, country FROM customer LIMIT 3", db)
        assert result["row_count"] == 3
        assert "customer_id" in result["columns"]
        assert "country" in result["columns"]

    def test_empty_sql_returns_error(self, db):
        result = execute_sql("", db)
        assert "error" in result
        assert result["row_count"] == 0

    def test_none_sql_returns_error(self, db):
        result = execute_sql(None, db)
        assert "error" in result
        assert result["row_count"] == 0

    def test_invalid_sql_returns_error(self, db):
        result = execute_sql("NOT VALID SQL AT ALL", db)
        assert "error" in result
        assert result["row_count"] == 0


# ---------------------------------------------------------------------------
# validate_sql
# ---------------------------------------------------------------------------

class TestValidateSql:
    def test_drop_rejected(self, catalog):
        result = validate_sql("DROP TABLE customer", "admin", catalog)
        assert result["valid"] is False

    def test_delete_rejected(self, catalog):
        result = validate_sql("DELETE FROM customer", "admin", catalog)
        assert result["valid"] is False

    def test_insert_rejected(self, catalog):
        result = validate_sql("INSERT INTO customer VALUES (1)", "admin", catalog)
        assert result["valid"] is False

    def test_valid_select_accepted(self, catalog):
        result = validate_sql('SELECT customer_id FROM customer LIMIT 10', "admin", catalog)
        assert result["valid"] is True

    def test_adds_limit_when_missing(self, catalog):
        result = validate_sql('SELECT customer_id FROM customer', "admin", catalog)
        assert result["valid"] is True
        assert "LIMIT" in result["sql"].upper()

    def test_keeps_existing_limit(self, catalog):
        result = validate_sql('SELECT customer_id FROM customer LIMIT 10', "admin", catalog)
        assert result["valid"] is True
        assert "LIMIT 10" in result["sql"]
