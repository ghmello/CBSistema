const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { requireLogin, requireAdmin } = require('../middlewares/auth'); 

router.get('/', requireLogin, (req, res) => {
    const { status, producto } = req.query;
    let sql = `
        SELECT
          p.id,
          p.cantidad_solicitada,
          p.estado,
          p.fecha_solicitud,
          prod.nombre AS producto_nombre
        FROM Pedidos p
        JOIN Productos prod ON p.id_producto = prod.id
        WHERE 1=1
    `;
    const params = [];

    if (status) {
        sql += ' AND p.estado = ?';
        params.push(status);
    }
    if (producto) {
        sql += ' AND prod.nombre LIKE ?';
        params.push(`%${producto}%`);
    }

    sql += ' ORDER BY p.id ASC';

    db.query(sql, params, (err, results) => {
        if (err) {
            console.error('Error al obtener pedidos:', err);
            return res.status(500).json({ message: 'Error al obtener pedidos', detail: err.code });
        }
        res.json(results);
    });
});

router.post('/', requireLogin, (req, res) => {
    const { id_producto, id_usuario, cantidad_solicitada } = req.body;

    if (!id_producto || !id_usuario) {
        return res.status(400).json({ message: 'id_producto e id_usuario son requeridos' });
    }
    if (!cantidad_solicitada || cantidad_solicitada < 1) {
        return res.status(400).json({ message: 'cantidad_solicitada debe ser > 0' });
    }

    const sql = `
        INSERT INTO Pedidos (id_producto, id_usuario, cantidad_solicitada, estado, fecha_solicitud)
        VALUES (?, ?, ?, 'pendiente', NOW())
    `;
    db.query(sql, [id_producto, id_usuario, cantidad_solicitada], (err, results) => {
        if (err) {
            console.error('Error al crear pedido:', err);
            return res.status(500).json({ message: 'Error al crear pedido', detail: err.code });
        }
        res.status(201).json({
            message: 'Pedido creado exitosamente',
            id: results.insertId
        });
    });
});

router.put('/:id', requireAdmin, (req, res) => {
    const { id } = req.params;
    const { estado, cantidad_solicitada } = req.body;

    const validStates = ['pendiente', 'aprobado', 'rechazado', 'en_transito', 'recibido'];
    if (estado && !validStates.includes(estado)) {
        return res.status(400).json({ message: 'Estado inválido' });
    }
    if (cantidad_solicitada && cantidad_solicitada < 1) {
        return res.status(400).json({ message: 'cantidad_solicitada debe ser > 0' });
    }

    const sql = `
        UPDATE Pedidos
        SET
          estado = COALESCE(?, estado),
          cantidad_solicitada = COALESCE(?, cantidad_solicitada)
        WHERE id = ?
    `;
    db.query(sql, [estado || null, cantidad_solicitada || null, id], (err, results) => {
        if (err) {
            console.error('Error al actualizar pedido:', err);
            return res.status(500).json({ message: 'Error al actualizar pedido', detail: err.code });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Pedido no encontrado' });
        }
        res.json({ message: 'Pedido actualizado exitosamente' });
    });
});

router.delete('/:id', requireAdmin, (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM Pedidos WHERE id = ?';
    db.query(sql, [id], (err, results) => {
        if (err) {
            console.error('Error al eliminar pedido:', err);
            return res.status(500).json({ message: 'Error al eliminar pedido', detail: err.code });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Pedido no encontrado' });
        }

        const sqlCount = 'SELECT COUNT(*) AS total FROM Pedidos';
        db.query(sqlCount, (err2, result2) => {
            if (err2) {
                console.error('Error counting pedidos:', err2);
                return res.json({ message: 'Pedido eliminado exitosamente' });
            }
            const total = result2[0].total;
            if (total === 0) {
                const sqlReset = 'ALTER TABLE Pedidos AUTO_INCREMENT = 1';
                db.query(sqlReset, () => {
                    return res.json({ message: 'Pedido eliminado y IDs reiniciados (tabla vacía)' });
                });
            } else {
                res.json({ message: 'Pedido eliminado exitosamente' });
            }
        });
    });
});

router.post('/pending-auto-trigger', requireAdmin, (req, res) => {
    const HOURS_THRESHOLD = 24;

    const sql = `
        SELECT id
        FROM Pedidos
        WHERE estado = 'pendiente'
          AND TIMESTAMPDIFF(HOUR, fecha_solicitud, NOW()) > ?
    `;
    db.query(sql, [HOURS_THRESHOLD], (err, pending) => {
        if (err) {
            console.error('Error finding pending pedidos:', err);
            return res.status(500).json({ message: 'Error finding pending pedidos', detail: err.code });
        }
        if (pending.length === 0) {
            return res.json({ message: 'No pending pedidos older than threshold' });
        }

        const notifs = pending.map(p => ([
            'Pedido Pendiente',
            `El pedido #${p.id} lleva más de ${HOURS_THRESHOLD}h sin aprobación`,
            1,
            0
        ]));

        const sqlInsert = `
            INSERT INTO Notificaciones (titulo, mensaje, id_usuario, leida)
            VALUES ?
        `;
        db.query(sqlInsert, [notifs], (insErr) => {
            if (insErr) {
                console.error('Error inserting notifications:', insErr);
                return res.status(500).json({ message: 'Error inserting notifications', detail: insErr.code });
            }
            res.json({ message: 'Notificaciones generadas para pedidos pendientes' });
        });
    });
});

module.exports = router;