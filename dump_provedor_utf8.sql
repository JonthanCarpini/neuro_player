-- MariaDB dump 10.19  Distrib 10.4.32-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: soupet_provedor
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
-- Dumping data for table `avatares`
--

LOCK TABLES `avatares` WRITE;
/*!40000 ALTER TABLE `avatares` DISABLE KEYS */;
INSERT INTO `avatares` (`id`, `nome`, `arquivo`, `categoria`, `ativo`, `ordem`, `created_at`) VALUES (17,'Avatar Azul','assets/images/avatars/avatar_01.svg','geral',1,1,'2026-02-12 02:54:01'),(18,'Avatar Vermelho','assets/images/avatars/avatar_02.svg','geral',1,2,'2026-02-12 02:54:01'),(19,'Avatar Verde','assets/images/avatars/avatar_03.svg','geral',1,3,'2026-02-12 02:54:01'),(20,'Avatar Laranja','assets/images/avatars/avatar_04.svg','geral',1,4,'2026-02-12 02:54:01'),(21,'Avatar Roxo','assets/images/avatars/avatar_05.svg','geral',1,5,'2026-02-12 02:54:01'),(22,'Crian??a Amarela','assets/images/avatars/avatar_kid_01.svg','infantil',1,6,'2026-02-12 02:54:01'),(23,'Crian??a Rosa','assets/images/avatars/avatar_kid_02.svg','infantil',1,7,'2026-02-12 02:54:01'),(24,'Crian??a Verde','assets/images/avatars/avatar_kid_03.svg','infantil',1,8,'2026-02-12 02:54:01');
/*!40000 ALTER TABLE `avatares` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `cache_playlist`
--

LOCK TABLES `cache_playlist` WRITE;
/*!40000 ALTER TABLE `cache_playlist` DISABLE KEYS */;
/*!40000 ALTER TABLE `cache_playlist` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `favoritos`
--

LOCK TABLES `favoritos` WRITE;
/*!40000 ALTER TABLE `favoritos` DISABLE KEYS */;
/*!40000 ALTER TABLE `favoritos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `historico_visualizacao`
--

LOCK TABLES `historico_visualizacao` WRITE;
/*!40000 ALTER TABLE `historico_visualizacao` DISABLE KEYS */;
INSERT INTO `historico_visualizacao` (`id`, `perfil_id`, `tipo_conteudo`, `conteudo_id`, `nome`, `imagem`, `posicao_segundos`, `duracao_segundos`, `percentual_assistido`, `episodio_id`, `temporada`, `episodio`, `finalizado`, `dados_adicionais`, `ultima_visualizacao`, `created_at`) VALUES (1,1,'filme','608635','Salve Geral: Irmandade','https://image.tmdb.org/t/p/w780/rBUQeEBFOZQskflRcEPCu9KkGeG.jpg',4963,6260,79.28,'',NULL,NULL,0,NULL,'2026-02-12 09:13:28','2026-02-12 10:50:47');
/*!40000 ALTER TABLE `historico_visualizacao` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `perfis`
--

LOCK TABLES `perfis` WRITE;
/*!40000 ALTER TABLE `perfis` DISABLE KEYS */;
INSERT INTO `perfis` (`id`, `usuario_id`, `nome`, `avatar`, `tipo`, `pin_protegido`, `pin`, `infantil`, `ativo`, `created_at`, `updated_at`) VALUES (1,1,'Carpini','assets/images/avatars/avatar_01.svg','adicional',0,NULL,0,1,'2026-02-12 03:25:05','2026-02-12 03:25:05');
/*!40000 ALTER TABLE `perfis` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `recentes_tv`
--

LOCK TABLES `recentes_tv` WRITE;
/*!40000 ALTER TABLE `recentes_tv` DISABLE KEYS */;
INSERT INTO `recentes_tv` (`id`, `perfil_id`, `canal_id`, `nome`, `imagem`, `grupo`, `dados_adicionais`, `total_segundos_assistidos`, `ultimo_acesso`, `created_at`) VALUES (1,1,'636','SporTV 1 FHD','https://img.newfaston.top/icones_channels/SporTV_HD.png','SporTV','{\"category_id\":\"22\"}',21840,'2026-02-12 10:48:44','2026-02-12 03:26:34'),(640,1,'604280','Record MT - HD','https://raphmx00.com/record.png','Record TV','{\"category_id\":\"12\"}',120,'2026-02-12 09:20:24','2026-02-12 12:18:24'),(647,1,'525','AMC FHD','https://raphmx00.com/amc.png','Filmes e S├®ries','{\"category_id\":\"18\"}',120,'2026-02-12 09:22:44','2026-02-12 12:20:42');
/*!40000 ALTER TABLE `recentes_tv` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `recomendacoes`
--

LOCK TABLES `recomendacoes` WRITE;
/*!40000 ALTER TABLE `recomendacoes` DISABLE KEYS */;
/*!40000 ALTER TABLE `recomendacoes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` (`id`, `provedor_id`, `numero_provedor`, `login_provedor`, `nome`, `email`, `idioma`, `controle_parental_ativo`, `pin_parental`, `ativo`, `ultimo_acesso`, `dados_provedor`, `created_at`, `updated_at`) VALUES (1,1,'0001','carpini9140','carpini9140',NULL,'pt-BR',0,NULL,1,'2026-02-12 07:46:25','{\"password\":\"41990579551\",\"base_url\":\"http:\\/\\/p2player.sbs\",\"user_info\":{\"username\":\"carpini9140\",\"password\":\"41990579551\",\"message\":\"P2PLAYER\",\"auth\":1,\"status\":\"Active\",\"exp_date\":\"1772333999\",\"is_trial\":\"0\",\"active_cons\":1,\"created_at\":\"1769637604\",\"max_connections\":\"2\",\"allowed_output_formats\":[\"m3u8\",\"ts\",\"rtmp\"]}}','2026-02-12 03:22:31','2026-02-12 10:46:25');
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-02-12 10:49:27

