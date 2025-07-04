/*
  Warnings:

  - You are about to drop the `billyard_table_reservations` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `billyards_tables` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "BilliardTableStatus" AS ENUM ('KOSONG', 'BERMAIN', 'SELESAI');

-- DropForeignKey
ALTER TABLE "billyard_table_reservations" DROP CONSTRAINT "billyard_table_reservations_tableId_fkey";

-- DropForeignKey
ALTER TABLE "billyard_table_reservations" DROP CONSTRAINT "billyard_table_reservations_userId_fkey";

-- DropForeignKey
ALTER TABLE "reservation_addons" DROP CONSTRAINT "reservation_addons_reservationId_fkey";

-- DropTable
DROP TABLE "billyard_table_reservations";

-- DropTable
DROP TABLE "billyards_tables";

-- DropEnum
DROP TYPE "BillyardTableStatus";

-- CreateTable
CREATE TABLE "billiards_tables" (
    "id" SERIAL NOT NULL,
    "light_status" "LightStatus" NOT NULL DEFAULT 'OFF',
    "name" TEXT NOT NULL,
    "status" "BilliardTableStatus" NOT NULL DEFAULT 'KOSONG',
    "esp_pin" TEXT,
    "start_time" TIMESTAMP(3),
    "end_time" TIMESTAMP(3),
    "crated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "pricePerHour" DOUBLE PRECISION DEFAULT 0,

    CONSTRAINT "billiards_tables_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "billiard_table_reservations" (
    "id" SERIAL NOT NULL,
    "tableId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endTime" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "totalPrice" DOUBLE PRECISION DEFAULT 0,
    "customer_name" TEXT,

    CONSTRAINT "billiard_table_reservations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "billiards_tables_id_key" ON "billiards_tables"("id");

-- CreateIndex
CREATE UNIQUE INDEX "billiards_tables_name_key" ON "billiards_tables"("name");

-- CreateIndex
CREATE UNIQUE INDEX "billiard_table_reservations_id_key" ON "billiard_table_reservations"("id");

-- CreateIndex
CREATE UNIQUE INDEX "billiard_table_reservations_tableId_key" ON "billiard_table_reservations"("tableId");

-- AddForeignKey
ALTER TABLE "billiard_table_reservations" ADD CONSTRAINT "billiard_table_reservations_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "billiards_tables"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "billiard_table_reservations" ADD CONSTRAINT "billiard_table_reservations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservation_addons" ADD CONSTRAINT "reservation_addons_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "billiard_table_reservations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
