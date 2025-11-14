
import express from "express";
import dotenv from "dotenv";
import { mongooseContecion } from "./src/config/db.js";
import ruletaRoutes from "./src/routes/ruleta.routes.js";
import apostadorRoutes from "./src/routes/apostador.routes.js";
import resultadosRoutes from "./src/routes/resultados.routes.js";

const app = express();
dotenv.config();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Conexión a la base de datos
mongooseContecion();

// Rutas
app.use('/api/ruletas', ruletaRoutes);
app.use('/api/apuestas', apostadorRoutes);
app.use('/api/resultados', resultadosRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({
    message: 'Una Mas?',
    version: '1.0.0',
    endpoints: {
      ruletas: '/api/ruletas',
      apuestas: '/api/apuestas',
      resultados: '/api/resultados'
    }
  });
});

// Manejo de errores 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    mensaje: 'Endpoint no encontrado'
  });
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    mensaje: 'Error interno del servidor',
    error: err.message
  });
});

export default app;