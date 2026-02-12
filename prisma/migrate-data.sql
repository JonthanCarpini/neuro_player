-- =============================================
-- Script de Migração: soupet_gerencia + soupet_provedor → neuroplay
-- Executar no banco neuroplay (mysql_neuroplay)
-- =============================================

SET FOREIGN_KEY_CHECKS = 0;

-- =============================================
-- 1. Limpar dados do seed (manter apenas estrutura)
-- =============================================
DELETE FROM avatars;
DELETE FROM settings;
DELETE FROM admins;

-- =============================================
-- 2. ADMINS (soupet_gerencia.admins → neuroplay.admins)
-- Mapeamento: nome→name, email→email, senha→password, ativo→active, ultimo_acesso→last_access
-- NOTA: senha PHP ($2y$) é compatível com bcrypt ($2a$/$2b$) — funciona com bcryptjs
-- =============================================
-- Senha: admin123 (hash bcryptjs $2a$)
INSERT INTO admins (id, name, email, password, active, last_access, created_at) VALUES
(1, 'Administrador', 'admin@neuroplay.com', '$2a$10$oiLox3DC2e1UUtraAPMNQOC6VhFhW9t3Xaa2UnpzrVShGMHoKVJsG', 1, NULL, '2026-02-12 02:53:32');

-- =============================================
-- 3. PROVIDERS (soupet_gerencia.provedores → neuroplay.providers)
-- Mapeamento: numero_provedor→code, nome→name, email→email, senha→password,
--   url_principal→url_primary, url_backup_1→url_backup_1, url_backup_2→url_backup_2,
--   ativo→active, data_vencimento→due_date
-- =============================================
INSERT INTO providers (id, code, name, email, password, logo, banner, url_primary, url_backup_1, url_backup_2, active, due_date, created_at, updated_at) VALUES
-- Senha: admin123 (hash bcryptjs $2a$)
(1, '0001', 'Provedor Teste', 'teste@teste.com', '$2a$10$oiLox3DC2e1UUtraAPMNQOC6VhFhW9t3Xaa2UnpzrVShGMHoKVJsG', NULL, NULL, 'http://p2player.sbs', NULL, NULL, 1, NULL, '2026-02-12 03:09:33', '2026-02-12 03:09:33');

-- =============================================
-- 4. SETTINGS (soupet_gerencia.configuracoes_gerais → neuroplay.settings)
-- Mapeamento: chave→key, valor→value, descricao→description, tipo→type
-- =============================================
INSERT INTO settings (`key`, value, description, type) VALUES
('categoria_adulto_ativa', '0', 'Ativar categoria adulto no sistema', 'boolean'),
('pin_parental_padrao', '0000', 'PIN padrao para desbloqueio de conteudo adulto', 'string'),
('manutencao', '0', 'Modo de manutencao', 'boolean'),
('versao_app', '1.0.0', 'Versao do aplicativo', 'string'),
('max_perfis_por_usuario', '4', 'Maximo de perfis por usuario', 'number'),
('app_name', 'Neuro Play', 'Nome da aplicacao', 'string'),
('app_version', '2.0.0', 'Versao da aplicacao', 'string'),
('max_favorites_per_type', '50', 'Maximo de favoritos por tipo', 'number'),
('max_recent_channels', '15', 'Maximo de canais recentes', 'number'),
('log_enabled', 'true', 'Habilitar logs do sistema', 'boolean'),
('cache_ttl_minutes', '5', 'TTL do cache em minutos', 'number');

