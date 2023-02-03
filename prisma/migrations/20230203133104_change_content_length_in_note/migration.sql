/*
  Warnings:

  - Added the required column `type` to the `Note` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Note` ADD COLUMN `type` ENUM('TEXT', 'IMAGE', 'VIDEO', 'AUDIO', 'FILE') NOT NULL,
    MODIFY `content` VARCHAR(500) NOT NULL;
