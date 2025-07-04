/*
  Warnings:

  - You are about to drop the `lights` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "BillyardTableStatus" AS ENUM ('KOSONG', 'BERMAIN', 'SELESAI');

-- DropTable
DROP TABLE "lights";

-- CreateTable
CREATE TABLE "billyards_tables" (
    "id" SERIAL NOT NULL,
    "light_status" "LightStatus" NOT NULL DEFAULT 'OFF',
    "status" "BillyardTableStatus" NOT NULL DEFAULT 'KOSONG',
    "esp_pin" TEXT,
    "start_time" TIMESTAMP(3),
    "end_time" TIMESTAMP(3),
    "crated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "billyards_tables_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "billyards_tables_id_key" ON "billyards_tables"("id");
