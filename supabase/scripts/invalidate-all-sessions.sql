-- Script para invalidar todas as sessões ativas de todos os usuários
-- Isso vai forçar todos os usuários a fazerem login novamente

-- ============================================
-- MÉTODO RECOMENDADO: Dashboard do Supabase
-- ============================================
-- 1. Acesse: Supabase Dashboard > Authentication > Users
-- 2. Clique em "Actions" (menu de três pontos no topo)
-- 3. Selecione "Sign out all users"
-- 4. Confirme a ação
-- Isso vai invalidar todas as sessões ativas e forçar todos os usuários a fazerem login novamente.

-- ============================================
-- MÉTODO ALTERNATIVO: SQL (se tiver permissões)
-- ============================================
-- ATENÇÃO: Isso requer acesso direto ao banco e pode não funcionar dependendo das permissões

-- Opção 1: Deletar todas as sessões (mais direto)
-- DELETE FROM auth.sessions;

-- Opção 2: Expirar todas as sessões (mais seguro)
-- UPDATE auth.sessions 
-- SET expires_at = now() - interval '1 day'
-- WHERE expires_at > now();

-- Opção 3: Invalidar via Edge Function (se configurada)
-- Faça uma chamada POST para: /functions/v1/invalidate-sessions
-- Com header Authorization: Bearer <service_role_key>
