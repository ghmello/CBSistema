const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { requireLogin } = require('../middlewares/auth');

router.get('/', requireLogin, (req, res) => {
    const sql = `
        SELECT sm.id, sm.producto_id, p.nombre AS producto_nombre, sm.tipo, sm.cantidad, sm.motivo, sm.fecha_movimiento, sm.usuario_id, u.nombre AS usuario_nombre
        FROM Stock_Movements sm
        JOIN Productos p ON sm.producto_id = p.id
        JOIN Usuarios u ON sm.usuario_id = u.id
        ORDER BY sm.fecha_movimiento DESC
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error al obtener movimientos de stock:', err);
            return res.status(500).json({
                message: 'Error al obtener movimientos de stock',
                error: err.message
            });
        }
        res.json(results);
    });
});

router.post('/', requireLogin, (req, res) => {
    const { producto_id, tipo, cantidad, motivo, usuario_id } = req.body;

    if (!producto_id || !tipo || !cantidad || !usuario_id) {
        return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    const sql = `
        INSERT INTO Stock_Movements (producto_id, tipo, cantidad, motivo, usuario_id)
        VALUES (?, ?, ?, ?, ?)
    `;

    db.query(sql, [producto_id, tipo, cantidad, motivo, usuario_id], (err, result) => {
        if (err) {
            console.error('Error al crear movimiento de stock:', err);
            return res.status(500).json({
                message: 'Error al crear movimiento de stock',
                error: err.message
            });
        }
        res.status(201).json({
            message: 'Movimiento de stock creado exitosamente',
            id: result.insertId
        });
    });
});

router.delete('/:id', requireLogin, (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ message: 'ID de movimiento es obligatorio' });
    }

    const sql = 'DELETE FROM Stock_Movements WHERE id = ?';
    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error('Error al eliminar movimiento de stock:', err);
            return res.status(500).json({
                message: 'Error al eliminar movimiento de stock',
                error: err.message
            });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Movimiento no encontrado' });
        }
        res.json({ message: 'Movimiento de stock eliminado exitosamente' });
    });
});

module.exports = router;