import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando siembra de base de datos (Seed)...');

  // 1. Crear Usuario Administrador por defecto
  const adminEmail = 'admin@chesky.com';
  const usuarioExistente = await prisma.usuario.findUnique({
    where: { email: adminEmail },
  });

  if (!usuarioExistente) {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('admin1234', salt);

    await prisma.usuario.create({
      data: {
        email: adminEmail,
        nombre: 'Administrador CHESKY',
        password: passwordHash,
        rol: 'ADMIN',
      },
    });
    console.log(`👤 Usuario Administrador creado: ${adminEmail} (Contraseña: admin1234)`);
  } else {
    console.log(`ℹ️ Usuario ${adminEmail} ya existe.`);
  }

  // 2. Sembrar Artículos de Muestra para el Catálogo de Bisutería
  const articulosSemilla = [
    {
      sku: 'COL-001',
      nombre: 'Collar Doble Cadena con Medalla Solar',
      categoria: 'Collares',
      descripcion: 'Collar de acero inoxidable con baño de oro 18k. Diseño doble capa con colgante de sol texturizado. Resistente al agua y libre de níquel. Longitud: 45 cm + 5 cm de extensión.',
      costoBase: 6.50,
      utilidad: 50.00,
      pvp: 9.75,
      overridePrecio: false,
      precioManual: null,
      stock: 14,
      imagenUrl: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80',
      estado: 'Disponible',
    },
    {
      sku: 'PUL-002',
      nombre: 'Pulsera Eslabón Veneciano con Perla Barroca',
      categoria: 'Pulseras',
      descripcion: 'Pulsera ajustable de eslabones gruesos enchapada en oro con perla cultivada de agua dulce central. Cierre estilo marinero seguro.',
      costoBase: 4.80,
      utilidad: 60.00,
      pvp: 7.68,
      overridePrecio: false,
      precioManual: null,
      stock: 8,
      imagenUrl: 'https://images.unsplash.com/photo-1611591475103-4fa1b7765a7f?auto=format&fit=crop&w=800&q=80',
      estado: 'Disponible',
    },
    {
      sku: 'ZAR-003',
      nombre: 'Zarcillos Candonga Texturizada Geométrica',
      categoria: 'Zarcillos',
      descripcion: 'Aretes tipo aro candonga de tamaño mediano (2.5 cm de diámetro) con acabado martillado artesanal. Ultra ligeros y antialérgicos.',
      costoBase: 3.20,
      utilidad: 70.00,
      pvp: 5.44,
      overridePrecio: false,
      precioManual: null,
      stock: 20,
      imagenUrl: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=800&q=80',
      estado: 'Disponible',
    },
    {
      sku: 'ANI-004',
      nombre: 'Anillo Ajustable Sello con Circonita Esmeralda',
      categoria: 'Anillos',
      descripcion: 'Anillo estilo sello vintage con piedra central circonita verde corte esmeralda. Base de latón noble con triple baño electrolítico dorado.',
      costoBase: 5.00,
      utilidad: 50.00,
      pvp: 7.50,
      overridePrecio: false,
      precioManual: null,
      stock: 0, // Producto agotado para validar sello visual en catálogo
      imagenUrl: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80',
      estado: 'Agotado',
    },
    {
      sku: 'DIJ-005',
      nombre: 'Dije Ojo Turco Protector en Nácar y Microcircones',
      categoria: 'Dijes',
      descripcion: 'Dije amuleto elaborado con nácar natural y engaste de microcirconitas pavé brillantes. Argolla compatible con cualquier cadena o pulsera.',
      costoBase: 3.50,
      utilidad: 45.00,
      pvp: 5.08,
      overridePrecio: false,
      precioManual: null,
      stock: 12,
      imagenUrl: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80',
      estado: 'Disponible',
    },
    {
      sku: 'SET-006',
      nombre: 'Set Nupcial Elegance: Gargantilla y Aretes Lágrima',
      categoria: 'Sets',
      descripcion: 'Juego completo de gargantilla fina y pendientes de gota con cristales austriacos facetados de alto brillo. Ideal para eventos y ocasiones de gala.',
      costoBase: 12.00,
      utilidad: 50.00,
      pvp: 18.00, // Precio cerrado
      overridePrecio: true,
      precioManual: 18.00,
      stock: 5,
      imagenUrl: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80',
      estado: 'Disponible',
    },
  ];

  for (const item of articulosSemilla) {
    const articuloExiste = await prisma.articulo.findUnique({
      where: { sku: item.sku },
    });

    if (!articuloExiste) {
      await prisma.articulo.create({
        data: item,
      });
      console.log(`💍 Artículo creado: [${item.sku}] ${item.nombre}`);
    } else {
      console.log(`ℹ️ Artículo [${item.sku}] ya existe.`);
    }
  }

  console.log('✨ Siembra de datos completada exitosamente.');
}

main()
  .catch((e) => {
    console.error('❌ Error en el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
