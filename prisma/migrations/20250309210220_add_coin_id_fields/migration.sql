/*
  Warnings:

  - Added the required column `coinId` to the `CryptoAsset` table without a default value. This is not possible if the table is not empty.
  - Added the required column `coinId` to the `Transaction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `CryptoAsset` ADD COLUMN `coinId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `Transaction` ADD COLUMN `coinId` VARCHAR(191) NOT NULL;
