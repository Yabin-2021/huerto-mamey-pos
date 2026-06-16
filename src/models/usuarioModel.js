const db = require('../config/db');
const bcrypt = require('bcrypt');

const Usuario = {
    // Buscar un usuario por su correo electrónico (para el Login)
    getByEmail: async (correo) => {
        const query = 'SELECT * FROM usuarios WHERE correo = ? AND estado = 1';
        const [rows] = await db.query(query, [correo]);
        return rows[0];
    },

    // Crear un nuevo usuario encriptando su contraseña con bcrypt
    create: async (usuarioData) => {
        const { nombre, correo, contrasena, rol } = usuarioData;
        
        // Encriptar la contraseña (10 rondas de salting)
        const salt = await bcrypt.genSalt(10);
        const contrasenaEncriptada = await bcrypt.hash(contrasena, salt);

        const query = `
            INSERT INTO usuarios (nombre, correo, contrasena, rol)
            VALUES (?, ?, ?, ?)
        `;
        const [result] = await db.query(query, [nombre, correo, contrasenaEncriptada, rol]);
        return result.insertId;
    }
};

module.exports = Usuario;