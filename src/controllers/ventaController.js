const Venta = require('../models/ventaModel');

exports.registrarVenta = async (req, res) => {
    const { usuario_id, cliente_id, total, metodo_pago, monto_pagado, detalles } = req.body;

    // Validación básica de los datos del ticket
    if (!usuario_id || !total || !metodo_pago || !detalles || detalles.length === 0) {
        return res.status(400).json({ error: "Faltan datos obligatorios para procesar la venta." });
    }

    try {
        const ventaData = { usuario_id, cliente_id, total, metodo_pago, monto_pagado };
        
        // Llamamos al modelo que ejecuta la transacción compleja
        const ventaId = await Venta.createCompleteVenta(ventaData, detalles);
        
        res.status(201).json({
            mensaje: "¡Venta procesada con éxito!",
            venta_id: ventaId,
            cambio: metodo_pago === 'efectivo' ? (monto_pagado - total) : 0
        });
    } catch (error) {
        res.status(500).json({ error: "No se pudo registrar la venta", detalles: error.message });
    }
};

exports.obtenerVentas = async (req, res) => {
    try {
        const ventas = await Venta.getAll();
        res.json(ventas);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener el historial de ventas", detalles: error.message });
    }
};

exports.obtenerTicketDetallado = async (req, res) => {
    try {
        const detalles = await Venta.getDetallesByVentaId(req.params.id);
        res.json(detalles);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener el detalle del ticket", detalles: error.message });
    }
};