-- =============================================
-- 5. HIGHLIGHTS (soupet_gerencia.destaques_filmes + destaques_series → neuroplay.highlights)
-- destaques_filmes: type='filmes'
-- destaques_series: type='series'
-- Mapeamento: categoria_nome→category_name, categoria_id_provedor→category_id, url_logo→logo_url
-- =============================================
INSERT INTO highlights (provider_id, type, category_name, category_id, logo_url, `order`, active) VALUES
-- Destaques Filmes (provedor 1)
(1, 'filmes', 'Netflix', '183', 'https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg', 1, 1),
(1, 'filmes', 'Max', '141', 'https://upload.wikimedia.org/wikipedia/commons/4/4a/HBO_Max_logo.svg', 2, 1),
(1, 'filmes', 'Prime Video', '136', 'https://upload.wikimedia.org/wikipedia/commons/f/f1/Prime_Video.png', 3, 1),
(1, 'filmes', 'Apple TV+', '86', 'https://upload.wikimedia.org/wikipedia/commons/2/28/Apple_TV_Plus_Logo.svg', 4, 1),
(1, 'filmes', 'Disney+', '59', 'https://upload.wikimedia.org/wikipedia/commons/3/3e/Disney%2B_logo.svg', 5, 1),
(1, 'filmes', 'Globoplay', '55', 'https://upload.wikimedia.org/wikipedia/commons/8/82/Globoplay_logo_2023.svg', 6, 1),
(1, 'filmes', 'Star+', '84', 'https://upload.wikimedia.org/wikipedia/commons/8/89/Star_Plus_logo.svg', 7, 1);

-- =============================================
-- 6. KIDS HIGHLIGHTS (soupet_gerencia.destaques_kids → neuroplay.kids_highlights)
-- Mapeamento: tipo_conteudo→content_type, conteudo_id→content_id, provedor_nome→provider_name,
--   categoria_id_provedor→category_id, url_logo→logo_url
-- =============================================
INSERT INTO kids_highlights (provider_id, content_type, content_id, provider_name, category_id, logo_url, `order`, active) VALUES
(1, 'filmes', 1, 'Netflix', '42', 'https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg', 1, 1),
(1, 'filmes', 2, 'Netflix', '42', 'https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg', 2, 1),
(1, 'series', 1, 'Netflix', '42', 'https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg', 3, 1),
(1, 'tv', 1, 'Netflix', '42', 'https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg', 4, 1),
(2, 'filmes', 3, 'Prime Video', '50', 'https://upload.wikimedia.org/wikipedia/commons/f/f1/Prime_Video.png', 1, 1),
(2, 'series', 2, 'Prime Video', '50', 'https://upload.wikimedia.org/wikipedia/commons/f/f1/Prime_Video.png', 2, 1);

-- =============================================
-- 7. AVATARS (soupet_provedor.avatares → neuroplay.avatars)
-- Mapeamento: nome→name, arquivo→file, categoria→category (geral/infantil→kids), ordem→order
-- =============================================
INSERT INTO avatars (id, name, file, category, `order`) VALUES
(1, 'Avatar Azul', 'assets/images/avatars/avatar_01.svg', 'geral', 1),
(2, 'Avatar Vermelho', 'assets/images/avatars/avatar_02.svg', 'geral', 2),
(3, 'Avatar Verde', 'assets/images/avatars/avatar_03.svg', 'geral', 3),
(4, 'Avatar Laranja', 'assets/images/avatars/avatar_04.svg', 'geral', 4),
(5, 'Avatar Roxo', 'assets/images/avatars/avatar_05.svg', 'geral', 5),
(6, 'Crianca Amarela', 'assets/images/avatars/avatar_kid_01.svg', 'kids', 6),
(7, 'Crianca Rosa', 'assets/images/avatars/avatar_kid_02.svg', 'kids', 7),
(8, 'Crianca Verde', 'assets/images/avatars/avatar_kid_03.svg', 'kids', 8);

