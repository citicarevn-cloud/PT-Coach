-- CreateTable
CREATE TABLE "DailyTracker" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "waterCompleted" BOOLEAN NOT NULL DEFAULT false,
    "workoutCompleted" BOOLEAN NOT NULL DEFAULT false,
    "dietCompleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "DailyTracker_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "DailyTracker_userId_date_idx" ON "DailyTracker"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "DailyTracker_userId_date_key" ON "DailyTracker"("userId", "date");
