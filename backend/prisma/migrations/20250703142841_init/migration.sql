/*
  Warnings:

  - You are about to drop the `Lights` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Lights";

-- CreateTable
CREATE TABLE "lights" (
    "lightId" TEXT NOT NULL,
    "status" "LightStatus" NOT NULL DEFAULT 'OFF',
    "name" TEXT NOT NULL,

    CONSTRAINT "lights_pkey" PRIMARY KEY ("lightId")
);

-- CreateIndex
CREATE UNIQUE INDEX "lights_lightId_key" ON "lights"("lightId");
