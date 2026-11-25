/*
  Warnings:

  - You are about to drop the column `imageUrl` on the `MenuItem` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_MenuItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "restaurantId" TEXT NOT NULL,
    "categoryId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DECIMAL NOT NULL,
    "available" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MenuItem_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "MenuItem_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_MenuItem" ("available", "categoryId", "createdAt", "description", "id", "name", "price", "restaurantId", "updatedAt") SELECT "available", "categoryId", "createdAt", "description", "id", "name", "price", "restaurantId", "updatedAt" FROM "MenuItem";
DROP TABLE "MenuItem";
ALTER TABLE "new_MenuItem" RENAME TO "MenuItem";
CREATE INDEX "MenuItem_restaurantId_idx" ON "MenuItem"("restaurantId");
CREATE INDEX "MenuItem_categoryId_idx" ON "MenuItem"("categoryId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- Seed data
INSERT INTO "User" ("id", "name", "email", "phone", "passwordHash", "role", "createdAt", "updatedAt") VALUES
('49d470e9-2c27-495a-aa65-949605979e51', 'João Cliente', 'joao@email.com', '11999990001', 'hash', 'customer', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('ee192f4a-ec8a-4330-b78e-f0e83b2cf977', 'Maria Restaurante', 'maria@restaurante.com', '11999990002', 'hash', 'restaurant_admin', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('1bc48a60-21c4-4587-ad01-b0a0f355428b', 'Carlos Entregador', 'carlos@driver.com', '11999990003', 'hash', 'driver', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO "DeliveryDriver" ("id", "userId", "vehicle", "licensePlate", "available", "balance", "createdAt") VALUES
('b2f36355-0e8b-46ba-a7b8-c0385db3809b', '1bc48a60-21c4-4587-ad01-b0a0f355428b', 'moto', 'ABC1D23', true, 0, CURRENT_TIMESTAMP);

INSERT INTO "Address" ("id", "userId", "street", "number", "neighborhood", "city", "state", "cep", "complement", "isDefault", "createdAt") VALUES
('2cd9b020-1aac-43bf-a7c0-0456b7c7f36c', NULL, 'Rua do Restaurante', '100', 'Centro', 'São Paulo', 'SP', '01001000', 'Sala 1', false, CURRENT_TIMESTAMP),
('8315c4e2-9746-48b4-828c-241abce0a83c', '49d470e9-2c27-495a-aa65-949605979e51', 'Rua do Cliente', '50', 'Jardins', 'São Paulo', 'SP', '01415001', 'Apto 12', true, CURRENT_TIMESTAMP);

INSERT INTO "Category" ("id", "name", "description", "createdAt") VALUES
('15d4ecfc-c6f0-4e10-bdf8-f3cf2a8da582', 'Hambúrguer', 'Lanches e hambúrgueres artesanais', CURRENT_TIMESTAMP),
('fcbb58f7-28a3-47c5-b455-e5e2a2cd7d99', 'Bebidas', 'Refrigerantes, sucos e bebidas em geral', CURRENT_TIMESTAMP);

INSERT INTO "Restaurant" ("id", "adminId", "name", "cnpj", "phone", "addressId", "categoryId", "openingHours", "deliveryFee", "status", "createdAt", "updatedAt") VALUES
('33f9ae6e-d111-4d73-9382-4cc45c39fca6', 'ee192f4a-ec8a-4330-b78e-f0e83b2cf977', 'Burger do Zé', '12.345.678/0001-90', '1133334444', '2cd9b020-1aac-43bf-a7c0-0456b7c7f36c', '15d4ecfc-c6f0-4e10-bdf8-f3cf2a8da582', '{"mon":"10:00-22:00"}', 5.00, 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO "MenuItem" ("id", "restaurantId", "categoryId", "name", "description", "price", "available", "createdAt", "updatedAt") VALUES
('743d8bc1-5c9a-4197-bd7b-6ee8ae85f585', '33f9ae6e-d111-4d73-9382-4cc45c39fca6', '15d4ecfc-c6f0-4e10-bdf8-f3cf2a8da582', 'Cheeseburger', 'Pão, carne e queijo', 25.90, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('75b5f717-756d-441a-b71d-071ad0478eef', '33f9ae6e-d111-4d73-9382-4cc45c39fca6', '15d4ecfc-c6f0-4e10-bdf8-f3cf2a8da582', 'Batata Frita', 'Porção de batatas fritas', 15.00, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('988ec89e-418f-4ae7-b7de-e736782074ed', '33f9ae6e-d111-4d73-9382-4cc45c39fca6', 'fcbb58f7-28a3-47c5-b455-e5e2a2cd7d99', 'Refrigerante', 'Lata 350ml', 6.50, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO "Order" ("id", "customerId", "restaurantId", "driverId", "addressId", "status", "total", "deliveryFee", "discount", "notes", "createdAt", "updatedAt") VALUES
('fba1ce14-5c4f-4299-b1d8-18b821eeb145', '49d470e9-2c27-495a-aa65-949605979e51', '33f9ae6e-d111-4d73-9382-4cc45c39fca6', 'b2f36355-0e8b-46ba-a7b8-c0385db3809b', '8315c4e2-9746-48b4-828c-241abce0a83c', 'DELIVERED', 43.90, 5.00, 0, 'Sem cebola', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO "OrderItem" ("id", "orderId", "menuItemId", "unitPrice", "quantity", "subtotal") VALUES
('c6415dfe-9780-4bf9-a6fe-e01f748b2b8e', 'fba1ce14-5c4f-4299-b1d8-18b821eeb145', '743d8bc1-5c9a-4197-bd7b-6ee8ae85f585', 25.90, 1, 25.90),
('f7751ce1-19e9-4ca7-b356-48b5f70d4599', 'fba1ce14-5c4f-4299-b1d8-18b821eeb145', '988ec89e-418f-4ae7-b7de-e736782074ed', 6.50, 2, 13.00);

INSERT INTO "Payment" ("id", "orderId", "method", "amount", "status", "paidAt", "createdAt", "updatedAt") VALUES
('daebb8a2-15de-40ab-ac41-c59d1aba099c', 'fba1ce14-5c4f-4299-b1d8-18b821eeb145', 'pix', 43.90, 'paid', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO "Review" ("id", "orderId", "customerId", "restaurantId", "driverId", "restaurantRating", "driverRating", "comment", "createdAt") VALUES
('319f06a3-0982-41a1-b3ba-bd580e201318', 'fba1ce14-5c4f-4299-b1d8-18b821eeb145', '49d470e9-2c27-495a-aa65-949605979e51', '33f9ae6e-d111-4d73-9382-4cc45c39fca6', 'b2f36355-0e8b-46ba-a7b8-c0385db3809b', 5, 5, 'Tudo perfeito!', CURRENT_TIMESTAMP);