-- =============================================
-- 8. USERS (soupet_provedor.usuarios → neuroplay.users)
-- Mapeamento: provedor_id→provider_id, numero_provedor→provider_code,
--   login_provedor→provider_login, nome→name, idioma→language,
--   controle_parental_ativo→parental_active, pin_parental→parental_pin,
--   ativo→active, dados_provedor→provider_data, ultimo_acesso→last_login
-- =============================================
INSERT INTO users (id, provider_id, provider_code, provider_login, name, language, parental_active, parental_pin, active, provider_data, last_login, created_at) VALUES
(1, 1, '0001', 'carpini9140', 'carpini9140', 'pt-BR', 0, '0000', 1, '{"password":"41990579551","base_url":"http://p2player.sbs","user_info":{"username":"carpini9140","password":"41990579551","message":"P2PLAYER","auth":1,"status":"Active","exp_date":"1772333999","is_trial":"0","active_cons":1,"created_at":"1769637604","max_connections":"2","allowed_output_formats":["m3u8","ts","rtmp"]}}', '2026-02-12 10:46:25', '2026-02-12 03:22:31');

-- =============================================
-- 9. PROFILES (soupet_provedor.perfis → neuroplay.profiles)
-- Mapeamento: usuario_id→user_id, nome→name, avatar→avatar, tipo→type,
--   pin_protegido→pin_protected, pin→pin, infantil→is_kid, ativo→active
-- =============================================
INSERT INTO profiles (id, user_id, name, avatar, type, pin_protected, pin, is_kid, active, created_at) VALUES
(1, 1, 'Carpini', 'assets/images/avatars/avatar_01.svg', 'adicional', 0, NULL, 0, 1, '2026-02-12 03:25:05');

-- =============================================
-- 10. VIEW HISTORY (soupet_provedor.historico_visualizacao → neuroplay.view_history)
-- Mapeamento: perfil_id→profile_id, tipo_conteudo→content_type, conteudo_id→content_id,
--   nome→name, imagem→image, posicao_segundos→position_seconds, duracao_segundos→duration_seconds,
--   percentual_assistido→percent_watched, episodio_id→episode_id, temporada→season,
--   episodio→episode, finalizado→completed, dados_adicionais→extra_data
-- =============================================
INSERT INTO view_history (id, profile_id, content_type, content_id, name, image, position_seconds, duration_seconds, percent_watched, episode_id, season, episode, completed, extra_data, updated_at, created_at) VALUES
(1, 1, 'filme', '608635', 'Salve Geral: Irmandade', 'https://image.tmdb.org/t/p/w780/rBUQeEBFOZQskflRcEPCu9KkGeG.jpg', 4963, 6260, 79.28, '', NULL, NULL, 0, NULL, '2026-02-12 09:13:28', '2026-02-12 10:50:47');

-- =============================================
-- 11. TV RECENT (soupet_provedor.recentes_tv → neuroplay.tv_recent)
-- Mapeamento: perfil_id→profile_id, canal_id→channel_id, nome→name, imagem→image,
--   grupo→group, dados_adicionais→extra_data, total_segundos_assistidos→total_watched,
--   ultimo_acesso→last_access
-- =============================================
INSERT INTO tv_recent (id, profile_id, channel_id, name, image, `group`, extra_data, total_watched, last_access) VALUES
(1, 1, '636', 'SporTV 1 FHD', 'https://img.newfaston.top/icones_channels/SporTV_HD.png', 'SporTV', '{"category_id":"22"}', 21840, '2026-02-12 10:48:44'),
(640, 1, '604280', 'Record MT - HD', 'https://raphmx00.com/record.png', 'Record TV', '{"category_id":"12"}', 120, '2026-02-12 09:20:24'),
(647, 1, '525', 'AMC FHD', 'https://raphmx00.com/amc.png', 'Filmes e Series', '{"category_id":"18"}', 120, '2026-02-12 09:22:44');

SET FOREIGN_KEY_CHECKS = 1;

-- =============================================
-- Migração concluída!
-- Tabelas migradas: admins, providers, settings, highlights, kids_highlights,
--   avatars, users, profiles, view_history, tv_recent
-- Tabelas vazias (sem dados no antigo): finances, provider_messages, provider_news,
--   provider_special_categories, favorites, schedules, playlist_cache, system_logs
-- =============================================
