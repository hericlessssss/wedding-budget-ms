/*
  # Criar tabelas para o sistema Kanban de tarefas

  1. Novas Tabelas
    - `task_lists` (colunas do Kanban)
      - `id` (uuid, primary key)
      - `name` (text) - Nome da lista (ex: "A Fazer", "Em Andamento", "Concluído")
      - `order` (integer) - Ordem de exibição
      - `created_at` (timestamptz)
      - `user_id` (uuid) - Referência ao usuário

    - `tasks` (tarefas)
      - `id` (uuid, primary key)
      - `title` (text) - Título da tarefa
      - `description` (text) - Descrição detalhada
      - `list_id` (uuid) - Referência à lista (coluna do Kanban)
      - `order` (integer) - Ordem dentro da lista
      - `due_date` (timestamptz) - Data de vencimento
      - `priority` (text) - Prioridade (baixa, média, alta)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - `user_id` (uuid) - Referência ao usuário

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users
*/

-- Task Lists Table
CREATE TABLE IF NOT EXISTS task_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) NOT NULL
);

-- Enable RLS
ALTER TABLE task_lists ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY "Users can manage their own task lists"
  ON task_lists
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Tasks Table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  list_id UUID REFERENCES task_lists(id) ON DELETE CASCADE NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 0,
  due_date TIMESTAMPTZ,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) NOT NULL
);

-- Enable RLS
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY "Users can manage their own tasks"
  ON tasks
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Function to create default lists for a user
CREATE OR REPLACE FUNCTION create_default_task_lists()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO task_lists (name, "order", user_id)
  VALUES 
    ('A Fazer', 0, NEW.id),
    ('Em Andamento', 1, NEW.id),
    ('Concluído', 2, NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create default lists when a new user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_default_task_lists();