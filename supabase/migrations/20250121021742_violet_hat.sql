/*
  # Tornar sobrenome opcional para convidados

  1. Alterações
    - Remover restrição NOT NULL do campo surname na tabela guests
    - Remover restrição NOT NULL do campo surname na tabela guest_family_members

  2. Motivo
    - Permitir cadastro de convidados apenas com nome
    - Manter compatibilidade com registros existentes
*/

-- Alterar tabela guests
ALTER TABLE guests
ALTER COLUMN surname DROP NOT NULL;

-- Alterar tabela guest_family_members
ALTER TABLE guest_family_members
ALTER COLUMN surname DROP NOT NULL;