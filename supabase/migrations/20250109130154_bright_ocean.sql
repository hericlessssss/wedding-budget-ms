/*
  # Correção de Autenticação

  1. Alterações
    - Configura políticas de autenticação
    - Garante que usuários possam se registrar
    - Configura políticas de storage
    
  2. Segurança
    - Mantém RLS em todas as tabelas
    - Configura permissões de storage
*/

-- Configurar políticas de storage
CREATE POLICY "Usuários autenticados podem fazer upload"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id IN ('contracts', 'gallery'));

CREATE POLICY "Usuários podem ver seus próprios arquivos"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id IN ('contracts', 'gallery') AND (auth.uid() = owner));

CREATE POLICY "Usuários podem atualizar seus próprios arquivos"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id IN ('contracts', 'gallery') AND (auth.uid() = owner))
  WITH CHECK (bucket_id IN ('contracts', 'gallery') AND (auth.uid() = owner));

CREATE POLICY "Usuários podem deletar seus próprios arquivos"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id IN ('contracts', 'gallery') AND (auth.uid() = owner));

-- Configurar permissões de storage
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Garantir que as funções de trigger existam
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar tabela de perfis se não existir
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver seus próprios perfis"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar seus próprios perfis"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Criar trigger para novos usuários
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();