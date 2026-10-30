# 💎 CHESKY — Sistema de Inventario y Catálogo Web de Bisutería

Sistema web fullstack modular, moderno y de alto rendimiento diseñado para la gestión de inventario, cálculo automatizado de márgenes de ganancia y catálogo de ventas en línea para piezas de bisutería fina.

---

## 🎯 Arquitectura del Sistema

El proyecto cuenta con dos vistas principales estrictamente desacopladas a nivel de presentación y seguridad:

1. **Modo Cliente (Catálogo Público)**
   - Galería responsiva tipo mosaico con carga diferida de imágenes (*Lazy Loading*).
   - Buscador en tiempo real por SKU, nombre y descripción con filtrado dinámico por categoría.
   - **Privacidad y Seguridad Financiera:** Los campos de `costoBase` y `utilidad` están estrictamente excluidos de las consultas y respuestas públicas en la API.
   - Integración directa con WhatsApp mediante botón dinámico:
     ```text
     "¡Hola! Me interesa este producto: [Nombre] - SKU: [SKU] - Precio: $[PVP]"
     ```
   - Sello visual **"Agotado"** y deshabilitación automática del botón de compra cuando el stock llega a 0.

2. **Modo Administrador (Panel Interno Protegido)**
   - Autenticación segura mediante **JSON Web Tokens (JWT)** y contraseñas cifradas con `bcryptjs`.
   - **Dashboard Financiero y Métricas Rápidas:**
     - Total de piezas en inventario físico y referencias únicas (SKUs).
     - Valor total del inventario invertido (Costos).
     - Proyección de ganancia bruta estimada y margen global promedio.
     - Detección de artículos agotados y alertas de bajo stock ($\le 3$ unidades).
   - **CRUD Completo:**
     - Subida de fotografías en tiempo real conectada a **Cloudinary** (con fallback automático a almacenamiento local si no hay credenciales configuradas).
     - Recálculo dinámico del PVP en pantalla conforme se ajusta el costo o el % de utilidad.
     - Modalidad **Override de Precio** para fijar manualmente precios de venta al público cerrados.
     - Gestión de stock y estados (`Disponible`, `Agotado`, `Oculto`).
   - **Módulo de Exportación:** Descarga de inventario en formato **CSV compatible con Microsoft Excel** (codificado con UTF-8 BOM y delimitador `;` para preservar acentos y caracteres especiales en español).

---

## 📁 Estructura del Proyecto

```
CHESKY/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma        # Modelo Articulo, Usuario y Enums relacionales
│   │   └── seed.js              # Semilla inicial con admin y catálogo de muestra
│   ├── src/
│   │   ├── config/
│   │   │   └── cloudinary.js    # Conexión al servicio de imágenes en la nube
│   │   ├── controllers/
│   │   │   ├── articuloController.js   # Lógica CRUD y filtros del catálogo
│   │   │   ├── authController.js       # Registro, login y perfil JWT
│   │   │   ├── exportController.js     # Generación de archivo CSV para contabilidad
│   │   │   └── metricasController.js   # Cálculos de rentabilidad y stock
│   │   ├── middlewares/
│   │   │   ├── authMiddleware.js       # Verificación de token Bearer y roles
│   │   │   ├── errorHandler.js         # Manejador centralizado de errores
│   │   │   └── uploadMiddleware.js     # Multer + Cloudinary / disco local
│   │   ├── routes/
│   │   │   ├── articuloRoutes.js       # Endpoints públicos y protegidos
│   │   │   ├── authRoutes.js           # Endpoints de autenticación
│   │   │   ├── exportRoutes.js         # Endpoint de descarga de CSV
│   │   │   └── metricasRoutes.js       # Endpoints de métricas financieras
│   │   ├── services/
│   │   │   └── pricingService.js       # Lógica matemática de PVP y overrides
│   │   ├── utils/
│   │   │   └── prisma.js               # Cliente singleton de Prisma ORM
│   │   ├── app.js                      # Configuración de Express, CORS y Helmet
│   │   └── server.js                   # Arranque del servidor Node.js
│   ├── .env.example                    # Plantilla de variables de entorno
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ArticleModal.jsx        # Formulario CRUD con cálculo reactivo de PVP
│   │   │   ├── FilterBar.jsx           # Buscador y selector de categorías
│   │   │   ├── MetricsCards.jsx        # Tarjetas de resumen financiero
│   │   │   ├── Navbar.jsx              # Navegación con switch de vistas
│   │   │   └── ProductCard.jsx         # Card de producto para catálogo de clientes
│   │   ├── context/
│   │   │   └── AuthContext.jsx         # Contexto global de sesión JWT
│   │   ├── pages/
│   │   │   ├── AdminDashboard.jsx      # Panel de administración e inventario
│   │   │   ├── CatalogPage.jsx         # Catálogo público optimizado para móviles
│   │   │   └── LoginPage.jsx           # Login administrativo
│   │   ├── services/
│   │   │   └── api.js                  # Cliente Axios e interceptores
│   │   ├── App.jsx                     # Enrutador reactivo de vistas
│   │   ├── index.css                   # Tailwind CSS y directivas
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js                  # Configuración de Vite con proxy hacia backend
│   ├── tailwind.config.js
│   └── package.json
│
├── docker-compose.yml                  # Contenedor de PostgreSQL listo para producción
└── README.md
```

---

## 🧮 Lógica de Negocio: Cálculo de Precios y Costos

El servicio [`pricingService.js`](backend/src/services/pricingService.js) implementa las reglas de rentabilidad:

