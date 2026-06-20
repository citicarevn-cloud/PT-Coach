-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "dateOfBirth" DATETIME,
    "sex" TEXT NOT NULL DEFAULT 'UNSPECIFIED',
    "heightCm" REAL,
    "targetWeightKg" REAL,
    "targetDate" DATETIME,
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Ho_Chi_Minh',
    "weeklyCheckInDay" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "InbodyHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "measuredAt" DATETIME NOT NULL,
    "weightKg" REAL NOT NULL,
    "bmi" REAL,
    "bodyFatPercent" REAL,
    "fatMassKg" REAL,
    "muscleMassKg" REAL,
    "boneMassKg" REAL,
    "bmrKcal" INTEGER NOT NULL,
    "bodyAge" INTEGER,
    "obesityLevel" TEXT,
    "bodyType" TEXT,
    "sourceImageUrl" TEXT,
    "ocrConfidence" REAL,
    "rawOcrData" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "InbodyHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WorkoutLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "performedAt" DATETIME NOT NULL,
    "activityType" TEXT NOT NULL DEFAULT 'OTHER',
    "distanceKm" REAL,
    "durationSeconds" INTEGER NOT NULL,
    "avgPaceSecondsPerKm" INTEGER,
    "avgHeartRateBpm" INTEGER,
    "activeCaloriesKcal" INTEGER NOT NULL,
    "sourceImageUrl" TEXT,
    "sourceProvider" TEXT,
    "rawOcrData" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WorkoutLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DailyNutrition" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "tdeeKcal" INTEGER NOT NULL,
    "targetCaloriesKcal" INTEGER NOT NULL,
    "deficitKcal" INTEGER NOT NULL,
    "proteinGrams" INTEGER NOT NULL,
    "fatGrams" INTEGER NOT NULL,
    "carbGrams" INTEGER NOT NULL,
    "calciumFocus" BOOLEAN NOT NULL DEFAULT false,
    "meals" JSONB NOT NULL,
    "consumedCalories" INTEGER NOT NULL DEFAULT 0,
    "consumedProtein" REAL NOT NULL DEFAULT 0,
    "consumedFat" REAL NOT NULL DEFAULT 0,
    "consumedCarbs" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "DailyNutrition_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ExerciseLibrary" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "activityType" TEXT NOT NULL,
    "durationMinutes" INTEGER,
    "sets" INTEGER,
    "repsOrTime" TEXT,
    "estimatedKcal" INTEGER,
    "youtubeUrl" TEXT NOT NULL,
    "channelHandle" TEXT NOT NULL DEFAULT '@HubertCu',
    "formInstructions" TEXT NOT NULL,
    "injuryWarnings" TEXT NOT NULL,
    "muscleGroups" JSONB,
    "difficulty" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "InbodyHistory_userId_measuredAt_idx" ON "InbodyHistory"("userId", "measuredAt");

-- CreateIndex
CREATE INDEX "WorkoutLog_userId_performedAt_idx" ON "WorkoutLog"("userId", "performedAt");

-- CreateIndex
CREATE INDEX "DailyNutrition_userId_date_idx" ON "DailyNutrition"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "DailyNutrition_userId_date_key" ON "DailyNutrition"("userId", "date");

-- CreateIndex
CREATE INDEX "ExerciseLibrary_activityType_isActive_idx" ON "ExerciseLibrary"("activityType", "isActive");
