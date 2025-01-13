/*
  # Correção para usuário específico
  
  1. Mudanças
    - Adiciona listas padrão para o usuário brunasnogueiran@hotmail.com
    
  2. Segurança
    - Mantém as políticas RLS existentes
*/

DO $$
DECLARE
  target_user_id UUID;
BEGIN
  -- Obter o ID do usuário pelo email
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE email = 'brunasnogueiran@hotmail.com';

  -- Se o usuário existir e não tiver listas, criar as listas padrão
  IF target_user_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.task_lists WHERE user_id = target_user_id
  ) THEN
    INSERT INTO public.task_lists (name, "order", user_id)
    VALUES 
      ('A Fazer', 0, target_user_id),
      ('Em Andamento', 1, target_user_id),
      ('Concluído', 2, target_user_id);
  END IF;
END $$;