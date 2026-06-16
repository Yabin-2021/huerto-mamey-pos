const express = require('express');
const router = express.Router();
const reporteController = require('../controllers/reporteController');

// Endpoints de analítica de negocio
router.get('/resumen', reporteController.obtenerResumenVentas);
router.get('/top-productos', reporteController.obtenerProductosMasVendidos);
router.get('/alertas-stock', reporteController.obtenerAlertasInventario);

module.exports = router;