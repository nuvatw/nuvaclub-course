-- Migration: Add actual hours tracking to project_steps
-- Run this in Supabase SQL Editor

-- Add actual_hours column to track real time spent
ALTER TABLE project_steps
ADD COLUMN IF NOT EXISTS actual_hours NUMERIC;

-- Add started_at to track when step was started
ALTER TABLE project_steps
ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ;

-- Create table to store step time averages for future estimates
-- This will be updated whenever a step is completed
CREATE TABLE IF NOT EXISTS step_time_averages (
  step_index INT PRIMARY KEY,
  step_name TEXT NOT NULL,
  category TEXT NOT NULL,
  default_hours NUMERIC NOT NULL,
  average_hours NUMERIC NOT NULL,
  total_completed INT NOT NULL DEFAULT 0,
  total_hours NUMERIC NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

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
(20, '發布幕後花絮', 'Marketing', 4, 4)
ON CONFLICT (step_index) DO NOTHING;

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
DROP TRIGGER IF EXISTS trigger_update_step_average ON project_steps;
CREATE TRIGGER trigger_update_step_average
  AFTER UPDATE ON project_steps
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status AND NEW.status = 'done')
  EXECUTE FUNCTION update_step_average();

-- RLS for step_time_averages (readable by all, writable by trigger only)
ALTER TABLE step_time_averages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Step averages are viewable by everyone"
  ON step_time_averages FOR SELECT
  USING (true);
