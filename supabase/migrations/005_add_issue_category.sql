-- Migration: Add issue category (fix/wish)
-- Adds a category field to distinguish between bug fixes and feature wishes

-- 1. Create category enum
CREATE TYPE issue_category AS ENUM ('fix', 'wish');

-- 2. Add category column to issues table (default: 'fix' for backward compatibility)
ALTER TABLE issues ADD COLUMN category issue_category NOT NULL DEFAULT 'fix';

-- 3. Add index for category filtering
CREATE INDEX idx_issues_category ON issues (category);

-- 4. Update comments
COMMENT ON COLUMN issues.category IS 'Issue category: fix (bug repair) or wish (feature request)';
