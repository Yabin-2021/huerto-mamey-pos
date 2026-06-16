const mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    // 🔌 AGREGAMOS EL PUERTO: Si Railway te da uno diferente, lo leerá; si no, por defecto usará el 3306
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    // 🔒 AGREGAMOS SSL: Clave para que la nube no te rechace la conexión por seguridad.
    // El "rejectUnauthorized: false" permite conectar de forma segura sin arrastrar un certificado físico (.pem)
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
});

// Exportamos el pool usando promesas para poder usar async/await en los modelos
module.exports = pool.promise();