/*
  Warnings:

  - You are about to drop the `billiard_table_reservations` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `billiards_tables` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `menu_items` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `reservation_addons` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `users` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "PoolTableStatus" AS ENUM ('Available', 'Occupied', 'Maintenance');

-- CreateEnum
CREATE TYPE "PoolTableLightStatus" AS ENUM ('ON', 'OFF');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('Reserved', 'InProgress', 'Completed', 'Cancelled');

-- DropForeignKey
ALTER TABLE "billiard_table_reservations" DROP CONSTRAINT "billiard_table_reservations_tableId_fkey";

-- DropForeignKey
ALTER TABLE "billiard_table_reservations" DROP CONSTRAINT "billiard_table_reservations_userId_fkey";

-- DropForeignKey
ALTER TABLE "reservation_addons" DROP CONSTRAINT "reservation_addons_itemId_fkey";

-- DropForeignKey
ALTER TABLE "reservation_addons" DROP CONSTRAINT "reservation_addons_reservationId_fkey";

-- DropTable
DROP TABLE "billiard_table_reservations";

-- DropTable
DROP TABLE "billiards_tables";

-- DropTable
DROP TABLE "menu_items";

-- DropTable
DROP TABLE "reservation_addons";

-- DropTable
DROP TABLE "users";

-- DropEnum
DROP TYPE "BilliardTableStatus";

-- DropEnum
DROP TYPE "LightStatus";

-- DropEnum
DROP TYPE "Role";

-- CreateTable
CREATE TABLE "pool_tables" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "light_pin" TEXT NOT NULL,
    "light_status" "PoolTableLightStatus" NOT NULL DEFAULT 'OFF',
    "hourly_rate" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "status" "PoolTableStatus" NOT NULL DEFAULT 'Available',

    CONSTRAINT "pool_tables_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pool_bookings" (
    "id" SERIAL NOT NULL,
    "customer_name" TEXT,
    "tableId" INTEGER NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3),
    "durationHours" DOUBLE PRECISION,
    "hourlyRate" DOUBLE PRECISION NOT NULL,
    "totalPrice" DOUBLE PRECISION,
    "status" "BookingStatus" NOT NULL DEFAULT 'Reserved',
    "initialLightStatus" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pool_bookings_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "pool_bookings" ADD CONSTRAINT "pool_bookings_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "pool_tables"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
