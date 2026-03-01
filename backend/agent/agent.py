"""Agent Orchestration — creates and runs the LangChain agent.

This is the heart of Nexus. The agent:
  1. Receives a user question
  2. Uses tools to look up metadata, generate SQL, validate, execute, and answer
  3. Returns a structured response matching the API contract

LangChain components you'll likely use:
  - ChatOpenAI or ChatAnthropic (the LLM)
  - Tool (wraps your Python functions)
  - create_react_agent or AgentExecutor (orchestrates tool use)
  - PromptTemplate (for system/tool prompts)
"""

import time
from catalog.loader import CatalogLoader
from config import Config
from langchain_anthropic import ChatAnthropic
from langchain.tools import tool
from agent.tools import (
    get_schema_info, generate_sql, validate_sql, execute_sql, synthesize_answer,
)
from langchain.agents import create_agent
from langchain.messages import HumanMessage
from agent.prompts import SYSTEM_PROMPT


def create_langchain_agent(catalog: CatalogLoader, db_connection):
    """Create and return the LangChain agent with all tools.

    Args:
        catalog: CatalogLoader instance for metadata access
        db_connection: psycopg2 connection to PostgreSQL

    Returns:
        A LangChain agent ready to handle questions
    """

    llm = ChatAnthropic(model=Config.LLM_MODEL, api_key=Config.LLM_API_KEY)

    @tool
    def schema_info(question: str) -> str:
        """Retrieve relevant table/column metadata for a user question."""
        return get_schema_info(question, catalog)

    @tool
    def sql_generate(question: str, schema_context: str, role: str) -> str:
        """Generate a SQL query from a natural language question."""
        return generate_sql(question, schema_context, role)

    @tool
    def sql_validate(sql: str, role: str) -> dict:
        """Safety-check generated SQL before execution."""
        return validate_sql(sql, role, catalog)

    @tool
    def sql_execute(sql: str) -> dict:
        """Execute validated SQL against PostgreSQL and return results."""
        return execute_sql(sql, db_connection)

    @tool
    def answer_synthesize(question: str, sql: str, results: dict) -> str:
        """Convert raw query results into a natural language answer."""
        return synthesize_answer(question, sql, results)

    tools = [schema_info, sql_generate, sql_validate, sql_execute, answer_synthesize]

    agent = create_agent(model=llm, tools=tools, system_prompt=SYSTEM_PROMPT)

    return agent
    
    


def handle_chat(agent, question: str, role: str):
    """Process a user question through the agent and return the response.

    This is the function called by the POST /api/chat route.

    TODO: Implement. Steps:
      1. Record the start time (for latency measurement)
      2. Invoke the agent:
           result = agent.invoke({"input": question, "role": role})
      3. Extract from the result:
           - answer (the final text response)
           - sql (the generated SQL query)
           - tables_used (list of table names referenced)
      4. Calculate latency_ms = (time.time() - start) * 1000
      5. Log to audit trail:
           from audit.logger import log_query
           log_query(db_connection, {...})
      6. Return the response dict matching the API contract:
           {
               "answer": str,
               "sql": str,
               "tables_used": list[str],
               "latency_ms": int
           }

    Edge cases:
      - Agent raises an exception → return a friendly error message
      - Agent can't answer → return "I couldn't find an answer" with empty SQL
      - SQL validation fails → return the validation error as the answer

    Args:
        agent: The LangChain AgentExecutor from create_langchain_agent()
        question: The user's natural language question
        role: "analyst" or "admin"

    Returns:
        Dict matching the ChatResponse API contract
    """
    start = time.time()
    
    # Combine role context and question
    full_prompt = f"[User Role: {role}]\nQuestion: {question}"
    
    try:
        result = agent.invoke({
            "messages": [HumanMessage(content=full_prompt)]
        })
        
        final_answer = result["messages"][-1].content
        latency_ms = int((time.time() - start) * 1000)
        
        # TODO: Parse sql and tables_used from intermediate steps
        
        return {
            "answer": result,
            "sql": "", 
            "tables_used": [],
            "latency_ms": latency_ms
        }
        
    except Exception as e:
        latency_ms = int((time.time() - start) * 1000)
        return {
            "answer": f"I encountered an error: {str(e)}",
            "sql": "",
            "tables_used": [],
            "latency_ms": latency_ms
        }