1. **Cálculo Dinámico Estándar:**
   $$\text{PVP} = \text{Costo Base} \times \left(1 + \frac{\text{Utilidad}}{100}\right)$$
   *Ejemplo:* Con un costo base de $\$6.50$ y un margen de $50\%$:
   $$\text{PVP} = 6.50 \times (1 + 0.50) = \$9.75$$

2. **Override de Precio (Fijación Manual):**
   Si se activa la casilla `overridePrecio`, el sistema respeta el precio cerrado ingresado (`precioManual`) y calcula automáticamente el margen efectivo resultante:
   $$\text{Margen Efectivo (\%)} = \frac{\text{PVP} - \text{Costo Base}}{\text{Costo Base}} \times 100$$

---

## 🐧 Guía de Instalación y Despliegue en Linux (Arch Linux / CachyOS)

Esta guía está especialmente optimizada para distribuciones basadas en Arch Linux como **CachyOS**, utilizando el gestor de paquetes `pacman` y `paru`/`yay`.

### 1. Requisitos Previos

Instalar Node.js (LTS), Docker y Docker Compose:

```bash
# Actualizar el sistema e instalar dependencias básicas
sudo pacman -Syu
sudo pacman -S nodejs npm docker docker-compose git

# Habilitar e iniciar el servicio de Docker
sudo systemctl enable --now docker

# (Opcional) Agregar tu usuario al grupo docker para ejecutar sin sudo
sudo usermod -aG docker $USER
newgrp docker
```

---

### 2. Levantar la Base de Datos PostgreSQL

Desde la raíz del proyecto (`CHESKY`):

```bash
# Iniciar el contenedor de PostgreSQL en segundo plano
docker compose up -d

# Verificar que el contenedor esté corriendo y saludable
docker compose ps
```

---

### 3. Configuración del Backend

1. Entrar a la carpeta `backend` e instalar dependencias:
   ```bash
   cd backend
   npm install
   ```

2. Configurar las variables de entorno:
   ```bash
   cp .env.example .env
   ```
   *(El archivo `.env` ya viene configurado para conectarse al PostgreSQL levantado con `docker-compose` en el puerto 5432)*.

3. Ejecutar las migraciones de Prisma para crear las tablas y tipos:
   ```bash
   npx prisma migrate dev --name init
   ```

4. Generar el cliente de Prisma:
   ```bash
   npx prisma generate
   ```

5. Ejecutar la semilla inicial con datos de prueba y usuario administrador:
   ```bash
   npm run prisma:seed
   ```
   *Esto creará el usuario administrador `admin@chesky.com` (contraseña: `admin1234`) y 6 artículos representativos del catálogo.*

6. Iniciar el servidor backend en modo desarrollo:
   ```bash
   npm run dev
   ```
   *El backend estará disponible en `http://localhost:5000`*.

---

### 4. Configuración del Frontend

En otra terminal:

1. Entrar a la carpeta `frontend` e instalar dependencias:
   ```bash
   cd frontend
   npm install
   ```

2. Iniciar el servidor de desarrollo Vite:
   ```bash
   npm run dev
   ```
   *El frontend abrirá en `http://localhost:5173`*.

---

## 🔑 Credenciales de Acceso Administrador (Demo)

- **URL del Panel:** Haz clic en **"Acceso Admin"** en la barra superior o ve a `http://localhost:5173`
- **Email:** `admin@chesky.com`
- **Contraseña:** `admin1234`

---

## ☁️ Configuración de Almacenamiento en la Nube (Cloudinary)

Para almacenar las fotografías directamente en Cloudinary, edita el archivo `backend/.env` con tus credenciales de la consola de Cloudinary:

```env
CLOUDINARY_CLOUD_NAME="tu_cloud_name"
CLOUDINARY_API_KEY="tu_api_key"
CLOUDINARY_API_SECRET="tu_api_secret"
```

> **Nota de Resiliencia:** Si dejas estas variables vacías en tu entorno local de pruebas, el sistema activa automáticamente un almacenamiento seguro en disco local (`backend/uploads/`) y sirve las fotos mediante Express, por lo que **el sistema es 100% funcional de inmediato sin depender de servicios externos.**

---

## 📱 Configuración del Número de WhatsApp

Para recibir los pedidos del botón de compra en tu línea de WhatsApp comercial, define tu número internacional (con código de país sin el signo `+`) en `backend/.env`:

```env
WHATSAPP_PHONE_NUMBER="584121234567"
```

---

## 📊 Endpoints de la API REST

### Catálogo Público
- `GET /api/articulos/publico`: Lista paginada y filtrable de artículos (solo datos públicos).
- `GET /api/articulos/publico/:id`: Detalle individual de una pieza.

### Autenticación
- `POST /api/auth/login`: Inicia sesión y retorna token JWT y perfil.
- `GET /api/auth/me`: Valida token activo y retorna usuario (requiere Bearer Token).

### Panel Administrador (Requieren `Authorization: Bearer <TOKEN>`)
- `GET /api/articulos`: Listado completo con costos, utilidades y filtros.
- `POST /api/articulos`: Creación con subida de imagen (`multipart/form-data`).
- `PUT /api/articulos/:id`: Actualización de stock, precios y fotografía.
- `PATCH /api/articulos/:id/estado`: Cambio de estado (`Disponible`, `Agotado`, `Oculto`).
- `DELETE /api/articulos/:id`: Eliminación física y limpieza de foto en la nube.
- `POST /api/articulos/calcular-precio`: Recálculo reactivo de PVP.
- `GET /api/metricas`: Resumen de stock físico, inversión y proyección de ganancia.
- `GET /api/exportar/csv`: Descarga del inventario completo en formato CSV / Excel.
