/*
  Warnings:

  - You are about to alter the column `bmrKcal` on the `InbodyHistory` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Float`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_InbodyHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "measuredAt" DATETIME NOT NULL,
    "weightKg" REAL NOT NULL,
    "bmi" REAL,
    "bodyFatPercent" REAL,
    "fatMassKg" REAL,
    "muscleMassKg" REAL,
    "boneMassKg" REAL,
    "bmrKcal" REAL NOT NULL,
    "bodyAge" INTEGER,
    "obesityLevel" TEXT,
    "bodyType" TEXT,
    "sourceImageUrl" TEXT,
    "ocrConfidence" REAL,
    "rawOcrData" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "InbodyHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_InbodyHistory" ("bmi", "bmrKcal", "bodyAge", "bodyFatPercent", "bodyType", "boneMassKg", "createdAt", "fatMassKg", "id", "measuredAt", "muscleMassKg", "obesityLevel", "ocrConfidence", "rawOcrData", "sourceImageUrl", "userId", "weightKg") SELECT "bmi", "bmrKcal", "bodyAge", "bodyFatPercent", "bodyType", "boneMassKg", "createdAt", "fatMassKg", "id", "measuredAt", "muscleMassKg", "obesityLevel", "ocrConfidence", "rawOcrData", "sourceImageUrl", "userId", "weightKg" FROM "InbodyHistory";
DROP TABLE "InbodyHistory";
ALTER TABLE "new_InbodyHistory" RENAME TO "InbodyHistory";
CREATE INDEX "InbodyHistory_userId_measuredAt_idx" ON "InbodyHistory"("userId", "measuredAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
