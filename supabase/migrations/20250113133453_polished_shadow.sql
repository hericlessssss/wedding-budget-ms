/*
  # Criar listas padrão para usuários existentes

  1. Objetivo
    - Adicionar listas padrão para usuários que não as possuem
    - Garantir que todos os usuários tenham as três listas básicas: A Fazer, Em Andamento e Concluído

  2. Detalhes
    - Verifica usuários sem listas
    - Cria as três listas padrão para cada usuário que não as possui
    - Mantém a ordem correta das listas
*/

DO $$
DECLARE
  user_record RECORD;
BEGIN
  FOR user_record IN 
    SELECT id 
    FROM auth.users 
    WHERE id NOT IN (SELECT DISTINCT user_id FROM public.task_lists)
  LOOP
    INSERT INTO public.task_lists (name, "order", user_id)
    VALUES 
      ('A Fazer', 0, user_record.id),
      ('Em Andamento', 1, user_record.id),
      ('Concluído', 2, user_record.id);
  END LOOP;
END $$;