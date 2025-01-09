/*
  # Initial Schema Setup

  1. New Tables
    - `suppliers`
      - Stores vendor information
      - Includes contact details, status, and payment tracking
    - `budget_categories`
      - Manages budget allocation and spending
      - Tracks agreed amounts and actual expenditure
    - `events`
      - Stores timeline events and appointments
      - Includes status tracking and scheduling
    - `gallery`
      - Stores inspiration images and references
      - Categorizes images for easy filtering

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
*/

-- Suppliers Table
CREATE TABLE IF NOT EXISTS suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  service TEXT NOT NULL,
  price DECIMAL(10,2),
  status TEXT CHECK (status IN ('potential', 'final')) DEFAULT 'potential',
  payment_status TEXT CHECK (payment_status IN ('pending', 'partial', 'paid')) DEFAULT 'pending',
  comments TEXT,
  portfolio_link TEXT,
  instagram TEXT,
  contract_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id)
);

ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own suppliers"
  ON suppliers
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Budget Categories Table
CREATE TABLE IF NOT EXISTS budget_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  agreed_amount DECIMAL(10,2) NOT NULL,
  spent_amount DECIMAL(10,2) DEFAULT 0,
  payment_status TEXT CHECK (payment_status IN ('pending', 'partial', 'paid')) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id)
);

ALTER TABLE budget_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own budget categories"
  ON budget_categories
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Events Table
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  status TEXT CHECK (status IN ('pending', 'completed', 'cancelled')) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id)
);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own events"
  ON events
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Gallery Table
CREATE TABLE IF NOT EXISTS gallery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  image_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id)
);

ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own gallery items"
  ON gallery
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create storage bucket for contracts and gallery images
DO $$
BEGIN
  INSERT INTO storage.buckets (id, name)
  VALUES ('contracts', 'contracts')
  ON CONFLICT DO NOTHING;

  INSERT INTO storage.buckets (id, name)
  VALUES ('gallery', 'gallery')
  ON CONFLICT DO NOTHING;
END $$;