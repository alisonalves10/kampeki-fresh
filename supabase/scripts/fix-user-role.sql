-- Script para corrigir um usuário que não tem role
-- Execute isso para o usuário alison@store3.com.br

DO $$
DECLARE
  v_user_id UUID;
  v_has_role BOOLEAN;
BEGIN
  -- Obter user_id pelo email
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = 'alison@store3.com.br';

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuário não encontrado com este email';
  END IF;

  RAISE NOTICE 'User ID encontrado: %', v_user_id;

  -- Verificar se já tem role
  SELECT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = v_user_id 
    AND role = 'lojista'
  ) INTO v_has_role;

  IF NOT v_has_role THEN
    -- Adicionar role lojista
    INSERT INTO user_roles (user_id, role)
    VALUES (v_user_id, 'lojista')
    ON CONFLICT (user_id, role) DO NOTHING;
    
    RAISE NOTICE 'Role lojista adicionado ao usuário';
  ELSE
    RAISE NOTICE 'Usuário já possui role lojista';
  END IF;

  -- Verificar profile
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE user_id = v_user_id) THEN
    -- Criar profile se não existir
    INSERT INTO profiles (user_id, email)
    VALUES (v_user_id, 'alison@store3.com.br')
    ON CONFLICT (user_id) DO NOTHING;
    
    RAISE NOTICE 'Profile criado para o usuário';
  ELSE
    RAISE NOTICE 'Profile já existe';
  END IF;

  RAISE NOTICE 'Usuário corrigido com sucesso!';
END $$;

