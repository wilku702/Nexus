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


def create_agent(catalog: CatalogLoader, db_connection):
    """Create and return the LangChain agent with all tools.

    TODO: Implement. Steps:
      1. Initialize the LLM:
           from langchain_openai import ChatOpenAI
           llm = ChatOpenAI(model=Config.LLM_MODEL, api_key=Config.LLM_API_KEY)
         OR:
           from langchain_anthropic import ChatAnthropic
           llm = ChatAnthropic(model=Config.LLM_MODEL, api_key=Config.LLM_API_KEY)

      2. Create Tool instances wrapping each function from tools.py:
           from langchain_core.tools import Tool
           tools = [
               Tool(name="get_schema_info", func=..., description="..."),
               Tool(name="generate_sql",    func=..., description="..."),
               Tool(name="validate_sql",    func=..., description="..."),
               Tool(name="execute_sql",     func=..., description="..."),
               Tool(name="synthesize_answer", func=..., description="..."),
           ]

      3. Build the system prompt from prompts.py:
           from agent.prompts import SYSTEM_PROMPT

      4. Create the agent:
           from langchain.agents import create_react_agent, AgentExecutor
           agent = create_react_agent(llm, tools, prompt)
           executor = AgentExecutor(agent=agent, tools=tools, verbose=True)

      5. Return the executor

    Args:
        catalog: CatalogLoader instance for metadata access
        db_connection: psycopg2 connection to PostgreSQL

    Returns:
        A LangChain AgentExecutor ready to handle questions
    """
    # TODO: Set up LLM, tools, prompt, and agent
    pass


def handle_chat(agent, question: str, role: str) -> dict:
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
        agent: The LangChain AgentExecutor from create_agent()
        question: The user's natural language question
        role: "analyst" or "admin"

    Returns:
        Dict matching the ChatResponse API contract
    """
    # TODO: Invoke agent, measure latency, log audit, return response
    pass
