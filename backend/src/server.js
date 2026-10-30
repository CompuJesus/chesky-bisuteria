import dotenv from 'dotenv';
import app from './app.js';
import prisma from './utils/prisma.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Probar conexión a la base de datos
    await prisma.$connect();
    console.log('✅ Conexión exitosa a la base de datos PostgreSQL.');

    app.listen(PORT, () => {
      console.log(`💎 Servidor CHESKY API escuchando en el puerto ${PORT}`);
      console.log(`📡 URL API: http://localhost:${PORT}/api`);
      console.log(`🩺 Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('❌ Error fatal al iniciar el servidor:', error);
    process.exit(1);
  }
};

startServer();
