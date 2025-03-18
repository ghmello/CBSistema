const express = require('express');
const router = express.Router();
const db = require('../config/db'); 

function requireAdmin(req, res, next) {
    if (!req.session || !req.session.user) {
        return res.status(401).json({ message: 'No has iniciado sesión' });
    }
    if (req.session.user.rol !== 'admin') {
        return res.status(403).json({ message: 'No eres administrador' });
    }
    next();
}

router.post('/reset-password', requireAdmin, (req, res) => {
    const { id_usuario, nueva_contrasena } = req.body;

    if (!id_usuario || !nueva_contrasena) {
        return res.status(400).json({ message: 'ID de usuario y nueva contraseña son requeridos' });
    }

    const sql = 'UPDATE Usuarios SET contrasena = ? WHERE id = ?';
    db.query(sql, [nueva_contrasena, id_usuario], (err, results) => {
        if (err) {
            console.error('Error resetting password:', err);
            res.status(500).json({ message: 'Error al restablecer la contraseña', error: err.message });
        } else if (results.affectedRows === 0) {
            res.status(404).json({ message: 'Usuario no encontrado' });
        } else {
            res.json({ message: 'Contraseña restablecida exitosamente' });
        }
    });
});

router.get('/reports', requireAdmin, (req, res) => {
    const sql = `
        SELECT 
            (SELECT COUNT(*) FROM Usuarios) AS total_usuarios,
            (SELECT COUNT(*) FROM Productos WHERE cantidad < umbral) AS productos_bajo_inventario,
            (SELECT COUNT(*) FROM Pedidos WHERE estado = 'pendiente') AS pedidos_pendientes
        FROM dual;
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error generating reports:', err);
            res.status(500).json({ message: 'Error al generar reportes', error: err.message });
        } else {
            res.json(results[0]);
        }
    });
});

module.exports = router;