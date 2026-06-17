const mysql = require('mysql2/promise'); // Asegúrate de usar la versión con promesas
dotenv = require('dotenv');
dotenv.config();

// Creamos un POOL de conexiones en lugar de una conexión única
const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10, // Permite hasta 10 conexiones simultáneas automáticas
    queueLimit: 0,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
});

// Verificar la conexión al arrancar el servidor
(async () => {
    try {
        const connection = await db.getConnection();
        console.log('◇ Conexión exitosa y segura a la Base de Datos en Railway 🚀');
        connection.release(); // Regresa la conexión al pool
    } catch (error) {
        console.error('❌ Error crítico al conectar a la Base de Datos:', error.message);
    }
})();

module.exports = db;