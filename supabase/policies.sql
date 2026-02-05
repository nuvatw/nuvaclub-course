-- Row Level Security Policies
-- Run this after schema.sql and seed.sql

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE step_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_admins ENABLE ROW LEVEL SECURITY;

-- =====================
-- PROFILES POLICIES
-- =====================

-- Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- =====================
-- PROJECTS POLICIES
-- =====================

-- Everyone can read projects (including anonymous)
CREATE POLICY "Anyone can read projects"
  ON projects FOR SELECT
  TO anon, authenticated
  USING (true);

-- Only admins can insert projects
CREATE POLICY "Admins can insert projects"
  ON projects FOR INSERT
  TO authenticated
  WITH CHECK (is_current_user_admin());

-- Only admins can update projects
CREATE POLICY "Admins can update projects"
  ON projects FOR UPDATE
  TO authenticated
  USING (is_current_user_admin())
  WITH CHECK (is_current_user_admin());

-- Only admins can delete projects
CREATE POLICY "Admins can delete projects"
  ON projects FOR DELETE
  TO authenticated
  USING (is_current_user_admin());

-- =====================
-- PROJECT_STEPS POLICIES
-- =====================

-- Everyone can read project steps
CREATE POLICY "Anyone can read project steps"
  ON project_steps FOR SELECT
  TO anon, authenticated
  USING (true);

-- Only admins can insert project steps
CREATE POLICY "Admins can insert project steps"
  ON project_steps FOR INSERT
  TO authenticated
  WITH CHECK (is_current_user_admin());

-- Only admins can update project steps
CREATE POLICY "Admins can update project steps"
  ON project_steps FOR UPDATE
  TO authenticated
  USING (is_current_user_admin())
  WITH CHECK (is_current_user_admin());

-- Only admins can delete project steps
CREATE POLICY "Admins can delete project steps"
  ON project_steps FOR DELETE
  TO authenticated
  USING (is_current_user_admin());

-- =====================
-- STEP_LINKS POLICIES
-- =====================

-- Public links visible to all; private links visible to admins only
CREATE POLICY "Anyone can read public links"
  ON step_links FOR SELECT
  TO anon, authenticated
  USING (
    visibility = 'public'
    OR is_current_user_admin()
  );

-- Only admins can insert links
CREATE POLICY "Admins can insert links"
  ON step_links FOR INSERT
  TO authenticated
  WITH CHECK (is_current_user_admin());

-- Only admins can update links
CREATE POLICY "Admins can update links"
  ON step_links FOR UPDATE
  TO authenticated
  USING (is_current_user_admin())
  WITH CHECK (is_current_user_admin());

-- Only admins can delete links
CREATE POLICY "Admins can delete links"
  ON step_links FOR DELETE
  TO authenticated
  USING (is_current_user_admin());

-- =====================
-- PROJECT_COMMENTS POLICIES
-- =====================

-- Authenticated users can read comments
CREATE POLICY "Authenticated users can read comments"
  ON project_comments FOR SELECT
  TO authenticated
  USING (true);

-- Authenticated users can insert their own comments
CREATE POLICY "Authenticated users can insert own comments"
  ON project_comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

-- =====================
-- APP_ADMINS POLICIES
-- =====================

-- Only allow reading app_admins for admin checks (through functions)
-- No direct access to this table
CREATE POLICY "No direct access to app_admins"
  ON app_admins FOR SELECT
  USING (false);
