"""Role-Based Access Control — defines user roles and PII filtering.

Two roles:
  - analyst: Can query data but cannot see PII columns (emails, phones, etc.)
  - admin:   Full access to all data including PII

The key function is filter_pii_from_sql() which modifies SQL to mask PII
columns when an analyst makes a query.
"""

from enum import Enum
import sqlparse
from sqlparse.sql import IdentifierList, Identifier
from sqlparse import tokens as T

class UserRole(Enum):
    """User roles for access control."""
    ANALYST = "analyst"
    ADMIN = "admin"


def get_role_permissions(role: UserRole) -> dict:
    """Return the permissions for a given role.

    TODO: Implement. Return a dict like:
      {
          "can_view_pii": True/False,
          "can_view_sensitive": True/False,
          "max_rows": 50 or 1000,
      }

    Suggested permissions:
      ANALYST → can_view_pii: False, can_view_sensitive: True,  max_rows: 50
      ADMIN   → can_view_pii: True,  can_view_sensitive: True,  max_rows: 1000

    Args:
        role: UserRole enum value

    Returns:
        Dict of permission flags
    """
    # TODO: Return permissions based on role
    pass


def filter_pii_from_sql(sql: str, pii_columns: list[str], role: UserRole) -> str:
    """If role is ANALYST, modify SQL to mask PII columns in the SELECT clause.

    This is one of the trickier functions to implement well.

    TODO: Implement. Recommended approach (start simple):
      1. If role is ADMIN, return sql unchanged
      2. If role is ANALYST:
         a. Parse the SELECT clause to find column references
         b. For each PII column found in the SELECT:
            Replace: "Email"  →  '***' AS "Email"
         c. Return the modified SQL

    Edge cases to consider:
      - SELECT * → You'll need to expand it to explicit columns first,
        then mask the PII ones. This requires knowing the table's full
        column list from the catalog.
      - PII columns in WHERE clause → Probably allow filtering BY them
        (e.g., WHERE "Country" = 'Brazil') but don't show them in results
      - PII columns in JOIN conditions → Allow the JOIN, mask in SELECT
      - Subqueries → For v1, you can skip this. Handle simple SELECTs first.

    Masking strategies (pick one):
      - Replace with '***' AS "ColumnName"  (recommended — simple & clear)
      - Remove PII columns from SELECT entirely
      - Hash values: MD5("Email") AS "Email"

    Args:
        sql: The SQL query to filter
        pii_columns: List of PII column names (e.g., ["Email", "Phone"])
        role: The user's role

    Returns:
        The SQL string, possibly modified to mask PII
    """
    # TODO: Implement PII masking for analyst role
    # pass
    
    if role == UserRole.ADMIN:
      return sql
    elif role == UserRole.ANALYST:
      modified_sql = sql[:]
      statements = sqlparse.parse(sql)

      # check if referenced table exist in the catalog
      for statement in statements:
        for i, token in enumerate(statement.tokens):
          val = token.value.upper()
          if token.ttype is T.Keyword:
            if val == 'FROM':
              break
          if isinstance(token, IdentifierList):
            for identifier in token.get_identifiers():
              name = identifier.get_name()
              if name in pii_columns:
                  modified_sql = modified_sql.replace(name, f"'***' AS {name}", 1)
          elif isinstance(token, Identifier):
              name = token.get_name()
              if name in pii_columns:
                  modified_sql = modified_sql.replace(name, f"'***' AS {name}", 1)
                
      
      return modified_sql