/*
  Warnings:

  - The primary key for the `lights` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `lightId` on the `lights` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[id]` on the table `lights` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `id` to the `lights` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "lights_lightId_key";

-- AlterTable
ALTER TABLE "lights" DROP CONSTRAINT "lights_pkey",
DROP COLUMN "lightId",
ADD COLUMN     "id" INTEGER NOT NULL,
ADD CONSTRAINT "lights_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "lights_id_key" ON "lights"("id");
