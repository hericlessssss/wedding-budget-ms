/*
  # Atualização de Políticas e Tabelas

  1. Alterações
    - Adiciona ON DELETE CASCADE para todas as referências de usuário
    - Atualiza as políticas de segurança existentes
    
  2. Segurança
    - Mantém RLS em todas as tabelas
    - Garante que usuários só possam acessar seus próprios dados
*/

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can manage their own suppliers" ON suppliers;
DROP POLICY IF EXISTS "Users can manage their own budget categories" ON budget_categories;
DROP POLICY IF EXISTS "Users can manage their own events" ON events;
DROP POLICY IF EXISTS "Users can manage their own gallery items" ON gallery;

-- Atualizar referências de usuário para incluir ON DELETE CASCADE
ALTER TABLE suppliers 
  DROP CONSTRAINT IF EXISTS suppliers_user_id_fkey,
  ADD CONSTRAINT suppliers_user_id_fkey 
    FOREIGN KEY (user_id) 
    REFERENCES auth.users(id) 
    ON DELETE CASCADE;

ALTER TABLE budget_categories 
  DROP CONSTRAINT IF EXISTS budget_categories_user_id_fkey,
  ADD CONSTRAINT budget_categories_user_id_fkey 
    FOREIGN KEY (user_id) 
    REFERENCES auth.users(id) 
    ON DELETE CASCADE;

ALTER TABLE events 
  DROP CONSTRAINT IF EXISTS events_user_id_fkey,
  ADD CONSTRAINT events_user_id_fkey 
    FOREIGN KEY (user_id) 
    REFERENCES auth.users(id) 
    ON DELETE CASCADE;

ALTER TABLE gallery 
  DROP CONSTRAINT IF EXISTS gallery_user_id_fkey,
  ADD CONSTRAINT gallery_user_id_fkey 
    FOREIGN KEY (user_id) 
    REFERENCES auth.users(id) 
    ON DELETE CASCADE;

-- Recriar políticas
CREATE POLICY "Users can manage their own suppliers"
  ON suppliers
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own budget categories"
  ON budget_categories
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own events"
  ON events
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own gallery items"
  ON gallery
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Garantir que os buckets de storage existam
DO $$
BEGIN
  INSERT INTO storage.buckets (id, name)
  VALUES ('contracts', 'contracts')
  ON CONFLICT DO NOTHING;

  INSERT INTO storage.buckets (id, name)
  VALUES ('gallery', 'gallery')
  ON CONFLICT DO NOTHING;
END $$;