const Usuario = require('../models/usuarioModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Registro de usuarios (Para dar de alta administradores o vendedores)
exports.registrar = async (req, res) => {
    const { nombre, correo, contrasena, rol } = req.body;
    if (!nombre || !correo || !contrasena || !rol) {
        return res.status(400).json({ error: "Todos los campos son obligatorios." });
    }

    try {
        const usuarioExistente = await Usuario.getByEmail(correo);
        if (usuarioExistente) {
            return res.status(400).json({ error: "El correo ya está registrado." });
        }

        const usuarioId = await Usuario.create({ nombre, correo, contrasena, rol });
        res.status(201).json({ mensaje: "Usuario registrado con éxito", usuarioId });
    } catch (error) {
        res.status(500).json({ error: "Error al registrar usuario", detalles: error.message });
    }
};

// Inicio de Sesión (Login)
exports.login = async (req, res) => {
    const { correo, contrasena } = req.body;

    try {
        // 1. Verificar si el usuario existe
        const usuario = await Usuario.getByEmail(correo);
        if (!usuario) {
            return res.status(401).json({ error: "Credenciales incorrectas (Usuario no encontrado)." });
        }

        // 2. Comparar la contraseña ingresada con el Hash de la Base de Datos
        const passwordCorrecto = await bcrypt.compare(contrasena, usuario.contrasena);
        if (!passwordCorrecto) {
            return res.status(401).json({ error: "Credenciales incorrectas (Contraseña inválida)." });
        }

        // 3. Generar el Token JWT firmado (Expira en 8 horas, ideal para un turno laboral)
        const token = jwt.sign(
            { id: usuario.id, rol: usuario.rol, nombre: usuario.nombre },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        // Responder con los datos públicos del usuario y su token
        res.json({
            mensaje: "¡Inicio de sesión exitoso!",
            token,
            usuario: {
                id: usuario.id,
                nombre: usuario.nombre,
                rol: usuario.rol
            }
        });

    } catch (error) {
        res.status(500).json({ error: "Error en el proceso de autenticación", detalles: error.message });
    }
};