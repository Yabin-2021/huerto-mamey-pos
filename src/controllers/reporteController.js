const db = require('../config/db');

// 1. Resumen de ventas en un rango de fechas (Totales, métodos de pago)
exports.obtenerResumenVentas = async (req, res) => {
    // 🕒 OBTENER LA FECHA DE MÉXICO: Restamos las 6 horas de desfase con UTC para sincronizar los calendarios de Render
    const fechaLocal = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString().slice(0, 10);

    // Si el cliente no envía fechas específicas, tomamos el día de hoy exacto en hora local
    const fechaInicio = req.query.fechaInicio || `${fechaLocal} 00:00:00`;
    const fechaFin = req.query.fechaFin || `${fechaLocal} 23:59:59`;

    // 👁️ CHISMOSOS PARA EL LOG
    console.log("🔍 RANGO DE FECHAS SOLICITADO:", { fechaInicio, fechaFin });

    try {
        // Consulta A: Total vendido y cantidad de transacciones (Alineado con CONVERT_TZ para leer la BD)
        const queryGeneral = `
            SELECT 
                COUNT(id) AS total_transacciones,
                COALESCE(SUM(total), 0) AS ingresos_totales
            FROM ventas 
            WHERE CONVERT_TZ(fecha_hora, '+00:00', '-06:00') BETWEEN ? AND ?
        `;
        const [generalRows] = await db.query(queryGeneral, [fechaInicio, fechaFin]);

        // 👁️ CHISMOSO PARA VER QUÉ DEVUELVE MYSQL
        console.log("📊 RESPUESTA DIRECTA DE MYSQL:", generalRows[0]);

        // Consulta B: Desglose por método de pago (Efectivo, Tarjeta, etc.)
        const queryMetodos = `
            SELECT 
                metodo_pago,
                COUNT(id) AS cantidad_ventas,
                COALESCE(SUM(total), 0) AS total_ingresado
            FROM ventas 
            WHERE CONVERT_TZ(fecha_hora, '+00:00', '-06:00') BETWEEN ? AND ?
            GROUP BY metodo_pago
        `;
        const [metodoRows] = await db.query(queryMetodos, [fechaInicio, fechaFin]);

        res.json({
            periodo: { desde: fechaInicio, hasta: fechaFin },
            resumen_general: generalRows[0],
            desglose_pagos: metodoRows
        });

    } catch (error) {
        res.status(500).json({ error: "Error al generar el resumen de ventas", detalles: error.message });
    }
};

// 2. Top de productos más vendidos (Filtrado opcional por fechas o histórico general)
exports.obtenerProductosMasVendidos = async (req, res) => {
    const limite = parseInt(req.query.limite) || 5;

    try {
        const query = `
            SELECT 
                p.nombre AS producto,
                p.unidad_medida,
                SUM(dv.cantidad) AS total_cantidad_vendida,
                SUM(dv.subtotal) AS total_recaudado
            FROM detalle_ventas dv
            INNER JOIN productos p ON dv.producto_id = p.id
            GROUP BY dv.producto_id
            ORDER BY total_cantidad_vendida DESC
            LIMIT ?
        `;
        const [rows] = await db.query(query, [limite]);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener el top de productos", detalles: error.message });
    }
};

// 3. Alertas de Inventario Bajo (Productos que están igual o por debajo de su stock_minimo)
exports.obtenerAlertasInventario = async (req, res) => {
    try {
        const query = `
            SELECT p.id, p.nombre, p.unidad_medida, p.stock_actual, p.stock_minimo, c.nombre AS categoria
            FROM productos p
            INNER JOIN categorias c ON p.categoria_id = c.id
            WHERE p.stock_actual <= p.stock_minimo AND p.estado = 1
        `;
        const [rows] = await db.query(query);
        res.json({
            productos_criticos: rows.length,
            lista: rows
        });
    } catch (error) {
        res.status(500).json({ error: "Error al consultar alertas de inventario", detalles: error.message });
    }
};