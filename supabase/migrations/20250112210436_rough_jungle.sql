/*
  # Add User Themes Support
  
  1. New Tables
    - `user_themes`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `primary_color` (text)
      - `secondary_color` (text)
      - `accent_color` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
  
  2. Security
    - Enable RLS on `user_themes` table
    - Add policies for authenticated users to manage their own themes
*/

-- Create user_themes table
CREATE TABLE IF NOT EXISTS public.user_themes (
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

-- Create policies
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

-- Create trigger function to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER update_user_themes_updated_at
  BEFORE UPDATE ON public.user_themes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Update handle_new_user function to create default theme
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Create user profile
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email);
  
  -- Create default task lists
  INSERT INTO public.task_lists (name, "order", user_id)
  VALUES 
    ('A Fazer', 0, new.id),
    ('Em Andamento', 1, new.id),
    ('Concluído', 2, new.id);
    
  -- Create default theme
  INSERT INTO public.user_themes (user_id)
  VALUES (new.id);
    
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;