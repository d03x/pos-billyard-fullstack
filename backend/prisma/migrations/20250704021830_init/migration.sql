-- DropForeignKey
ALTER TABLE "billiard_table_reservations" DROP CONSTRAINT "billiard_table_reservations_userId_fkey";

-- AlterTable
ALTER TABLE "billiard_table_reservations" ALTER COLUMN "userId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "billiard_table_reservations" ADD CONSTRAINT "billiard_table_reservations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
