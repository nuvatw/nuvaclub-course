-- Migration: Simplify Issues Schema
-- Remove unnecessary fields: type, scope, severity, short_description

-- 1. Backup existing data (optional, run manually if needed)
-- CREATE TABLE issues_backup_v2 AS SELECT * FROM issues;

-- 2. Drop columns
ALTER TABLE issues DROP COLUMN IF EXISTS type;
ALTER TABLE issues DROP COLUMN IF EXISTS scope;
ALTER TABLE issues DROP COLUMN IF EXISTS severity;
ALTER TABLE issues DROP COLUMN IF EXISTS short_description;

-- 3. Drop unused enum types
DROP TYPE IF EXISTS issue_type CASCADE;
DROP TYPE IF EXISTS issue_scope CASCADE;
DROP TYPE IF EXISTS issue_severity CASCADE;

-- 4. Drop unused indexes
DROP INDEX IF EXISTS idx_issues_type;
DROP INDEX IF EXISTS idx_issues_scope;
DROP INDEX IF EXISTS idx_issues_severity;

-- 5. Update the generate_issue_title function (no longer needed, but keep for safety)
DROP FUNCTION IF EXISTS generate_issue_title CASCADE;

-- 6. Add index on title for search
CREATE INDEX IF NOT EXISTS idx_issues_title ON issues USING gin(to_tsvector('english', title));

-- 7. Update comments
COMMENT ON TABLE issues IS 'Simplified issue tickets with title, priority, status, and descriptions';
COMMENT ON COLUMN issues.title IS 'User-provided issue title';
COMMENT ON COLUMN issues.priority IS 'Priority level: low, medium, high';
