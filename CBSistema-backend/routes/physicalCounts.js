const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { requireLogin } = require('../middlewares/auth');

router.post('/', requireLogin, (req, res) => {
    const { producto_id, conteo_fisico, fecha } = req.body;
    if (!producto_id || conteo_fisico == null) {
        return res.status(400).json({ message: 'producto_id y conteo_fisico son requeridos' });
    }

    const actualFecha = fecha || new Date().toISOString().slice(0, 10);
    const sql = `
    INSERT INTO Physical_Counts (producto_id, fecha, conteo_fisico)
    VALUES (?, ?, ?)
  `;
    db.query(sql, [producto_id, actualFecha, conteo_fisico], (err, results) => {
        if (err) {
            console.error('Error al registrar conteo físico:', err);
            return res.status(500).json({ message: 'Error al registrar conteo físico' });
        }
        res.status(201).json({ message: 'Conteo físico registrado', id: results.insertId });
    });
});

router.get('/', requireLogin, (req, res) => {
    const { producto_id } = req.query;
    let sql = 'SELECT * FROM Physical_Counts';
    const params = [];

    if (producto_id) {
        sql += ' WHERE producto_id = ?';
        params.push(producto_id);
    }
    sql += ' ORDER BY fecha DESC';

    db.query(sql, params, (err, results) => {
        if (err) {
            console.error('Error al obtener conteos físicos:', err);
            return res.status(500).json({ message: 'Error al obtener conteos físicos' });
        }
        res.json(results);
    });
});

module.exports = router;
