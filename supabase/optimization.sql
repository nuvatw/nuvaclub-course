-- Performance Optimization SQL
-- Run this after the initial schema setup

-- Additional indexes for faster queries

-- Index for faster profile lookups by user ID (used in every request)
CREATE INDEX IF NOT EXISTS idx_profiles_id ON profiles(id);

-- Index for faster admin email lookups
CREATE INDEX IF NOT EXISTS idx_app_admins_email ON app_admins(email);

-- Composite index for project steps (frequently queried together)
CREATE INDEX IF NOT EXISTS idx_project_steps_project_status
ON project_steps(project_id, status);

-- Index for step links by step_id (used when loading step details)
CREATE INDEX IF NOT EXISTS idx_step_links_step_visibility
ON step_links(step_id, visibility);

-- Index for comments ordered by creation time
CREATE INDEX IF NOT EXISTS idx_project_comments_created
ON project_comments(project_id, created_at DESC);

-- Analyze tables to update query planner statistics
ANALYZE profiles;
ANALYZE projects;
ANALYZE project_steps;
ANALYZE step_links;
ANALYZE project_comments;
ANALYZE app_admins;

-- Check current cache hit rate (run this to see if you need more memory)
-- SELECT
--   'index hit rate' AS name,
--   (sum(idx_blks_hit)) / nullif(sum(idx_blks_hit + idx_blks_read),0) AS ratio
-- FROM pg_statio_user_indexes
-- UNION ALL
-- SELECT
--   'table hit rate' AS name,
--   sum(heap_blks_hit) / nullif(sum(heap_blks_hit) + sum(heap_blks_read),0) AS ratio
-- FROM pg_statio_user_tables;
