-- ============================================
-- Migration: Create Issues Tables
-- Description: Internal Issue Ticket System
-- ============================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ENUM Types
-- ============================================

-- Issue Type
CREATE TYPE issue_type AS ENUM ('bug', 'feat', 'chore');

-- Issue Scope
CREATE TYPE issue_scope AS ENUM ('web', 'ios', 'android', 'admin', 'api', 'other');

-- Issue Priority
CREATE TYPE issue_priority AS ENUM ('low', 'medium', 'high');

-- Issue Severity
CREATE TYPE issue_severity AS ENUM ('blocker', 'critical', 'high', 'low');

-- Issue Status
CREATE TYPE issue_status AS ENUM ('not_started', 'in_progress', 'done', 'cancelled');

-- ============================================
-- Issues Table
-- ============================================

CREATE TABLE issues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Title components (auto-generated title from these)
    title TEXT NOT NULL,
    type issue_type NOT NULL,
    short_description TEXT NOT NULL,
    scope issue_scope NOT NULL,

    -- Classification
    priority issue_priority NOT NULL DEFAULT 'medium',
    severity issue_severity NOT NULL DEFAULT 'high',
    status issue_status NOT NULL DEFAULT 'not_started',

    -- Structured description sections (Markdown)
    why_background TEXT, -- Background & Purpose
    current_behavior TEXT, -- Current behavior description
    expected_behavior TEXT, -- Expected behavior description
    acceptance_criteria TEXT, -- Acceptance criteria list

    -- Metadata
    created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for common queries
CREATE INDEX idx_issues_status ON issues(status);
CREATE INDEX idx_issues_priority ON issues(priority);
CREATE INDEX idx_issues_severity ON issues(severity);
CREATE INDEX idx_issues_type ON issues(type);
CREATE INDEX idx_issues_scope ON issues(scope);
CREATE INDEX idx_issues_created_by ON issues(created_by);
CREATE INDEX idx_issues_created_at ON issues(created_at DESC);
CREATE INDEX idx_issues_updated_at ON issues(updated_at DESC);

-- Full text search index for title and descriptions
CREATE INDEX idx_issues_search ON issues USING gin(
    to_tsvector('english',
        coalesce(title, '') || ' ' ||
        coalesce(short_description, '') || ' ' ||
        coalesce(why_background, '') || ' ' ||
        coalesce(current_behavior, '') || ' ' ||
        coalesce(expected_behavior, '') || ' ' ||
        coalesce(acceptance_criteria, '')
    )
);

-- ============================================
-- Issue Images Table
-- ============================================

CREATE TABLE issue_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    issue_id UUID REFERENCES issues(id) ON DELETE CASCADE,

    -- R2 Storage info
    object_key TEXT NOT NULL, -- Path in R2 bucket
    filename TEXT NOT NULL, -- Original filename
    content_type TEXT NOT NULL, -- MIME type (image/jpeg, image/png, etc.)
    size INTEGER NOT NULL, -- Size in bytes
    url TEXT, -- Public URL after upload

    -- Upload status tracking
    uploaded BOOLEAN DEFAULT FALSE,

    -- Metadata
    uploaded_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for queries
CREATE INDEX idx_issue_images_issue_id ON issue_images(issue_id);
CREATE INDEX idx_issue_images_uploaded ON issue_images(uploaded);
CREATE INDEX idx_issue_images_uploaded_by ON issue_images(uploaded_by);

-- ============================================
-- Auto-update updated_at trigger
-- ============================================

CREATE OR REPLACE FUNCTION update_issues_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_issues_updated_at
    BEFORE UPDATE ON issues
    FOR EACH ROW
    EXECUTE FUNCTION update_issues_updated_at();

-- ============================================
-- Row Level Security (RLS) Policies
-- ============================================

-- Enable RLS on tables
ALTER TABLE issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE issue_images ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Issues Policies
-- ============================================

-- Anyone authenticated can view issues
CREATE POLICY "Authenticated users can view issues"
    ON issues FOR SELECT
    TO authenticated
    USING (true);

-- Anyone authenticated can create issues
CREATE POLICY "Authenticated users can create issues"
    ON issues FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = created_by);

