-- Audit trail table for logging every query through the agent.
-- Run this after loading the Chinook dataset.

CREATE TABLE IF NOT EXISTS query_log (
    id               SERIAL PRIMARY KEY,
    timestamp        TIMESTAMP DEFAULT NOW(),
    user_role        VARCHAR(20) NOT NULL,
    original_question TEXT NOT NULL,
    generated_sql    TEXT,
    was_pii_filtered BOOLEAN DEFAULT FALSE,
    result_row_count INTEGER,
    latency_ms       INTEGER,
    llm_model_used   VARCHAR(50)
);
