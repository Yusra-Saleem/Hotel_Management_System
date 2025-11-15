-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" DATETIME,
    "passwordHash" TEXT,
    "image" TEXT,
    "lastLoginAt" DATETIME,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "failedLoginAttempts" INTEGER NOT NULL DEFAULT 0,
    "lastFailedLoginAttempt" DATETIME,
    "role" TEXT NOT NULL DEFAULT 'GUEST'
);
INSERT INTO "new_User" ("email", "emailVerified", "id", "image", "isActive", "lastLoginAt", "name", "passwordHash", "role") SELECT "email", "emailVerified", "id", "image", "isActive", "lastLoginAt", "name", "passwordHash", "role" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
