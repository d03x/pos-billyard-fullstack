-- CreateEnum
CREATE TYPE "LightStatus" AS ENUM ('ON', 'OFF');

-- CreateTable
CREATE TABLE "Lights" (
    "lightId" TEXT NOT NULL,
    "status" "LightStatus" NOT NULL DEFAULT 'OFF',
    "name" TEXT NOT NULL,

    CONSTRAINT "Lights_pkey" PRIMARY KEY ("lightId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Lights_lightId_key" ON "Lights"("lightId");
