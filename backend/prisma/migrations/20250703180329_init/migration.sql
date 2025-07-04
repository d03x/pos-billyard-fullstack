-- AlterTable
ALTER TABLE "billyard_table_reservations" ADD COLUMN     "totalPrice" DOUBLE PRECISION DEFAULT 0;

-- AlterTable
ALTER TABLE "billyards_tables" ADD COLUMN     "pricePerHour" DOUBLE PRECISION DEFAULT 0;

-- CreateTable
CREATE TABLE "reservation_addons" (
    "id" SERIAL NOT NULL,
    "reservationId" INTEGER NOT NULL,
    "itemId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reservation_addons_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "reservation_addons_id_key" ON "reservation_addons"("id");

-- AddForeignKey
ALTER TABLE "reservation_addons" ADD CONSTRAINT "reservation_addons_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "billyard_table_reservations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservation_addons" ADD CONSTRAINT "reservation_addons_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "menu_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
