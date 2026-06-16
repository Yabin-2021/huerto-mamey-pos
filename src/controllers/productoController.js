const Producto = require('../models/productoModel');

exports.obtenerProductos = async (req, res) => {
    try {
        const productos = await Producto.getAll();
        res.json(productos);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener los productos", detalles: error.message });
    }
};

exports.obtenerProductoPorId = async (req, res) => {
    try {
        const producto = await Producto.getById(req.params.id);
        if (!producto) {
            return res.status(404).json({ error: "Producto no encontrado" });
        }
        res.json(producto);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener el producto", detalles: error.message });
    }
};

exports.crearProducto = async (req, res) => {
    try {
        const nuevoId = await Producto.create(req.body);
        res.status(201).json({ mensaje: "Producto registrado con éxito", productoId: nuevoId });
    } catch (error) {
        res.status(500).json({ error: "Error al registrar el producto", detalles: error.message });
    }
};

exports.actualizarProducto = async (req, res) => {
    try {
        const actualizado = await Producto.update(req.params.id, req.body);
        if (!actualizado) {
            return res.status(404).json({ error: "Producto no encontrado o sin cambios" });
        }
        res.json({ mensaje: "Producto actualizado con éxito" });
    } catch (error) {
        res.status(500).json({ error: "Error al actualizar el producto", detalles: error.message });
    }
};

exports.eliminarProducto = async (req, res) => {
    try {
        const eliminado = await Producto.deleteLogical(req.params.id);
        if (!eliminado) {
            return res.status(404).json({ error: "Producto no encontrado" });
        }
        res.json({ mensaje: "Producto eliminado correctamente del catálogo" });
    } catch (error) {
        res.status(500).json({ error: "Error al eliminar el producto", detalles: error.message });
    }
};