const express = require('express');
const router = express.Router();
const db = require('../config/db'); // Database connection

function requireAdmin(req, res, next) {
  if (!req.session.user) {
    return res.status(401).json({ message: 'No has iniciado sesión' });
  }
  if (req.session.user.rol !== 'admin') {
    return res.status(403).json({ message: 'No eres administrador' });
  }
  next();
}

router.get('/', /* requireAdmin, */(req, res) => {
    const sql = 'SELECT * FROM Logs ORDER BY creado_el DESC';
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching logs:', err);
            return res.status(500).json({ message: 'Error al obtener los logs' });
        }
        res.json(results);
    });
});

router.delete('/', /* requireAdmin, */(req, res) => {
    const sql = 'DELETE FROM Logs';
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error clearing logs:', err);
            return res.status(500).json({ message: 'Error al limpiar los logs' });
        }
        if (results.affectedRows === 0) {
            return res.json({ message: 'No hay logs para eliminar' });
        }
        res.json({ message: 'Todos los logs se han eliminado exitosamente' });
    });
});

module.exports = router;