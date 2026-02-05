-- Migration: Add Issue Number
-- Adds a sequential issue number for easier tracking

-- 1. Add issue_number column as SERIAL (auto-increment)
ALTER TABLE issues ADD COLUMN issue_number SERIAL;

-- 2. Create unique index for issue_number
CREATE UNIQUE INDEX idx_issues_issue_number ON issues(issue_number);

-- 3. Update comment
COMMENT ON COLUMN issues.issue_number IS 'Sequential issue number for easy reference (e.g., #1, #2, #3)';
