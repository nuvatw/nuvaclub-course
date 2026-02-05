-- Seed admin emails
-- Run this after schema.sql

INSERT INTO app_admins (email) VALUES
  ('hi@meetnuva.com'),
  ('ceo@meetnuva.com'),
  ('oliver@meetnuva.com')
ON CONFLICT (email) DO NOTHING;
