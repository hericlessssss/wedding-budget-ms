-- Drop existing tables to recreate with correct relations
DROP TABLE IF EXISTS guest_family_members CASCADE;
DROP TABLE IF EXISTS guests CASCADE;

-- Recreate guests table
CREATE TABLE guests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  surname TEXT,
  side TEXT NOT NULL CHECK (side IN ('groom', 'bride')),
  probability TEXT NOT NULL CHECK (probability IN ('high', 'medium', 'low')),
  invitation_delivered BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL
);

-- Recreate guest_family_members table
CREATE TABLE guest_family_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id UUID REFERENCES guests(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  surname TEXT,
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