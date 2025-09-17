-- Create tables and indexes for baseline nutrition tracking schema
CREATE TABLE "User" (
  "id" TEXT PRIMARY KEY,
  "email" TEXT NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

CREATE TABLE "OnboardingProfile" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "birthDate" DATETIME NOT NULL,
  "sex" TEXT NOT NULL,
  "heightCm" REAL NOT NULL,
  "activityLevel" TEXT NOT NULL,
  "goals" TEXT NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "OnboardingProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "OnboardingProfile_userId_key" ON "OnboardingProfile"("userId");

CREATE TABLE "DailyIntakeEntry" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "consumedAt" DATETIME NOT NULL,
  "meal" TEXT NOT NULL,
  "item" TEXT NOT NULL,
  "calories" INTEGER NOT NULL,
  "proteinGrams" REAL NOT NULL DEFAULT 0,
  "carbsGrams" REAL NOT NULL DEFAULT 0,
  "fatGrams" REAL NOT NULL DEFAULT 0,
  "sodiumMg" INTEGER NOT NULL DEFAULT 0,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "DailyIntakeEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "DailyIntakeEntry_userId_consumedAt_idx" ON "DailyIntakeEntry"("userId", "consumedAt");

CREATE TABLE "DailyBodyMetric" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "recordedAt" DATETIME NOT NULL,
  "weightKg" REAL NOT NULL,
  "bodyFatPercentage" REAL,
  "restingHeartRate" INTEGER,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "DailyBodyMetric_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "DailyBodyMetric_userId_recordedAt_idx" ON "DailyBodyMetric"("userId", "recordedAt");
