const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { requireLogin, requireAdmin } = require('../middlewares/auth');


router.get('/', requireLogin, (req, res) => {
    const sql = 'SELECT * FROM Productos';
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error al obtener productos:', err);
            return res.status(500).json({ message: 'Error al obtener productos' });
        }
        res.json(results);
    });
});

router.get('/buscar', requireLogin, (req, res) => {
    const { nombre } = req.query;
    if (!nombre) {
        return res.status(400).json({ message: 'Debe proporcionar un término de búsqueda en "nombre"' });
    }
    const sql = 'SELECT * FROM Productos WHERE nombre LIKE ?';
    const searchTerm = `%${nombre}%`;
    db.query(sql, [searchTerm], (err, results) => {
        if (err) {
            console.error('Error al buscar productos:', err);
            return res.status(500).json({ message: 'Error al buscar productos' });
        }
        res.json(results);
    });
});

router.get('/:id', requireLogin, (req, res) => {
    const { id } = req.params;
    const sql = 'SELECT * FROM Productos WHERE id = ? LIMIT 1';
    db.query(sql, [id], (err, results) => {
        if (err) {
            console.error('Error al obtener producto:', err);
            return res.status(500).json({ message: 'Error al obtener producto' });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }
        res.json(results[0]);
    });
});

router.post('/', requireAdmin, (req, res) => {
    const { nombre, cantidad, umbral, categoria_id, fecha_caducidad, proveedor, cost } = req.body;
    if (!nombre) {
        return res.status(400).json({ message: 'El campo nombre es obligatorio' });
    }

    const sql = `
    INSERT INTO Productos
    (nombre, cantidad, umbral, categoria_id, fecha_caducidad, proveedor, cost)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
    db.query(sql, [nombre, cantidad, umbral, categoria_id, fecha_caducidad, proveedor, cost], (err, results) => {
        if (err) {
            console.error('Error al agregar producto:', err);
            return res.status(500).json({ message: 'Error al agregar producto' });
        }
        res.status(201).json({ message: 'Producto agregado exitosamente', id: results.insertId });
    });
});

router.put('/:id', requireAdmin, (req, res) => {
    const { id } = req.params;
    const { nombre, cantidad, umbral, categoria_id, fecha_caducidad, proveedor, cost } = req.body;

    const sql = `
    UPDATE Productos
    SET nombre = ?, cantidad = ?, umbral = ?, categoria_id = ?, fecha_caducidad = ?, proveedor = ?, cost = ?
    WHERE id = ?
  `;
    db.query(sql, [nombre, cantidad, umbral, categoria_id, fecha_caducidad, proveedor, cost, id], (err, results) => {
        if (err) {
            console.error('Error al actualizar producto:', err);
            return res.status(500).json({ message: 'Error al actualizar producto' });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }
        res.json({ message: 'Producto actualizado exitosamente' });
    });
});

router.delete('/:id', requireAdmin, (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM Productos WHERE id = ?';
    db.query(sql, [id], (err, results) => {
        if (err) {
            console.error('Error al eliminar producto:', err);
            return res.status(500).json({ message: 'Error al eliminar producto' });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }
        res.json({ message: 'Producto eliminado exitosamente' });
    });
});

module.exports = router;