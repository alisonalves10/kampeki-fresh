-- Script para verificar se um usuário tem role e profile
-- Substitua 'alison@store3.com.br' pelo email do usuário

-- 1. Encontrar o user_id
SELECT 
  u.id as user_id,
  u.email,
  u.created_at as user_created_at
FROM auth.users u
WHERE u.email = 'alison@store3.com.br';

-- 2. Verificar se tem role
SELECT 
  ur.role,
  ur.created_at as role_created_at
FROM user_roles ur
JOIN auth.users u ON u.id = ur.user_id
WHERE u.email = 'alison@store3.com.br';

-- 3. Verificar profile e tenant_id
SELECT 
  p.id as profile_id,
  p.tenant_id,
  p.name,
  p.email,
  p.created_at as profile_created_at
FROM profiles p
JOIN auth.users u ON u.id = p.user_id
WHERE u.email = 'alison@store3.com.br';

-- 4. Verificar se o trigger está ativo
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- 5. Verificar a função handle_new_user
SELECT 
  routine_name,
  routine_type,
  routine_definition
FROM information_schema.routines
WHERE routine_name = 'handle_new_user';

