-- Script para configurar um usuário como lojista e vinculá-lo a um restaurante
-- Substitua 'alison.alvez08@gmail.com' pelo email do usuário
-- Substitua 'RESTAURANT_ID_AQUI' pelo ID do restaurante

-- 1. Primeiro, encontre o user_id do usuário pelo email
-- SELECT id FROM auth.users WHERE email = 'alison.alvez08@gmail.com';

-- 2. Encontre o ID do restaurante (ou crie um novo)
-- SELECT id, name FROM restaurants LIMIT 10;

-- 3. Adicione o role 'lojista' ao usuário (substitua USER_ID_AQUI)
-- INSERT INTO user_roles (user_id, role)
-- VALUES ('USER_ID_AQUI', 'lojista')
-- ON CONFLICT (user_id, role) DO NOTHING;

-- 4. Vincule o usuário ao restaurante via tenant_id no profile (substitua USER_ID_AQUI e RESTAURANT_ID_AQUI)
-- UPDATE profiles
-- SET tenant_id = 'RESTAURANT_ID_AQUI'
-- WHERE user_id = 'USER_ID_AQUI';

-- ============================================
-- SCRIPT COMPLETO (substitua os valores):
-- ============================================

-- Passo 1: Obter user_id
DO $$
DECLARE
  v_user_id UUID;
  v_restaurant_id UUID;
BEGIN
  -- Obter user_id pelo email
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = 'alison.alvez08@gmail.com';

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuário não encontrado com este email';
  END IF;

  -- Obter o primeiro restaurante (ou você pode especificar um ID específico)
  SELECT id INTO v_restaurant_id
  FROM restaurants
  LIMIT 1;

  IF v_restaurant_id IS NULL THEN
    RAISE EXCEPTION 'Nenhum restaurante encontrado. Crie um restaurante primeiro.';
  END IF;

  -- Adicionar role lojista
  INSERT INTO user_roles (user_id, role)
  VALUES (v_user_id, 'lojista')
  ON CONFLICT (user_id, role) DO NOTHING;

  -- Vincular ao restaurante
  UPDATE profiles
  SET tenant_id = v_restaurant_id
  WHERE user_id = v_user_id;

  RAISE NOTICE 'Usuário configurado com sucesso!';
  RAISE NOTICE 'User ID: %', v_user_id;
  RAISE NOTICE 'Restaurant ID: %', v_restaurant_id;
END $$;

