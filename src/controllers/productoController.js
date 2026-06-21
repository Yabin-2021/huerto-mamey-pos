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
    // Asegúrate de que los nombres coincidan con los que envía el frontend payload
    const { categoria_id, nombre, unidad_medida, precio_venta, precio_compra, stock_actual, stock_minimo } = req.body;

    try {
        // Al llamar al modelo, pásale los datos correctos mapeando 'costo' si tu modelo lo llama así
        const nuevoProductoId = await Producto.create({
            categoria_id,
            nombre,
            unidad_medida,
            precio_venta: precio_venta, // Asegurar que pase el valor correcto
            costo: precio_compra,       // Mapeamos precio_compra al campo costo de tu BD
            stock_actual,
            stock_minimo
        });

        res.status(201).json({ mensaje: "Producto registrado con éxito", id: nuevoProductoId });
    } catch (error) {
        console.error("❌ ERROR REAL EN BD:", error);
        res.status(500).json({ error: "Error al registrar el producto", detalles: error.message });
    }
};

exports.actualizarProducto = async (req, res) => {
    try {
        // 1. Extraemos los datos que vienen del frontend payload
        const { 
            categoria_id, 
            nombre, 
            unidad_medida, 
            precio_venta, 
            precio_compra, 
            stock_actual, 
            stock_minimo 
        } = req.body;

        // 2. Construimos el objeto adaptado a los campos exactos que tu modelo/BD esperan
        const datosActualizados = {
            categoria_id: parseInt(categoria_id),
            nombre,
            unidad_medida,
            precio_venta: parseFloat(precio_venta),
            costo: parseFloat(precio_compra), // 🚨 ARREGLO CRÍTICO: Mapeamos precio_compra a 'costo'
            stock_actual: parseFloat(stock_actual),
            stock_minimo: parseFloat(stock_minimo)
        };

        // 3. Pasamos el objeto corregido al modelo
        const actualizado = await Producto.update(req.params.id, datosActualizados);
        
        if (!actualizado) {
            return res.status(404).json({ error: "Producto no encontrado o sin cambios" });
        }
        
        res.json({ mensaje: "Producto actualizado con éxito" });
    } catch (error) {
        console.error("❌ ERROR REAL EN ACTUALIZAR PRODUCTO:", error); // Esto te ayudará en la consola de Render
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