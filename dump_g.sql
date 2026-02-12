-- MariaDB dump 10.19  Distrib 10.4.32-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: soupet_gerencia
-- ------------------------------------------------------
-- Server version	10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Dumping data for table `admins`
--

LOCK TABLES `admins` WRITE;
/*!40000 ALTER TABLE `admins` DISABLE KEYS */;
INSERT INTO `admins` (`id`, `nome`, `email`, `senha`, `ativo`, `ultimo_acesso`, `created_at`, `updated_at`) VALUES (1,'Administrador','admin@neuroplay.com','$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',1,NULL,'2026-02-12 02:53:32','2026-02-12 02:53:32');
/*!40000 ALTER TABLE `admins` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `avatares`
--

LOCK TABLES `avatares` WRITE;
/*!40000 ALTER TABLE `avatares` DISABLE KEYS */;
INSERT INTO `avatares` (`id`, `nome`, `arquivo`, `categoria`, `ativo`, `ordem`, `created_at`) VALUES (1,'Avatar Azul','assets/images/avatars/avatar_01.svg','geral',1,1,'2026-02-12 03:24:45'),(2,'Avatar Vermelho','assets/images/avatars/avatar_02.svg','geral',1,2,'2026-02-12 03:24:45'),(3,'Avatar Verde','assets/images/avatars/avatar_03.svg','geral',1,3,'2026-02-12 03:24:45'),(4,'Avatar Laranja','assets/images/avatars/avatar_04.svg','geral',1,4,'2026-02-12 03:24:45'),(5,'Avatar Roxo','assets/images/avatars/avatar_05.svg','geral',1,5,'2026-02-12 03:24:45'),(6,'Crianca Amarela','assets/images/avatars/avatar_kid_01.svg','infantil',1,6,'2026-02-12 03:24:45'),(7,'Crianca Rosa','assets/images/avatars/avatar_kid_02.svg','infantil',1,7,'2026-02-12 03:24:45'),(8,'Crianca Verde','assets/images/avatars/avatar_kid_03.svg','infantil',1,8,'2026-02-12 03:24:45');
/*!40000 ALTER TABLE `avatares` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `configuracoes_gerais`
--

LOCK TABLES `configuracoes_gerais` WRITE;
/*!40000 ALTER TABLE `configuracoes_gerais` DISABLE KEYS */;
INSERT INTO `configuracoes_gerais` (`id`, `chave`, `valor`, `descricao`, `tipo`, `created_at`, `updated_at`) VALUES (1,'categoria_adulto_ativa','0','Ativar categoria adulto no sistema','boolean','2026-02-12 02:53:32','2026-02-12 02:53:32'),(2,'pin_parental_padrao','0000','PIN padr??o para desbloqueio de conte??do adulto (ALTERAR EM PRODU????O)','string','2026-02-12 02:53:32','2026-02-12 02:53:32'),(3,'manutencao','0','Modo de manuten????o','boolean','2026-02-12 02:53:32','2026-02-12 02:53:32'),(4,'versao_app','1.0.0','Vers??o do aplicativo','string','2026-02-12 02:53:32','2026-02-12 02:53:32'),(5,'max_perfis_por_usuario','4','M??ximo de perfis por usu??rio','number','2026-02-12 02:53:32','2026-02-12 02:53:32');
/*!40000 ALTER TABLE `configuracoes_gerais` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `controle_financeiro`
--

LOCK TABLES `controle_financeiro` WRITE;
/*!40000 ALTER TABLE `controle_financeiro` DISABLE KEYS */;
/*!40000 ALTER TABLE `controle_financeiro` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `destaques_filmes`
--

LOCK TABLES `destaques_filmes` WRITE;
/*!40000 ALTER TABLE `destaques_filmes` DISABLE KEYS */;
INSERT INTO `destaques_filmes` (`id`, `provedor_id`, `categoria_nome`, `categoria_id_provedor`, `url_logo`, `ordem`, `ativo`, `created_at`, `updated_at`) VALUES (1,1,'Netflix','183','https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg',1,1,'2026-02-12 02:54:14','2026-02-12 12:11:28'),(2,1,'Max','141','https://upload.wikimedia.org/wikipedia/commons/4/4a/HBO_Max_logo.svg',2,1,'2026-02-12 02:54:14','2026-02-12 12:11:43'),(3,1,'Prime Video','136','https://upload.wikimedia.org/wikipedia/commons/f/f1/Prime_Video.png',3,1,'2026-02-12 02:54:14','2026-02-12 12:11:59'),(4,1,'Apple TV+','86','https://upload.wikimedia.org/wikipedia/commons/2/28/Apple_TV_Plus_Logo.svg',4,1,'2026-02-12 02:54:14','2026-02-12 02:54:14'),(5,1,'Disney+','59','https://upload.wikimedia.org/wikipedia/commons/3/3e/Disney%2B_logo.svg',5,1,'2026-02-12 02:54:14','2026-02-12 02:54:14'),(6,1,'Globoplay','55','https://upload.wikimedia.org/wikipedia/commons/8/82/Globoplay_logo_2023.svg',6,1,'2026-02-12 02:54:14','2026-02-12 02:54:14'),(7,1,'Star+','84','https://upload.wikimedia.org/wikipedia/commons/8/89/Star_Plus_logo.svg',7,1,'2026-02-12 02:54:14','2026-02-12 02:54:14');
/*!40000 ALTER TABLE `destaques_filmes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `destaques_kids`
--

LOCK TABLES `destaques_kids` WRITE;
/*!40000 ALTER TABLE `destaques_kids` DISABLE KEYS */;
INSERT INTO `destaques_kids` (`id`, `tipo_conteudo`, `conteudo_id`, `provedor_id`, `provedor_nome`, `categoria_id_provedor`, `url_logo`, `ordem`, `ativo`, `data_criacao`, `data_atualizacao`) VALUES (1,'filmes',1,1,'Netflix','42','https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg',1,1,'2026-02-12 02:54:14','2026-02-12 02:54:14'),(2,'filmes',2,1,'Netflix','42','https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg',2,1,'2026-02-12 02:54:14','2026-02-12 02:54:14'),(3,'series',1,1,'Netflix','42','https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg',3,1,'2026-02-12 02:54:14','2026-02-12 02:54:14'),(4,'tv',1,1,'Netflix','42','https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg',4,1,'2026-02-12 02:54:14','2026-02-12 02:54:14'),(5,'filmes',3,2,'Prime Video','50','https://upload.wikimedia.org/wikipedia/commons/f/f1/Prime_Video.png',1,1,'2026-02-12 02:54:14','2026-02-12 02:54:14'),(6,'series',2,2,'Prime Video','50','https://upload.wikimedia.org/wikipedia/commons/f/f1/Prime_Video.png',2,1,'2026-02-12 02:54:14','2026-02-12 02:54:14');
/*!40000 ALTER TABLE `destaques_kids` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `destaques_series`
--

LOCK TABLES `destaques_series` WRITE;
/*!40000 ALTER TABLE `destaques_series` DISABLE KEYS */;
/*!40000 ALTER TABLE `destaques_series` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `logs_sistema`
--

LOCK TABLES `logs_sistema` WRITE;
/*!40000 ALTER TABLE `logs_sistema` DISABLE KEYS */;
INSERT INTO `logs_sistema` (`id`, `tipo_usuario`, `usuario_id`, `acao`, `descricao`, `ip_address`, `user_agent`, `dados_adicionais`, `created_at`) VALUES (1,'',1,'login','Login realizado com sucesso','::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; pt-BR) WindowsPowerShell/5.1.26100.7705',NULL,'2026-02-12 03:22:31'),(2,'',1,'login','Login realizado com sucesso','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36',NULL,'2026-02-12 03:22:53'),(3,'',1,'login','Login realizado com sucesso','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0',NULL,'2026-02-12 03:24:53'),(4,'',1,'login','Login realizado com sucesso','192.168.100.172','Mozilla/5.0 (Web0S; Linux/SmartTV) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.79 Safari/537.36 WebAppManager',NULL,'2026-02-12 10:46:25'),(5,'',1,'login','Login realizado com sucesso','192.168.100.172','Mozilla/5.0 (Web0S; Linux/SmartTV) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.79 Safari/537.36 WebAppManager',NULL,'2026-02-12 10:46:25');
/*!40000 ALTER TABLE `logs_sistema` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `mensagens_provedor`
--

LOCK TABLES `mensagens_provedor` WRITE;
/*!40000 ALTER TABLE `mensagens_provedor` DISABLE KEYS */;
/*!40000 ALTER TABLE `mensagens_provedor` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `novidades_provedor`
--

LOCK TABLES `novidades_provedor` WRITE;
/*!40000 ALTER TABLE `novidades_provedor` DISABLE KEYS */;
/*!40000 ALTER TABLE `novidades_provedor` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `provedor_categorias_especiais`
--

LOCK TABLES `provedor_categorias_especiais` WRITE;
/*!40000 ALTER TABLE `provedor_categorias_especiais` DISABLE KEYS */;
/*!40000 ALTER TABLE `provedor_categorias_especiais` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `provedores`
--

LOCK TABLES `provedores` WRITE;
/*!40000 ALTER TABLE `provedores` DISABLE KEYS */;
INSERT INTO `provedores` (`id`, `numero_provedor`, `nome`, `email`, `senha`, `logo`, `banner`, `url_principal`, `url_backup_1`, `url_backup_2`, `categoria_adulto_id`, `categoria_infantil_id`, `ativo`, `data_vencimento`, `ultimo_acesso`, `created_at`, `updated_at`) VALUES (1,'0001','Provedor Teste','teste@teste.com','\\.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',NULL,NULL,'http://p2player.sbs',NULL,NULL,NULL,NULL,1,NULL,NULL,'2026-02-12 03:09:33','2026-02-12 03:09:33');
/*!40000 ALTER TABLE `provedores` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `refresh_tokens`
--

LOCK TABLES `refresh_tokens` WRITE;
/*!40000 ALTER TABLE `refresh_tokens` DISABLE KEYS */;
INSERT INTO `refresh_tokens` (`id`, `tipo_usuario`, `usuario_id`, `token`, `expira_em`, `revogado`, `ip_address`, `user_agent`, `created_at`) VALUES (1,'',1,'4f81ceaa8bc047a5f790fe9395c46fcb5bff59510413f4437468764c83636167','2026-03-14 00:22:31',0,'::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; pt-BR) WindowsPowerShell/5.1.26100.7705','2026-02-12 03:22:31'),(2,'',1,'0a0c14d092b414160e0e348ae04c33ec9855ce3c0a866da22814b00e316dced2','2026-03-14 00:22:53',0,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','2026-02-12 03:22:53'),(3,'',1,'c7b7eba05c173745fa4f1fabd87e30b330bec8c2bdbbc1861ae1833674d6f5f9','2026-03-14 00:24:53',0,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0','2026-02-12 03:24:53'),(4,'',1,'d9f561f29989d0e4ceccc0d1ef9d18b4e272739978f92bc8f16f470e00bcffc6','2026-03-14 07:46:25',0,'192.168.100.172','Mozilla/5.0 (Web0S; Linux/SmartTV) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.79 Safari/537.36 WebAppManager','2026-02-12 10:46:25'),(5,'',1,'45c288161f4d589793f4096f7ec40a615ec911255d6708995cdde9d7f6b5aa0f','2026-03-14 07:46:25',0,'192.168.100.172','Mozilla/5.0 (Web0S; Linux/SmartTV) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.79 Safari/537.36 WebAppManager','2026-02-12 10:46:25');
/*!40000 ALTER TABLE `refresh_tokens` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-02-12 10:50:26
