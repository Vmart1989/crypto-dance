-- MySQL dump 10.13  Distrib 9.2.0, for Linux (x86_64)
--
-- Host: localhost    Database: cryptodance
-- ------------------------------------------------------
-- Server version	9.2.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `CryptoAsset`
--

DROP TABLE IF EXISTS `CryptoAsset`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `CryptoAsset` (
  `id` int NOT NULL AUTO_INCREMENT,
  `symbol` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `balance` double NOT NULL DEFAULT '0',
  `userId` int NOT NULL,
  `coinId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  KEY `CryptoAsset_userId_fkey` (`userId`),
  CONSTRAINT `CryptoAsset_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=54 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `CryptoAsset`
--

LOCK TABLES `CryptoAsset` WRITE;
/*!40000 ALTER TABLE `CryptoAsset` DISABLE KEYS */;
INSERT INTO `CryptoAsset` VALUES (42,'BTC',0.10004213,6,'bitcoin'),(43,'CRO',1.31,6,'crypto-com-coin'),(44,'ETH',0.15691,6,'ethereum'),(45,'SOL',2.0086,6,'solana'),(46,'PEPE',11214000,6,'pepe'),(47,'SHIB',1700000,6,'shiba-inu'),(48,'SOL',4,43,'solana'),(49,'ADA',100,43,'cardano'),(50,'LINK',2.5,43,'chainlink'),(51,'BTC',0.25,45,'bitcoin'),(52,'BNB',1,46,'binance-coin'),(53,'SUI',25,46,'sui');
/*!40000 ALTER TABLE `CryptoAsset` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Transaction`
--

DROP TABLE IF EXISTS `Transaction`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Transaction` (
  `id` int NOT NULL AUTO_INCREMENT,
  `type` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `cryptoSymbol` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `amount` double NOT NULL,
  `price` double NOT NULL,
  `fiatAmount` double NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `userId` int NOT NULL,
  `fiatCurrency` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'USD',
  `coinId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `Transaction_userId_fkey` (`userId`),
  CONSTRAINT `Transaction_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=108 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Transaction`
--

LOCK TABLES `Transaction` WRITE;
/*!40000 ALTER TABLE `Transaction` DISABLE KEYS */;
INSERT INTO `Transaction` VALUES (95,'buy','BTC',0.10004213,82694.72211291328,8272.956139933945,'2025-03-12 19:53:53.177',6,'USD','bitcoin'),(96,'buy','CRO',1.31,0.0809145778588123,0.1059980969950441,'2025-03-12 20:04:55.091',6,'USD','crypto-com-coin'),(97,'buy','ETH',0.15691,1877.994512937416,294.6761190250099,'2025-03-12 20:05:17.466',6,'USD','ethereum'),(98,'buy','SOL',2.0086,124.9629027841287,251.0004865322009,'2025-03-12 20:05:27.066',6,'USD','solana'),(99,'buy','PEPE',11214000,0.000006628485636,74.331837922104,'2025-03-12 20:05:46.328',6,'USD','pepe'),(100,'buy','SHIB',1700000,0.0000122649189697,20.85036224849,'2025-03-12 20:06:04.511',6,'USD','shiba-inu'),(101,'buy','SOL',4,125.9239508316011,503.6958033264042,'2025-03-12 22:23:18.507',43,'USD','solana'),(102,'buy','ADA',100,0.7327801909219978,73.27801909219977,'2025-03-12 22:23:24.606',43,'USD','cardano'),(103,'buy','LINK',5,13.44641763916423,67.23208819582115,'2025-03-12 22:23:31.154',43,'USD','chainlink'),(104,'sell','LINK',2.5,13.44641763916423,33.61604409791057,'2025-03-12 22:23:41.904',43,'USD','chainlink'),(105,'buy','BTC',0.25,83489.59189678569,20872.39797419642,'2025-03-12 22:33:58.882',45,'USD','bitcoin'),(106,'buy','BNB',1,577.1624426019333,577.1624426019333,'2025-03-13 18:44:39.960',46,'USD','binance-coin'),(107,'buy','SUI',25,2.152421822327242,53.81054555818105,'2025-03-13 18:45:03.568',46,'USD','sui');
/*!40000 ALTER TABLE `Transaction` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `User`
--

DROP TABLE IF EXISTS `User`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `User` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `role` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'user',
  PRIMARY KEY (`id`),
  UNIQUE KEY `User_email_key` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=49 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `User`
--

LOCK TABLES `User` WRITE;
/*!40000 ALTER TABLE `User` DISABLE KEYS */;
INSERT INTO `User` VALUES (2,'Juanpalomo@gmail.com','$2b$10$93GGD11knz0qgehquKIKPeROX.Vd4zdET55Fjqj8UHTvt4Jarft2y','Juan Palomo','2025-02-20 20:55:25.809','user'),(6,'victor.martinezsegura@gmail.com','$2b$10$6gaeWqtVbCevyEOSPdFL5uEtuchNk9duix4OYDc7NbK9ycq9t0qiW','Victorio','2025-02-26 18:22:14.039','admin'),(10,'juanillo@maravilla.com','$2b$10$GUCye7cC5stjbN3rWPhr2OxncM3PRNYTITWktagRIMKJ6gK3gWd6m','Juanillo','2025-02-26 19:34:15.073','user'),(12,'paco@hotmail.com','$2b$10$IRxxB8ybFXEO6HxKWVBc/uL3HnMWQc.pO4SW0rlKUSznHW/pI8DOi','Paco','2025-02-26 19:34:52.206','user'),(14,'lola@mola.com','$2b$10$m8lcO6U/9yxKFfPepMCoL.ykFw016ez1.09gyzSiZ6q.pA4xd9cWK','Lola','2025-02-26 19:38:41.719','user'),(43,'manue@blas.com','$2b$10$Duk3Q4R6kKWvrfVc81/GR.hNs/BCK8lIWfSYO4gG3CgGfgrjtyfhG','Manue','2025-03-04 21:26:25.161','user'),(45,'pepa@bueno.com','$2b$10$n5A5hImg.iZLRrenBaut.eWwFpkZRkgqWtxcdb7wzx7vthdueXNbO','Pepa Bueno','2025-03-12 22:33:37.764','user'),(46,'lolo@lolo.com','$2b$10$rqO6pK5.mL0MKDOjZOaVyOquWH/ly9dQ9dbVfORTW7DE/qb5a/qfO','Lolailo','2025-03-13 18:43:50.035','user'),(47,'nett1@net.com','$2b$10$bIVfGLR3afIcclObjnnf0uXTiyKbGiL7DdldAbbUaLE9WNH4/bdC6','Nett1','2025-03-13 18:59:14.573','admin'),(48,'nett2@nett.com','$2b$10$077cltguxmN3gdU8z0fJKOThxGsv01swA1PvUF5Y97CtSYzh3JMzG','nett2','2025-03-13 19:51:36.337','user');
/*!40000 ALTER TABLE `User` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Wallet`
--

DROP TABLE IF EXISTS `Wallet`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Wallet` (
  `id` int NOT NULL AUTO_INCREMENT,
  `fiatBalance` double NOT NULL DEFAULT '0',
  `userId` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Wallet_userId_key` (`userId`),
  CONSTRAINT `Wallet_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Wallet`
--

LOCK TABLES `Wallet` WRITE;
/*!40000 ALTER TABLE `Wallet` DISABLE KEYS */;
INSERT INTO `Wallet` VALUES (2,500,2),(6,1087.079056241255,6),(10,0,10),(11,0,12),(12,0,14),(31,137.0942706526084,43),(33,4127.602025803579,45),(34,869.0270118398856,46),(35,0,47),(36,0,48);
/*!40000 ALTER TABLE `Wallet` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `_prisma_migrations`
--

DROP TABLE IF EXISTS `_prisma_migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `checksum` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `logs` text COLLATE utf8mb4_unicode_ci,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `applied_steps_count` int unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `_prisma_migrations`
--

LOCK TABLES `_prisma_migrations` WRITE;
/*!40000 ALTER TABLE `_prisma_migrations` DISABLE KEYS */;
INSERT INTO `_prisma_migrations` VALUES ('12683d28-4e06-419f-9cae-f02f31d0a012','88bfb280ed806545338b9a0fdaebd866988769bdb70fca64cd5f8a17acd2fc0e','2025-03-09 12:05:50.077','20250309120550_add_fiat_currency_default',NULL,NULL,'2025-03-09 12:05:50.050',1),('3c021fec-8ac9-493a-b53d-9f7264c01176','a9892503529ed353787caa59ec5f307facf6a95b854b8a3214c97b752383d82f','2025-02-20 20:28:19.402','20250220202819_init',NULL,NULL,'2025-02-20 20:28:19.218',1),('4c60d557-4b6c-46dc-8300-c3f28abb1d57','5894490d33986828d2d25955b0635aa9fbbe357681c74b5f5e6d7971116f44cd','2025-03-12 21:36:02.139','20250312213602_add_user_role',NULL,NULL,'2025-03-12 21:36:02.102',1),('646da878-df23-49a6-95eb-9f7648b03e7f','1ce0608aaf4b863f5b637a25aaeabbcf6cfc546b255fd880c791e9b7babd9e8a','2025-03-09 21:51:00.392','20250309215100_add_coinid',NULL,NULL,'2025-03-09 21:51:00.338',1),('78e49695-0759-4dab-9ef2-194d5ee10d73','a5fd6130fb90db9db1fc5888308e6f40e17518ef4e02843f1b8bedd95d8a1c24','2025-03-04 19:45:39.498','20250304194539_add_crypto_asset',NULL,NULL,'2025-03-04 19:45:39.421',1),('8da242a3-3980-413a-a5ae-d8a68150902e','7d7b9dbe500851fe3bde0cacdc446b547c1b813dd0ba7be1ad99bc02313abe8a','2025-03-09 21:02:21.027','20250309210220_add_coin_id_fields',NULL,NULL,'2025-03-09 21:02:20.896',1);
/*!40000 ALTER TABLE `_prisma_migrations` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-03-13 21:10:41
