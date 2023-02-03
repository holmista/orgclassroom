/*
  Warnings:

  - Added the required column `authProvider` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `authProviderId` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `User` ADD COLUMN `authProvider` VARCHAR(191) NOT NULL,
    ADD COLUMN `authProviderId` VARCHAR(191) NOT NULL;
