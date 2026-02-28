"""Database connection verification and seeding script.

Run this after starting PostgreSQL to confirm:
  1. The connection works
  2. The Chinook tables are loaded
  3. Row counts look correct

Usage:
    python scripts/seed_db.py
"""

import psycopg2
from config import Config


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
    # TODO: Implement connection and verification
    # pass
    try:
      conn = psycopg2.connect(Config.DATABASE_URL)
      cursor = conn.cursor()

      cursor.execute("SELECT table_name from information_schema.tables WHERE table_schema = 'public'")
      tables = cursor.fetchall()

      for (table,) in tables:
        cursor.execute(f"SELECT COUNT(*) from {table}")
        print(f"{table}: {cursor.fetchall()[0]} rows")

      print(f"\nFound {len(tables)} tables, all OK")
      cursor.close()
      conn.close()
    except Exception as e:
      print(f"Error connecting to PostgreSQL: {e}")


def run_init_sql():
    """Execute scripts/init.sql to create the query_log table.

    TODO: Implement this function. Steps:
      1. Read the contents of scripts/init.sql
      2. Execute it against the database
      3. Confirm the query_log table was created
    """
    # TODO: Implement init.sql execution
    # pass
    try:
      conn = psycopg2.connect(Config.DATABASE_URL)
      cursor = conn.cursor()

      sql = open("scripts/init.sql").read()
      cursor.execute(sql)
      conn.commit()

      print("query_log table created successfully")
      cursor.close()
      conn.close()
      
    except Exception as e:
      print(f"Error connecting to PostgreSQL: {e}")


if __name__ == "__main__":
    verify_connection()
    run_init_sql()
