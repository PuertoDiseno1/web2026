-- CreateTable
CREATE TABLE "HomeGridSlot" (
    "id" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "image" TEXT NOT NULL,
    "projectSlug" TEXT,
    "projectTitle" TEXT NOT NULL DEFAULT '',
    "category" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HomeGridSlot_pkey" PRIMARY KEY ("id")
);
