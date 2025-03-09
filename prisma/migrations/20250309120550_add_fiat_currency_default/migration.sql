-- AlterTable
ALTER TABLE `Transaction` ADD COLUMN `fiatCurrency` VARCHAR(191) NOT NULL DEFAULT 'USD';
