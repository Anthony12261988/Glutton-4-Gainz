-- ============================================================================
-- SCHEMA MIGRATIONS TRACKING TABLE
-- ============================================================================
-- This table tracks which migrations have been executed
-- Used by migration scripts to prevent duplicate executions
-- ============================================================================

CREATE TABLE IF NOT EXISTS schema_migrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  migration_name TEXT NOT NULL UNIQUE,
  executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  execution_time_ms INTEGER,
  status TEXT NOT NULL CHECK (status IN ('success', 'failed', 'pending')),
  error_message TEXT,
  executed_by TEXT,
  
  -- Index for quick lookups
  CONSTRAINT unique_migration_name UNIQUE (migration_name)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_schema_migrations_name ON schema_migrations(migration_name);
CREATE INDEX IF NOT EXISTS idx_schema_migrations_status ON schema_migrations(status);
CREATE INDEX IF NOT EXISTS idx_schema_migrations_executed_at ON schema_migrations(executed_at);

-- Enable RLS (only service role should manage this)
ALTER TABLE schema_migrations ENABLE ROW LEVEL SECURITY;

-- Policy: Only service role can manage migrations
CREATE POLICY IF NOT EXISTS "Service role can manage migrations"
  ON schema_migrations
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Grant access to service role
GRANT ALL ON schema_migrations TO service_role;

-- Comments
COMMENT ON TABLE schema_migrations IS 'Tracks executed database migrations';
COMMENT ON COLUMN schema_migrations.migration_name IS 'Name of the migration file (e.g., 001_create_profiles.sql)';
COMMENT ON COLUMN schema_migrations.status IS 'Execution status: success, failed, or pending';
COMMENT ON COLUMN schema_migrations.execution_time_ms IS 'Time taken to execute migration in milliseconds';

-- Function to check if migration has been executed
CREATE OR REPLACE FUNCTION migration_executed(migration_name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM schema_migrations
    WHERE schema_migrations.migration_name = migration_executed.migration_name
    AND status = 'success'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION migration_executed(TEXT) IS 'Checks if a migration has been successfully executed';
