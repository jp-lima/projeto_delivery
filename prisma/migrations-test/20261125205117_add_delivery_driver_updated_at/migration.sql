-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_DeliveryDriver" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "vehicle" TEXT,
    "licensePlate" TEXT,
    "available" BOOLEAN NOT NULL DEFAULT true,
    "balance" DECIMAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DeliveryDriver_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_DeliveryDriver" ("available", "balance", "createdAt", "id", "licensePlate", "userId", "vehicle") SELECT "available", "balance", "createdAt", "id", "licensePlate", "userId", "vehicle" FROM "DeliveryDriver";
DROP TABLE "DeliveryDriver";
ALTER TABLE "new_DeliveryDriver" RENAME TO "DeliveryDriver";
CREATE UNIQUE INDEX "DeliveryDriver_userId_key" ON "DeliveryDriver"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
