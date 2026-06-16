const jwt = require('jsonwebtoken');

module.exports = (rolesPermitidos = []) => {
    return (req, res, next) => {
        // Obtener el token de las cabeceras de la petición (Authorization: Bearer <token>)
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(403).json({ error: "Acceso denegado. No se proporcionó un token de seguridad." });
        }

        try {
            // Verificar si el token es legítimo y no ha expirado
            const usuarioVerificado = jwt.verify(token, process.env.JWT_SECRET);
            req.usuario = usuarioVerificado; // Inyectamos los datos del usuario en la petición

            // Control de Roles: Verificar si el rol del usuario tiene permiso para esta ruta
            if (rolesPermitidos.length > 0 && !rolesPermitidos.includes(usuarioVerificado.rol)) {
                return res.status(401).json({ error: "Acceso denegado. No tienes los permisos necesarios (Rol insuficiente)." });
            }

            next(); // Si todo está bien, continúa a la ruta seleccionada
        } catch (error) {
            return res.status(401).json({ error: "Token inválido o expirado." });
        }
    };
};