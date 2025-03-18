const express = require('express');
const router = express.Router();
const db = require('../config/db'); 

function requireLogin(req, res, next) {
    if (!req.session.user) {
        return res.status(401).json({ message: 'No has iniciado sesión' });
    }
    next();
}

router.get('/', /* requireLogin, */(req, res) => {
    console.log('Fetching all notifications');
    const sql = 'SELECT * FROM Notificaciones ORDER BY creado_el DESC';
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching notifications:', err);
            return res.status(500).json({ message: 'Error fetching notifications', error: err.message });
        }
        res.json(results);
    });
});


router.post('/', /* requireLogin, */(req, res) => {
    const { titulo, mensaje, id_usuario } = req.body;
    console.log('Creating notification:', req.body);

    const finalTitulo = titulo && titulo.trim() ? titulo : 'Stock Alert';

    const sql = `
        INSERT INTO Notificaciones (titulo, mensaje, id_usuario, leida)
        VALUES (?, ?, ?, ?)
    `;
    db.query(sql, [finalTitulo, mensaje, id_usuario, false], (err, results) => {
        if (err) {
            console.error('Error creating notification:', err);
            return res.status(500).json({ message: 'Error creating notification', error: err.message });
        }
        res.status(201).json({ message: 'Notification created successfully', id: results.insertId });
    });
});


router.put('/:id/read', requireLogin, (req, res) => {
    const { id } = req.params;
    db.query('UPDATE Notificaciones SET leida = 1 WHERE id = ?', [id], (err, result) => {
        if (err) {
            console.error('Error marking notification read:', err);
            return res.status(500).json({ message: 'Error marking notification read' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Notificación no encontrada' });
        }
        res.json({ message: 'Notificación marcada como leída' });
    });
});


router.delete('/:id', (req, res) => {
    const { id } = req.params;
    console.log('Deleting notification:', id);

    const sql = 'DELETE FROM Notificaciones WHERE id = ?';
    db.query(sql, [id], (err, results) => {
        if (err) {
            console.error('Error deleting notification:', err);
            return res.status(500).json({ message: 'Error deleting notification', error: err.message });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Notification not found' });
        }
        res.json({ message: 'Notification deleted successfully' });
    });
});

module.exports = router;