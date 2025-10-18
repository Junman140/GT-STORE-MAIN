-- CreateTable
CREATE TABLE "properties" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "pricePi" INTEGER NOT NULL,
    "location" TEXT NOT NULL,
    "beds" INTEGER,
    "baths" INTEGER,
    "area" TEXT,
    "images" TEXT[],
    "isNew" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'For sale',
    "yearBuilt" INTEGER,
    "floor" INTEGER,
    "totalFloors" INTEGER,
    "heating" TEXT,
    "energyRating" TEXT,
    "parking" TEXT,
    "furnished" TEXT,
    "petsAllowed" TEXT,
    "balcony" TEXT,
    "garden" TEXT,
    "storage" TEXT,
    "lotSizeSqm" INTEGER,
    "hoaFeesPi" INTEGER,
    "taxesPi" INTEGER,
    "eircode" TEXT,
    "propertyId" TEXT,
    "features" TEXT[],
    "safetyFeatures" TEXT[],
    "contactMethod" TEXT,
    "contactHandle" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "properties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cars" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "pricePi" INTEGER NOT NULL,
    "location" TEXT NOT NULL,
    "mileage" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "images" TEXT[],
    "isNew" BOOLEAN NOT NULL DEFAULT false,
    "sellerName" TEXT,
    "contactMethod" TEXT,
    "contactHandle" TEXT,
    "availability" TEXT,
    "negotiable" BOOLEAN NOT NULL DEFAULT true,
    "tradeIn" BOOLEAN NOT NULL DEFAULT false,
    "delivery" TEXT,
    "make" TEXT,
    "model" TEXT,
    "trim" TEXT,
    "body" TEXT,
    "fuel" TEXT,
    "transmission" TEXT,
    "drivetrain" TEXT,
    "engine" TEXT,
    "powerKW" INTEGER,
    "powerBHP" INTEGER,
    "consumptionL100" DOUBLE PRECISION,
    "consumptionKWh100" DOUBLE PRECISION,
    "emissions" INTEGER,
    "owners" INTEGER,
    "nctExpiry" TEXT,
    "taxExpiry" TEXT,
    "serviceHistory" TEXT,
    "lastServiceAtKm" INTEGER,
    "lastServiceDate" TEXT,
    "accidentHistory" TEXT,
    "currentFaults" TEXT,
    "tyres" TEXT,
    "brakes" TEXT,
    "keys" INTEGER,
    "conditionNotes" TEXT,
    "modifications" TEXT,
    "financeCleared" BOOLEAN NOT NULL DEFAULT false,
    "doors" INTEGER,
    "seats" INTEGER,
    "color" TEXT,
    "bootL" INTEGER,
    "wheelbaseMm" INTEGER,
    "weightKg" INTEGER,
    "vin" TEXT,
    "reg" TEXT,
    "features" TEXT[],
    "safetyFeatures" TEXT[],
    "videoUrl" TEXT,
    "docs" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cars_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "user_uid" TEXT NOT NULL,
    "piUsername" TEXT,
    "from_address" TEXT,
    "to_address" TEXT,
    "role" TEXT NOT NULL DEFAULT 'reader',
    "avatar" TEXT,
    "bio" VARCHAR(500),
    "piAccessToken" TEXT,
    "piAuthenticatedAt" TIMESTAMP(3),
    "piAppId" TEXT,
    "piReceivingEmail" BOOLEAN NOT NULL DEFAULT false,
    "piCredentials" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seller_applications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "businessName" TEXT NOT NULL,
    "businessType" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "ownershipProof" TEXT[],
    "status" TEXT NOT NULL DEFAULT 'pending',
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "seller_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "donations" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "piPaymentId" TEXT NOT NULL,
    "txid" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "memo" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "donations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chats" (
    "id" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "listingType" TEXT,
    "listingId" TEXT,
    "lastMessage" TEXT,
    "lastMessageAt" TIMESTAMP(3),
    "unreadCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" TEXT NOT NULL,
    "chatId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "messageType" TEXT NOT NULL DEFAULT 'text',
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_user_uid_key" ON "users"("user_uid");

-- CreateIndex
CREATE UNIQUE INDEX "users_piUsername_key" ON "users"("piUsername");

-- CreateIndex
CREATE UNIQUE INDEX "seller_applications_userId_key" ON "seller_applications"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "donations_piPaymentId_key" ON "donations"("piPaymentId");

-- CreateIndex
CREATE UNIQUE INDEX "chats_senderId_receiverId_listingType_listingId_key" ON "chats"("senderId", "receiverId", "listingType", "listingId");

-- AddForeignKey
ALTER TABLE "seller_applications" ADD CONSTRAINT "seller_applications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "donations" ADD CONSTRAINT "donations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chats" ADD CONSTRAINT "chats_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chats" ADD CONSTRAINT "chats_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "chats"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
