/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `billyards_tables` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `name` to the `billyards_tables` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "billyards_tables" ADD COLUMN     "name" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "billyards_tables_name_key" ON "billyards_tables"("name");
