/*
  Warnings:

  - You are about to drop the `cars` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `properties` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "cars";

-- DropTable
DROP TABLE "properties";

-- CreateTable
CREATE TABLE "laptops" (
    "id" TEXT NOT NULL,
    "sellerId" TEXT,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "pricePi" INTEGER NOT NULL,
    "location" TEXT NOT NULL,
    "condition" TEXT NOT NULL,
    "year" INTEGER,
    "images" TEXT[],
    "isNew" BOOLEAN NOT NULL DEFAULT false,
    "sellerName" TEXT,
    "contactMethod" TEXT,
    "contactHandle" TEXT,
    "availability" TEXT,
    "negotiable" BOOLEAN NOT NULL DEFAULT true,
    "tradeIn" BOOLEAN NOT NULL DEFAULT false,
    "delivery" TEXT,
    "brand" TEXT,
    "model" TEXT,
    "processor" TEXT,
    "ram" TEXT,
    "storage" TEXT,
    "graphics" TEXT,
    "screenSize" TEXT,
    "resolution" TEXT,
    "operatingSystem" TEXT,
    "color" TEXT,
    "weight" TEXT,
    "batteryLife" TEXT,
    "scratches" TEXT,
    "screenCondition" TEXT,
    "keyboardCondition" TEXT,
    "trackpadCondition" TEXT,
    "ports" TEXT,
    "charger" TEXT,
    "repairHistory" TEXT,
    "accessories" TEXT[],
    "features" TEXT[],
    "safetyFeatures" TEXT[],
    "videoUrl" TEXT,
    "docs" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "laptops_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "phones" (
    "id" TEXT NOT NULL,
    "sellerId" TEXT,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "pricePi" INTEGER NOT NULL,
    "location" TEXT NOT NULL,
    "condition" TEXT NOT NULL,
    "year" INTEGER,
    "images" TEXT[],
    "isNew" BOOLEAN NOT NULL DEFAULT false,
    "sellerName" TEXT,
    "contactMethod" TEXT,
    "contactHandle" TEXT,
    "availability" TEXT,
    "negotiable" BOOLEAN NOT NULL DEFAULT true,
    "tradeIn" BOOLEAN NOT NULL DEFAULT false,
    "delivery" TEXT,
    "brand" TEXT,
    "model" TEXT,
    "storage" TEXT,
    "color" TEXT,
    "screenSize" TEXT,
    "operatingSystem" TEXT,
    "processor" TEXT,
    "ram" TEXT,
    "batteryCapacity" TEXT,
    "cameraSpecs" TEXT,
    "connectivity" TEXT[],
    "scratches" TEXT,
    "screenCondition" TEXT,
    "batteryHealth" TEXT,
    "chargingPort" TEXT,
    "speakers" TEXT,
    "buttons" TEXT,
    "waterDamage" TEXT,
    "repairHistory" TEXT,
    "accessories" TEXT[],
    "features" TEXT[],
    "safetyFeatures" TEXT[],
    "videoUrl" TEXT,
    "docs" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "phones_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "laptops" ADD CONSTRAINT "laptops_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phones" ADD CONSTRAINT "phones_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
