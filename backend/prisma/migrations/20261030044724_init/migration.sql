-- CreateTable
CREATE TABLE "articulos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sku" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL DEFAULT '',
    "costoBase" REAL NOT NULL,
    "utilidad" REAL NOT NULL,
    "pvp" REAL NOT NULL,
    "overridePrecio" BOOLEAN NOT NULL DEFAULT false,
    "precioManual" REAL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "imagenUrl" TEXT NOT NULL DEFAULT '',
    "imagenPublicId" TEXT,
    "estado" TEXT NOT NULL DEFAULT 'Disponible',
    "fechaActualizacion" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "rol" TEXT NOT NULL DEFAULT 'ADMIN',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "articulos_sku_key" ON "articulos"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");
