const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { requireAdmin } = require('../middlewares/auth');


router.get('/inventario', requireAdmin, (req, res) => {
    const sql = `
        SELECT SUM(pb.cantidad * pb.cost) AS total_inventario
        FROM Product_Batches pb
    `;
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error al obtener valor de inventario:', err);
            return res.status(500).json({
                message: 'Error al obtener valor de inventario',
                error: err.message
            });
        }
        res.json({ total_inventario: results[0]?.total_inventario || 0 });
    });
});

router.get('/caducidad-proxima', requireAdmin, (req, res) => {
    const sql = `
        SELECT p.nombre, pb.fecha_caducidad, pb.cantidad
        FROM Product_Batches pb
        JOIN Productos p ON pb.producto_id = p.id
        WHERE pb.fecha_caducidad BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)
    `;
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error al obtener caducidad-proxima:', err);
            return res.status(500).json({
                message: 'Error al obtener productos próximos a caducar',
                error: err.message
            });
        }
        res.json(results);
    });
});

router.get('/movimientos', requireAdmin, (req, res) => {
    let whereClause = '';
    if (req.query.type === 'weekly') {
        whereClause = `WHERE fecha_movimiento >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)`;
    } else if (req.query.type === 'monthly') {
        whereClause = `WHERE fecha_movimiento >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)`;
    } else { // Default: Daily
        whereClause = `WHERE DATE(fecha_movimiento) = CURDATE()`;
    }

    const sql = `
        SELECT m.id, p.nombre AS producto, m.tipo, m.cantidad, m.motivo, u.nombre AS usuario, m.fecha_movimiento
        FROM Stock_Movements m
        JOIN Productos p ON m.producto_id = p.id
        JOIN usuarios u ON m.usuario_id = u.id
        ${whereClause}
        ORDER BY m.fecha_movimiento DESC
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error al obtener movimientos:', err);
            return res.status(500).json({ message: 'Error al obtener movimientos', error: err.message });
        }
        res.json(results);
    });
});

module.exports = router;