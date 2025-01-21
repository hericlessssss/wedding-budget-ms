/*
  # Lista de Convidados

  1. Novas Tabelas
    - `guests`
      - `id` (uuid, primary key)
      - `name` (text)
      - `surname` (text)
      - `side` (text) - 'groom' ou 'bride'
      - `probability` (text) - 'high', 'medium', 'low'
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `user_id` (uuid, foreign key)
    
    - `guest_family_members`
      - `id` (uuid, primary key)
      - `guest_id` (uuid, foreign key)
      - `name` (text)
      - `surname` (text)
      - `age` (integer)
      - `created_at` (timestamp)
      - `user_id` (uuid, foreign key)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage their own data
*/

-- Guests Table
CREATE TABLE IF NOT EXISTS guests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  surname TEXT NOT NULL,
  side TEXT NOT NULL CHECK (side IN ('groom', 'bride')),
  probability TEXT NOT NULL CHECK (probability IN ('high', 'medium', 'low')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL
);

-- Guest Family Members Table
CREATE TABLE IF NOT EXISTS guest_family_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id UUID REFERENCES guests(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  surname TEXT NOT NULL,
  age INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL
);

-- Enable RLS
ALTER TABLE guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE guest_family_members ENABLE ROW LEVEL SECURITY;

-- Create policies for guests
CREATE POLICY "Users can manage their own guests"
  ON guests
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create policies for guest family members
CREATE POLICY "Users can manage their own guest family members"
  ON guest_family_members
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create trigger function to update updated_at
CREATE OR REPLACE FUNCTION update_guests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER update_guests_updated_at
  BEFORE UPDATE ON guests
  FOR EACH ROW
  EXECUTE FUNCTION update_guests_updated_at();