-- Creator or admin can update issues
CREATE POLICY "Creator or admin can update issues"
    ON issues FOR UPDATE
    TO authenticated
    USING (
        created_by = auth.uid() OR
        is_current_user_admin()
    )
    WITH CHECK (
        created_by = auth.uid() OR
        is_current_user_admin()
    );

-- Creator or admin can delete issues
CREATE POLICY "Creator or admin can delete issues"
    ON issues FOR DELETE
    TO authenticated
    USING (
        created_by = auth.uid() OR
        is_current_user_admin()
    );

-- ============================================
-- Issue Images Policies
-- ============================================

-- Anyone authenticated can view issue images
CREATE POLICY "Authenticated users can view issue images"
    ON issue_images FOR SELECT
    TO authenticated
    USING (true);

-- Anyone authenticated can create issue images (for uploads)
CREATE POLICY "Authenticated users can create issue images"
    ON issue_images FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = uploaded_by);

-- Creator, uploader, or admin can update issue images
CREATE POLICY "Creator, uploader, or admin can update issue images"
    ON issue_images FOR UPDATE
    TO authenticated
    USING (
        uploaded_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM issues
            WHERE issues.id = issue_images.issue_id
            AND issues.created_by = auth.uid()
        ) OR
        is_current_user_admin()
    );

-- Creator, uploader, or admin can delete issue images
CREATE POLICY "Creator, uploader, or admin can delete issue images"
    ON issue_images FOR DELETE
    TO authenticated
    USING (
        uploaded_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM issues
            WHERE issues.id = issue_images.issue_id
            AND issues.created_by = auth.uid()
        ) OR
        is_current_user_admin()
    );

-- ============================================
-- Helper Functions
-- ============================================

-- Function to check if user can edit an issue
CREATE OR REPLACE FUNCTION can_edit_issue(issue_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    issue_creator UUID;
BEGIN
    SELECT created_by INTO issue_creator FROM issues WHERE id = issue_id;
    RETURN issue_creator = auth.uid() OR is_current_user_admin();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate issue title from components
CREATE OR REPLACE FUNCTION generate_issue_title(
    p_type issue_type,
    p_short_description TEXT,
    p_scope issue_scope
)
RETURNS TEXT AS $$
BEGIN
    RETURN format('[%s] %s (%s)',
        UPPER(p_type::TEXT),
        p_short_description,
        CASE p_scope
            WHEN 'web' THEN 'Web'
            WHEN 'ios' THEN 'iOS'
            WHEN 'android' THEN 'Android'
            WHEN 'admin' THEN 'Admin'
            WHEN 'api' THEN 'API'
            WHEN 'other' THEN 'Other'
        END
    );
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Cleanup function for orphaned images
-- Run periodically via cron job or manually
-- ============================================

CREATE OR REPLACE FUNCTION cleanup_orphaned_images()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Delete images that:
    -- 1. Have no issue_id (pending upload that was never completed)
    -- 2. Are older than 24 hours
    -- 3. Are not marked as uploaded
    WITH deleted AS (
        DELETE FROM issue_images
        WHERE issue_id IS NULL
        AND uploaded = FALSE
        AND created_at < NOW() - INTERVAL '24 hours'
        RETURNING id
    )
    SELECT COUNT(*) INTO deleted_count FROM deleted;

    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Comments on tables for documentation
-- ============================================

COMMENT ON TABLE issues IS 'Internal issue tickets for tracking bugs, features, and chores';
COMMENT ON TABLE issue_images IS 'Images attached to issues, stored in Cloudflare R2';

COMMENT ON COLUMN issues.title IS 'Auto-generated title in format: [TYPE] description (Scope)';
COMMENT ON COLUMN issues.why_background IS 'Background & Purpose section - why this issue matters';
COMMENT ON COLUMN issues.current_behavior IS 'Description of current/broken behavior';
COMMENT ON COLUMN issues.expected_behavior IS 'Description of expected/desired behavior';
COMMENT ON COLUMN issues.acceptance_criteria IS 'List of acceptance criteria for resolution';

COMMENT ON COLUMN issue_images.object_key IS 'Full path to object in R2 bucket';
COMMENT ON COLUMN issue_images.uploaded IS 'Whether the upload to R2 has been confirmed';
