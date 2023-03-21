/*
  Warnings:

  - A unique constraint covering the columns `[userId,title]` on the table `Subject` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX `Subject_title_key` ON `Subject`;

-- CreateIndex
CREATE UNIQUE INDEX `Subject_userId_title_key` ON `Subject`(`userId`, `title`);
