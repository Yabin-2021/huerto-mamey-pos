const db = require('../config/db');

const Producto = {
    // Obtener todos los productos con el nombre de su categoría
    getAll: async () => {
        const query = `
            SELECT p.*, c.nombre AS categoria_nombre 
            FROM productos p
            INNER JOIN categorias c ON p.categoria_id = c.id
            WHERE p.estado = 1
        `;
        const [rows] = await db.query(query);
        return rows;
    },

    // Obtener un producto específico por su ID
    getById: async (id) => {
        const query = 'SELECT * FROM productos WHERE id = ? AND estado = 1';
        const [rows] = await db.query(query, [id]);
        return rows[0];
    },

    // Crear un nuevo producto (ej. ingresar una nueva variante de tueste)
    create: async (productoData) => {
        const query = `
            INSERT INTO productos (categoria_id, nombre, unidad_medida, precio_venta, costo, stock_actual, stock_minimo)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        const { categoria_id, nombre, unidad_medida, precio_venta, costo, stock_actual, stock_minimo } = productoData;
        const [result] = await db.query(query, [categoria_id, nombre, unidad_medida, precio_venta, costo, stock_actual || 0, stock_minimo || 5]);
        return result.insertId;
    },

    // Actualizar datos de un producto
    update: async (id, productoData) => {
        const query = `
            UPDATE productos 
            SET categoria_id = ?, nombre = ?, unidad_medida = ?, precio_venta = ?, costo = ?, stock_actual = ?, stock_minimo = ?
            WHERE id = ?
        `;
        const { categoria_id, nombre, unidad_medida, precio_venta, costo, stock_actual, stock_minimo } = productoData;
        const [result] = await db.query(query, [categoria_id, nombre, unidad_medida, precio_venta, costo, stock_actual, stock_minimo, id]);
        return result.affectedRows > 0;
    },

    // Actualizar únicamente el stock (Muy útil para entradas de almacén o tras una venta)
    updateStock: async (id, nuevoStock) => {
        const query = 'UPDATE productos SET stock_actual = ? WHERE id = ?';
        const [result] = await db.query(query, [nuevoStock, id]);
        return result.affectedRows > 0;
    },

    // Eliminación lógica (Cambia el estado a 0 para no romper el historial de ventas pasadas)
    deleteLogical: async (id) => {
        const query = 'UPDATE productos SET estado = 0 WHERE id = ?';
        const [result] = await db.query(query, [id]);
        return result.affectedRows > 0;
    }
};

module.exports = Producto;