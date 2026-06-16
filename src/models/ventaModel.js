const db = require('../config/db');

const Venta = {
    // Crear una venta completa usando una Transacción SQL
    createCompleteVenta: async (ventaData, detalles) => {
        // 1. Obtenemos una conexión exclusiva del Pool para la transacción
        const connection = await db.getConnection();
        
        try {
            // Iniciamos la transacción
            await connection.beginTransaction();

            // 2. Insertar la Cabecera de la Venta
            const queryVenta = `
                INSERT INTO ventas (usuario_id, cliente_id, total, metodo_pago, monto_pagado)
                VALUES (?, ?, ?, ?, ?)
            `;
            const { usuario_id, cliente_id, total, metodo_pago, monto_pagado } = ventaData;
            const [resultVenta] = await connection.query(queryVenta, [usuario_id, cliente_id || null, total, metodo_pago, monto_pagado]);
            const ventaId = resultVenta.insertId;

            // 3. Recorrer los detalles para insertarlos y descontar inventario
            for (const detalle of detalles) {
                const { producto_id, cantidad, precio_unitario } = detalle;
                const subtotal = cantidad * precio_unitario;

                // A. Verificar si hay stock suficiente del café solicitado
                const [prodRows] = await connection.query('SELECT stock_actual, nombre FROM productos WHERE id = ?', [producto_id]);
                if (prodRows.length === 0) {
                    throw new Error(`El producto con ID ${producto_id} no existe.`);
                }
                
                const producto = prodRows[0];
                if (producto.stock_actual < cantidad) {
                    throw new Error(`Stock insuficiente para: ${producto.nombre}. Disponible: ${producto.stock_actual}, Solicitado: ${cantidad}`);
                }

                // B. Insertar el renglón en detalle_ventas
                const queryDetalle = `
                    INSERT INTO detalle_ventas (venta_id, producto_id, cantidad, precio_unitario, subtotal)
                    VALUES (?, ?, ?, ?, ?)
                `;
                await connection.query(queryDetalle, [ventaId, producto_id, cantidad, precio_unitario, subtotal]);

                // C. Descontar el stock (soporta decimales para kilogramos a granel)
                const queryActualizarStock = `
                    UPDATE productos 
                    SET stock_actual = stock_actual - ? 
                    WHERE id = ?
                `;
                await connection.query(queryActualizarStock, [cantidad, producto_id]);
            }

            // If everything goes well, commit the changes to the DB
            await connection.commit();
            return ventaId;

        } catch (error) {
            // Si algo falla, deshacemos absolutamente todo lo que se haya hecho en este bloque
            await connection.rollback();
            throw error;
        } finally {
            // Siempre liberamos la conexión de vuelta al pool
            connection.release();
        }
    },

    // Obtener el historial de ventas con datos del cliente y vendedor
    getAll: async () => {
        const query = `
            SELECT v.*, u.nombre AS vendedor_nombre, COALESCE(c.nombre, 'Público General') AS cliente_nombre 
            FROM ventas v
            INNER JOIN usuarios u ON v.usuario_id = u.id
            LEFT JOIN clientes c ON v.cliente_id = c.id
            ORDER BY v.fecha_hora DESC
        `;
        const [rows] = await db.query(query);
        return rows;
    },

    // Obtener el desglose completo de un ticket específico
    getDetallesByVentaId: async (ventaId) => {
        const query = `
            SELECT dv.*, p.nombre AS producto_nombre, p.unidad_medida
            FROM detalle_ventas dv
            INNER JOIN productos p ON dv.producto_id = p.id
            WHERE dv.venta_id = ?
        `;
        const [rows] = await db.query(query, [ventaId]);
        return rows;
    }
};

module.exports = Venta;