-- Script para excluir um usuário e todas as referências relacionadas
-- ATENÇÃO: Esta operação é irreversível!

-- Substitua 'alison.alvez08@gmail.com' pelo email do usuário a ser excluído

DO $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Obter user_id pelo email
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = 'alison.alvez08@gmail.com';

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuário não encontrado com este email';
  END IF;

  RAISE NOTICE 'Excluindo usuário: % (ID: %)', 'alison.alvez08@gmail.com', v_user_id;

  -- Excluir o usuário do auth.users (isso vai cascatear e excluir automaticamente):
  -- - profiles (via ON DELETE CASCADE)
  -- - user_roles (via ON DELETE CASCADE)
  -- - orders (se houver)
  -- - outros registros relacionados

  DELETE FROM auth.users
  WHERE id = v_user_id;

  RAISE NOTICE 'Usuário excluído com sucesso!';
END $$;

-- ============================================
-- ALTERNATIVA: Exclusão manual passo a passo
-- ============================================

-- Se você quiser excluir manualmente (não recomendado, use o script acima):

-- 1. Obter user_id
-- SELECT id FROM auth.users WHERE email = 'alison.alvez08@gmail.com';

-- 2. Excluir user_roles
-- DELETE FROM user_roles WHERE user_id = 'USER_ID_AQUI';

-- 3. Excluir profile
-- DELETE FROM profiles WHERE user_id = 'USER_ID_AQUI';

-- 4. Excluir pedidos (se necessário)
-- DELETE FROM orders WHERE user_id = 'USER_ID_AQUI';

-- 5. Excluir usuário do auth
-- DELETE FROM auth.users WHERE id = 'USER_ID_AQUI';

