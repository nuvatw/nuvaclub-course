-- Course Production Tracker Schema
-- Run this in the Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Admin email whitelist
CREATE TABLE app_admins (
  email TEXT PRIMARY KEY
);

-- User profiles (linked to auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  gender TEXT CHECK (gender IN ('male', 'female')),
  role TEXT NOT NULL CHECK (role IN ('admin', 'member')) DEFAULT 'member',
  onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_sign_in_at TIMESTAMPTZ
);

-- Course projects
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  launch_date DATE,
  current_step_index INT NOT NULL DEFAULT 1,
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 20 steps per project
CREATE TABLE project_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  step_index INT NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  relative_timing TEXT NOT NULL,
  estimated_hours NUMERIC NOT NULL,
  actual_hours NUMERIC,  -- Filled when step is completed
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'done')),
  started_at TIMESTAMPTZ,  -- When step was started
  completed_at TIMESTAMPTZ,  -- When step was completed
  UNIQUE(project_id, step_index)
);

-- Step time averages for estimating future projects
CREATE TABLE step_time_averages (
  step_index INT PRIMARY KEY,
  step_name TEXT NOT NULL,
  category TEXT NOT NULL,
  default_hours NUMERIC NOT NULL,
  average_hours NUMERIC NOT NULL,
  total_completed INT NOT NULL DEFAULT 0,
  total_hours NUMERIC NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Links attached to steps
CREATE TABLE step_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  step_id UUID NOT NULL REFERENCES project_steps(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  visibility TEXT NOT NULL CHECK (visibility IN ('public', 'private')),
  link_type TEXT,
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comment wall per project
CREATE TABLE project_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES profiles(id),
  author_name TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_project_steps_project_id ON project_steps(project_id);
CREATE INDEX idx_project_steps_step_index ON project_steps(step_index);
CREATE INDEX idx_step_links_project_id ON step_links(project_id);
CREATE INDEX idx_step_links_step_id ON step_links(step_id);
CREATE INDEX idx_project_comments_project_id ON project_comments(project_id);
CREATE INDEX idx_profiles_email ON profiles(email);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_step_links_updated_at
  BEFORE UPDATE ON step_links
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to update step average when a step is completed
CREATE OR REPLACE FUNCTION update_step_average()
RETURNS TRIGGER AS $$
BEGIN
  -- Only update when status changes to 'done' and actual_hours is set
  IF NEW.status = 'done' AND NEW.actual_hours IS NOT NULL THEN
    UPDATE step_time_averages
    SET
      total_completed = total_completed + 1,
      total_hours = total_hours + NEW.actual_hours,
      average_hours = (total_hours + NEW.actual_hours) / (total_completed + 1),
      updated_at = NOW()
    WHERE step_index = NEW.step_index;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update averages when step is completed
CREATE TRIGGER trigger_update_step_average
  AFTER UPDATE ON project_steps
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status AND NEW.status = 'done')
  EXECUTE FUNCTION update_step_average();

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles p
    JOIN app_admins a ON p.email = a.email
    WHERE p.id = user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is admin by auth.uid()
CREATE OR REPLACE FUNCTION is_current_user_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles p
    JOIN app_admins a ON p.email = a.email
    WHERE p.id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if an email is in admin list (for use before profile exists)
CREATE OR REPLACE FUNCTION is_admin_email(check_email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM app_admins WHERE email = check_email
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Initialize step_time_averages with default values (20 steps)
INSERT INTO step_time_averages (step_index, step_name, category, default_hours, average_hours) VALUES
(1, '決定教的軟體 / 大方向', 'Pre-Production', 4, 4),
(2, '深度研究軟體有的技術、理論', 'Research', 16, 16),
(3, '決定受眾跟核心 Take Away', 'Planning', 4, 4),
(4, '撰寫完整課綱', 'Content', 20, 20),
(5, '發想影集/紀錄片創意靈感', 'Creative', 8, 8),
(6, '進行故事撰寫', 'Content', 16, 16),
(7, 'IG 找演員 + 拍攝 Reels', 'Marketing', 8, 8),
(8, '課程線拍攝', 'Production', 16, 16),
(9, '故事線拍攝', 'Production', 12, 12),
(10, 'Rough Edit', 'Post-Production', 12, 12),
(11, 'Graphic Motion', 'Post-Production', 10, 10),
(12, 'Color Grading', 'Post-Production', 6, 6),
(13, 'Sound Effect', 'Post-Production', 6, 6),
(14, 'Final Review', 'QA', 4, 4),
(15, 'Revisions', 'Post-Production', 6, 6),
(16, 'Export & Compress', 'Delivery', 2, 2),
(17, 'Platform Upload', 'Delivery', 2, 2),
(18, 'Launch & Announce', 'Marketing', 2, 2),
(19, '發布短影片說明課程內容', 'Marketing', 4, 4),
(20, '發布幕後花絮', 'Marketing', 4, 4);
