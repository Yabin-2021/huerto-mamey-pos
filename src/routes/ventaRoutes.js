const express = require('express');
const router = express.Router();
const ventaController = require('../controllers/ventaController');

// Endpoints del flujo de caja
router.post('/', ventaController.registrarVenta);         // Generar una venta
router.get('/', ventaController.obtenerVentas);          // Ver historial de tickets
router.get('/:id/detalles', ventaController.obtenerTicketDetallado); // Ver el cuerpo de un ticket

module.exports = router;