/*
  # Fix User Themes Table
  
  1. Ensure Table Exists
    - Drop and recreate table if needed
    - Add default themes for existing users
  
  2. Security
    - Reapply RLS policies
*/

-- Drop existing table and related objects if they exist
DROP TRIGGER IF EXISTS update_user_themes_updated_at ON public.user_themes;
DROP FUNCTION IF EXISTS update_updated_at_column();
DROP TABLE IF EXISTS public.user_themes;

-- Recreate user_themes table
CREATE TABLE public.user_themes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  primary_color TEXT NOT NULL DEFAULT '#EC4899',
  secondary_color TEXT NOT NULL DEFAULT '#F472B6',
  accent_color TEXT NOT NULL DEFAULT '#FDF2F8',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable Row Level Security
ALTER TABLE public.user_themes ENABLE ROW LEVEL SECURITY;

-- Recreate policies
CREATE POLICY "Users can view their own theme"
  ON public.user_themes
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own theme"
  ON public.user_themes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own theme"
  ON public.user_themes
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Recreate trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate trigger
CREATE TRIGGER update_user_themes_updated_at
  BEFORE UPDATE ON public.user_themes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default themes for existing users
INSERT INTO public.user_themes (user_id)
SELECT id FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.user_themes)
ON CONFLICT (user_id) DO NOTHING;