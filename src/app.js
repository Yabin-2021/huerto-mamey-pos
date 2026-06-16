const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

//Importando DataBase
const db = require('./config/db');
//Importando productos
const productoRoutes = require('./routes/productoRoutes');
// Importando Ventas
const ventaRoutes = require('./routes/ventaRoutes');
dotenv.config();
//Importando y declarando reportes
const reporteRoutes = require('./routes/reporteRoutes');
// Importando autenticación
const authRoutes = require('./routes/authRoutes');
//Importando verificación
const verificarAuth = require('./middlewares/authMiddleware');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json()); // Permite recibir datos en formato JSON

//Vincular rutas públicas LogIn
app.use('/api/auth', authRoutes);

//Usando la ruta Productos
app.use('/api/productos',productoRoutes);

//Usando la ruta Ventas
app.use('/api/ventas',ventaRoutes);

//Usando la ruta Reporte - Proteger Reportes
app.use('/api/reportes', verificarAuth(['administrador']), reporteRoutes);

//SERVIDOR ESCUCHANDO
// Ruta de prueba para verificar que el servidor funcione
app.get('/', (req, res) => {
    res.send('Servidor del Punto de Venta Café Huerto el Mamey funcionando ☕');
});

// Prueba de conexión rápida a la base de datos al iniciar
app.get('/test-db', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM categorias');
        res.json({ status: "Conexión exitosa con XAMPP", data: rows });
    } catch (error) {
        res.status(500).json({ error: "Error al conectar a la base de datos", details: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo con éxito en el puerto ${PORT}`);
});