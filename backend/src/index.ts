import "reflect-metadata";
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import * as dotenv from 'dotenv';
import { AppDataSource } from "./data-source";
import clienteRoutes from "./routes/clienteRoutes";
import casoRoutes from "./routes/casoRoutes";
import documentoRoutes from "./routes/documentoRoutes"; 
import chatRoutes from "./routes/chatRoutes"; 
import alertaRoutes from "./routes/AlertaRoutes";
import iaRoutes from "./routes/iaRoutes";
import usuarioRoutes from "./routes/usuarioRoutes"; // Nueva importación para Fase 5
// Nueva importación para el vigilante de alertas
import { NotificacionService } from "./services/NotificacionService"; 
import dashboardRoutes from "./routes/dashboardRoutes"; // Nueva importación

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// 1. Configuración de Middlewares
app.use(express.json());

// 2. Configuración de CORS (Abierto para desarrollo local)
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 3. Configuración de HELMET (Crítico para el Visor PDF)
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false, // Permite que el visor nativo de PDF funcione
  frameguard: false, // Permite que la página use iframes de su propio dominio
}));

// 4. Servir carpeta UPLOADS con permisos totales de lectura
app.use('/uploads', express.static('uploads', {
  setHeaders: (res) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Cross-Origin-Policy', 'cross-origin');
  }
}));

// Rutas del Sistema
app.use("/api/clientes", clienteRoutes);
app.use("/api/casos", casoRoutes);
app.use("/api/documentos", documentoRoutes); 
app.use("/api/chat", chatRoutes); 
app.use("/api/alertas", alertaRoutes);
app.use("/api/ia", iaRoutes);
app.use("/api/usuarios", usuarioRoutes); // Registro de rutas de autenticación
app.use("/api/dashboard", dashboardRoutes);

app.get('/', (req, res) => {
  res.send('Servidor de Juris-IA operando correctamente 🚀');
});

AppDataSource.initialize()
  .then(() => {
    console.log("--------------------------------------------------");
    console.log("Conexión a la Base de Datos: EXITOSA ✅");
    
    // INICIALIZACIÓN DEL VIGILANTE (Fase 4)
    const notificacionService = new NotificacionService();
    notificacionService.iniciarCron();

    app.listen(PORT, () => {
      console.log(`Servidor legal iniciado en: http://localhost:${PORT}`);
      console.log(`Estado: Módulos Operativos + Visor PDF Habilitado`);
      console.log("--------------------------------------------------");
    });
  })
  .catch((error) => {
    console.error("Error conectando a la base de datos: ❌", error);
  });