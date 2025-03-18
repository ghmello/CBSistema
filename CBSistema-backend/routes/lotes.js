// routes/lotes.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { requireLogin, requireAdmin } = require('../middlewares/auth');

router.get('/', requireLogin, (req, res) => {
    const sql = 'SELECT * FROM Product_Batches ORDER BY id DESC';
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error al obtener lotes:', err);
            return res.status(500).json({ message: 'Error al obtener lotes' });
        }
        res.json(results);
    });
});

router.post('/', requireAdmin, (req, res) => {
    const { producto_id, cantidad, fecha_caducidad, cost, almacen_id } = req.body;

    if (!producto_id || !cantidad) {
        return res.status(400).json({ message: 'producto_id y cantidad son obligatorios' });
    }

    const sqlInsert = `
    INSERT INTO Product_Batches (producto_id, cantidad, fecha_caducidad, cost, almacen_id)
    VALUES (?, ?, ?, ?, ?)
  `;
    db.query(sqlInsert, [producto_id, cantidad, fecha_caducidad, cost, almacen_id], (err, results) => {
        if (err) {
            console.error('Error al agregar lote:', err);
            return res.status(500).json({ message: 'Error al agregar lote' });
        }

        const batchId = results.insertId;

        const sqlUpdate = `
      UPDATE Productos
      SET cantidad = cantidad + ?
      WHERE id = ?
    `;
        db.query(sqlUpdate, [cantidad, producto_id], (err2) => {
            if (err2) {
                console.error('Error al actualizar cantidad en Productos:', err2);
                return res.status(500).json({
                    message: 'Error al actualizar cantidad del producto'
                });
            }
            res.status(201).json({
                message: 'Lote agregado y cantidad de producto actualizada exitosamente',
                lote_id: batchId
            });
        });
    });
});

router.delete('/:id', requireAdmin, (req, res) => {
    const { id } = req.params;

    const sqlFind = 'SELECT producto_id, cantidad FROM Product_Batches WHERE id = ?';
    db.query(sqlFind, [id], (err, results) => {
        if (err) {
            console.error('Error fetching batch:', err);
            return res.status(500).json({ message: 'Error fetching batch' });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: 'Batch not found' });
        }

        const { producto_id, cantidad } = results[0];

        const sqlDelete = 'DELETE FROM Product_Batches WHERE id = ?';
        db.query(sqlDelete, [id], (err2, deleteResult) => {
            if (err2) {
                console.error('Error deleting batch:', err2);
                return res.status(500).json({ message: 'Error deleting batch' });
            }
            if (deleteResult.affectedRows === 0) {
                return res.status(404).json({ message: 'Batch not found' });
            }

            const sqlUpdate = 'UPDATE Productos SET cantidad = cantidad - ? WHERE id = ?';
            db.query(sqlUpdate, [cantidad, producto_id], (err3) => {
                if (err3) {
                    console.error('Error updating product quantity:', err3);
                    return res.status(500).json({
                        message: 'Error updating product quantity after batch deletion'
                    });
                }
                res.json({ message: 'Batch deleted and product quantity updated successfully' });
            });
        });
    });
});

module.exports = router;