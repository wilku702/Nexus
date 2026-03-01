"""Catalog Loader — parses metadata.yaml and provides lookup methods.

The CatalogLoader is used by:
  - The Flask API (GET /api/catalog/tables, GET /api/catalog/tables/:name)
  - The agent's get_schema_info tool (to inject metadata into prompts)
  - The auth module (to look up which columns are PII)
"""

import yaml


class CatalogLoader:
    """Loads and provides access to the metadata catalog."""

    def __init__(self, catalog_path: str):
        """Load the YAML catalog file and parse it into memory.

        TODO: Implement. Steps:
          1. Open and read the YAML file at catalog_path
          2. Parse it with yaml.safe_load()
          3. Store the parsed data (self._tables = ...)
          4. Build a lookup dict for fast access by table name
             e.g., self._by_name = { "Customer": {...}, "Album": {...}, ... }

        Raises:
            FileNotFoundError: If catalog_path doesn't exist
            yaml.YAMLError: If the YAML is malformed
        """
        # TODO: Load and parse the YAML file
        # pass
        try:
          content = open(catalog_path).read()
        except FileNotFoundError:
            raise FileNotFoundError(f"Catalog not found: {catalog_path}")

        try:
            data = yaml.safe_load(content)
        except yaml.YAMLError as e:
            raise yaml.YAMLError(f"Malformed YAML: {e}")

        self._tables = data["tables"]
        self._by_name = {}

        for table_dict in self._tables:
            self._by_name[table_dict["table_name"]] = table_dict

    def get_all_tables(self) -> list[dict]:
        """Return summary metadata for all tables.

        Used by: GET /api/catalog/tables

        TODO: Implement. Return a list of dicts, each containing:
          - table_name
          - description
          - owner
          - governance_level
          - column_count  (len of columns list)

        Do NOT include the full columns list here — that's for get_table().
        """
        return [
            {
                "table_name": t["table_name"],
                "description": t["description"],
                "owner": t["owner"],
                "governance_level": t["governance_level"],
                "column_count": len(t.get("columns", [])),
            }
            for t in self._tables
        ]

    def get_table(self, table_name: str) -> dict | None:
        """Return full metadata for a specific table including all columns.

        Used by: GET /api/catalog/tables/:name

        TODO: Implement. Steps:
          1. Look up the table by name (case-insensitive is nice but not required)
          2. Return the full table dict including the columns list
          3. Return None if the table doesn't exist

        The returned dict should match the API contract:
          { table_name, description, owner, governance_level, column_count, columns: [...] }
        """
        table = self._by_name.get(table_name) or self._by_name.get(table_name.lower())
        if table is None:
          return None
        return {
            **table,
            "column_count": len(table.get("columns", [])),
        }

    def get_pii_columns(self, table_name: str) -> list[str]:
        """Return list of PII column names for a given table.

        Used by: auth/roles.py filter_pii_from_sql()

        TODO: Implement. Steps:
          1. Get the table metadata
          2. Filter columns where is_pii == True
          3. Return just the column names as a list of strings
          4. Return empty list if table not found
        """
        table = self.get_table(table_name)
        if table is None:
          return []
        return [
            col["column_name"]
            for col in table.get("columns", [])
            if col.get("is_pii")
        ]

    def get_context_for_question(self, question: str) -> str:
        """Return formatted metadata context to inject into the LLM prompt.

        Used by: agent/tools.py get_schema_info()

        This is the KEY method that grounds the agent in real metadata.
        The better this context, the more accurate the generated SQL.

        TODO: Implement. Steps:
          1. Start simple — return ALL table metadata formatted as a string
          2. Format each table as:
               Table: Customer
               Description: Stores customer account information...
               Columns:
                 - CustomerId (integer): Primary key... [sample: 1, 2, 3]
                 - Email (varchar): Customer email... [PII] [sample: luisg@...]
          3. Later improvement: use keyword matching to return only
             tables relevant to the question (e.g., if question mentions
             "customer", prioritize Customer table)

        Args:
            question: The user's natural language question

        Returns:
            A formatted string of table/column metadata
        """
        lines = []
        for table in self._tables:
            lines.append(f"Table: {table['table_name']}")
            lines.append(f"  Description: {table['description']}")
            lines.append("  Columns:")
            for col in table.get("columns", []):
                parts = [f"    - {col['column_name']} ({col['data_type']}): {col['description']}"]
                if col.get("is_pii"):
                    parts.append(" [PII]")
                if col.get("governance_tag") == "sensitive":
                    parts.append(" [SENSITIVE]")
                samples = col.get("sample_values", [])
                if samples:
                    parts.append(f" [sample: {', '.join(samples)}]")
                lines.append("".join(parts))
            lines.append("")
        return "\n".join(lines)
