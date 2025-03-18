// routes/almacen.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { requireAdmin, requireLogin } = require('../middlewares/auth');


router.get('/products-all', requireAdmin, (req, res) => {
    const sql = 'SELECT * FROM Productos ORDER BY id ASC';
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error al obtener productos:', err);
            return res.status(500).json({ message: 'Error al obtener productos', detail: err.code });
        }
        res.json(results);
    });
});


router.post('/products', requireAdmin, (req, res) => {
    const { nombre, cantidad, umbral, proveedor, cost, packs, units_per_pack } = req.body;

    if (!nombre) {
        return res.status(400).json({ message: 'El nombre del producto es obligatorio' });
    }

    const c = parseInt(cantidad, 10) || 0;
    const costVal = parseFloat(cost) || 0;
    if (c < 0 || c > 9999) {
        return res.status(400).json({ message: 'Cantidad debe estar entre 0 y 9999' });
    }
    if (costVal < 0 || costVal > 999999.99) {
        return res.status(400).json({ message: 'Costo inválido' });
    }

    let finalQuantity = c;
    const p = parseInt(packs, 10) || 0;
    const u = parseInt(units_per_pack, 10) || 0;
    if (p > 0 && u > 0) {
        finalQuantity += (p * u);
    }

    const sql = `
        INSERT INTO Productos (nombre, cantidad, umbral, proveedor, cost)
        VALUES (?, ?, ?, ?, ?)
    `;
    db.query(sql, [nombre, finalQuantity, umbral || 0, proveedor || '', costVal], (err, result) => {
        if (err) {
            console.error('Error al agregar producto:', err);
            return res.status(500).json({ message: 'Error al agregar producto', detail: err.code });
        }
        res.status(201).json({ message: 'Producto agregado exitosamente', id: result.insertId });
    });
});


router.put('/products/:id', requireAdmin, (req, res) => {
    const { id } = req.params;
    const { nombre, cantidad, umbral, proveedor, cost, packs, units_per_pack } = req.body;

    const c = parseInt(cantidad, 10) || 0;
    const costVal = parseFloat(cost) || 0;
    if (c < 0 || c > 9999) {
        return res.status(400).json({ message: 'Cantidad debe estar entre 0 y 9999' });
    }
    if (costVal < 0 || costVal > 999999.99) {
        return res.status(400).json({ message: 'Costo inválido' });
    }

    let finalQuantity = c;
    const p = parseInt(packs, 10) || 0;
    const u = parseInt(units_per_pack, 10) || 0;
    if (p > 0 && u > 0) {
        finalQuantity += (p * u);
    }

    const sql = `
        UPDATE Productos
        SET nombre = ?, cantidad = ?, umbral = ?, proveedor = ?, cost = ?
        WHERE id = ?
    `;
    db.query(sql, [nombre, finalQuantity, umbral || 0, proveedor || '', costVal, id], (err, result) => {
        if (err) {
            console.error('Error al editar producto:', err);
            return res.status(500).json({ message: 'Error al editar producto', detail: err.code });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }
        res.json({ message: 'Producto editado exitosamente' });
    });
});

router.get('/products', requireAdmin, (req, res) => {
    const { almacen_id } = req.query;
    if (!almacen_id) {
        return res.status(400).json({ message: 'El ID de almacén es obligatorio' });
    }
    const sql = 'SELECT * FROM Productos WHERE almacen_id = ?';
    db.query(sql, [almacen_id], (err, results) => {
        if (err) {
            console.error('Error al obtener productos de almacén:', err);
            return res.status(500).json({ message: 'Error al obtener productos de almacén', detail: err.code });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: 'No se encontraron productos para este almacén' });
        }
        res.json(results);
    });
});

router.post('/stock', requireAdmin, (req, res) => {
    const { warehouse_id, product_id, quantity } = req.body;
    if (!warehouse_id || !product_id || !quantity) {
        return res.status(400).json({ message: 'warehouse_id, product_id y quantity son obligatorios' });
    }

    const sql = `
        INSERT INTO WarehouseStock (warehouse_id, product_id, quantity)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE quantity = quantity + ?
    `;
    db.query(sql, [warehouse_id, product_id, quantity, quantity], (err) => {
        if (err) {
            console.error('Error al actualizar stock en almacén:', err);
            return res.status(500).json({ message: 'Error al actualizar stock en almacén', detail: err.code });
        }
        res.status(201).json({ message: 'Stock de almacén actualizado exitosamente' });
    });
});

router.delete('/stock', requireAdmin, (req, res) => {
    const { warehouse_id, product_id } = req.body;
    if (!warehouse_id || !product_id) {
        return res.status(400).json({ message: 'warehouse_id y product_id son obligatorios' });
    }

    const sql = 'DELETE FROM WarehouseStock WHERE warehouse_id = ? AND product_id = ?';
    db.query(sql, [warehouse_id, product_id], (err, result) => {
        if (err) {
            console.error('Error al remover stock del almacén:', err);
            return res.status(500).json({ message: 'Error al remover stock del almacén', detail: err.code });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'No se encontró stock para ese almacén y producto' });
        }
        res.json({ message: 'Stock de almacén removido exitosamente' });
    });
});

module.exports = router;