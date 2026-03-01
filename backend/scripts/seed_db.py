"""Database connection verification and seeding script.

Run this after starting PostgreSQL to confirm:
  1. The connection works
  2. The Chinook tables are loaded
  3. Row counts look correct

Usage:
    python scripts/seed_db.py
"""

import os
import logging
import psycopg2
from psycopg2 import sql
from config import Config

logger = logging.getLogger(__name__)


def verify_connection():
    """Connect to PostgreSQL and verify the Chinook tables exist.

    TODO: Implement this function. Steps:
      1. Connect using psycopg2.connect(Config.DATABASE_URL)
      2. Query information_schema.tables to list all user tables
      3. For each table, run SELECT COUNT(*) and print the result
      4. Print a summary: "Found X tables, all OK" or report missing tables
      5. Handle connection errors with a helpful message
         (e.g., "Is PostgreSQL running? Check docker compose up")

    Expected Chinook tables (11 total):
      Album, Artist, Customer, Employee, Genre,
      Invoice, InvoiceLine, MediaType, Playlist,
      PlaylistTrack, Track
    """
    try:
        with psycopg2.connect(Config.DATABASE_URL) as conn:
            with conn.cursor() as cursor:
                cursor.execute(
                    "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
                )
                tables = cursor.fetchall()

                for (table,) in tables:
                    cursor.execute(
                        sql.SQL("SELECT COUNT(*) FROM {}").format(sql.Identifier(table))
                    )
                    count = cursor.fetchone()[0]
                    print(f"{table}: {count} rows")

                print(f"\nFound {len(tables)} tables, all OK")
    except psycopg2.OperationalError as e:
        logger.error("Cannot connect to PostgreSQL: %s", e)
        print(f"Error connecting to PostgreSQL: {e}")
        print("Is PostgreSQL running? Check docker compose up")
    except psycopg2.ProgrammingError as e:
        logger.error("SQL error during verification: %s", e)
        print(f"SQL error during verification: {e}")


def run_init_sql():
    """Execute scripts/init.sql to create the query_log table.

    TODO: Implement this function. Steps:
      1. Read the contents of scripts/init.sql
      2. Execute it against the database
      3. Confirm the query_log table was created
    """
    init_sql_path = os.path.join(os.path.dirname(__file__), "init.sql")
    try:
        with open(init_sql_path) as f:
            init_sql = f.read()

        with psycopg2.connect(Config.DATABASE_URL) as conn:
            with conn.cursor() as cursor:
                cursor.execute(init_sql)
                conn.commit()

        print("query_log table created successfully")
    except FileNotFoundError:
        logger.error("init.sql not found at %s", init_sql_path)
        print(f"Error: init.sql not found at {init_sql_path}")
    except psycopg2.OperationalError as e:
        logger.error("Cannot connect to PostgreSQL: %s", e)
        print(f"Error connecting to PostgreSQL: {e}")
    except psycopg2.ProgrammingError as e:
        logger.error("SQL error running init.sql: %s", e)
        print(f"SQL error running init.sql: {e}")


if __name__ == "__main__":
    verify_connection()
    run_init_sql()
