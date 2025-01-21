-- Adicionar coluna invitation_delivered à tabela guests
ALTER TABLE guests
ADD COLUMN invitation_delivered BOOLEAN DEFAULT false;