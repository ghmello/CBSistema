// routes/categories.js
const express = require('express');
const router = express.Router();
const db = require('../config/db'); 

function requireAdmin(req, res, next) {
  if (!req.session.user) {
    return res.status(401).json({ message: 'No has iniciado sesión' });
  }
  if (req.session.user.rol !== 'admin') {
    return res.status(403).json({ message: 'No eres administrador' });
  }
  next();
}


router.get('/', (req, res) => {
    const sql = 'SELECT * FROM Categorias';
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching categories:', err);
            return res.status(500).json({ message: 'Error al obtener las categorías' });
        }
        res.json(results);
    });
});

router.post('/', /* requireAdmin, */(req, res) => {
    const { nombre, descripcion } = req.body;

    const sql = `
        INSERT INTO Categorias (nombre, descripcion, creado_el)
        VALUES (?, ?, NOW())
    `;
    db.query(sql, [nombre, descripcion], (err, results) => {
        if (err) {
            console.error('Error creating category:', err);
            return res.status(500).json({ message: 'Error al crear la categoría' });
        }
        res.status(201).json({ message: 'Categoría creada exitosamente', id: results.insertId });
    });
});

router.put('/:id', /* requireAdmin, */(req, res) => {
    const { id } = req.params;
    const { nombre, descripcion } = req.body;

    const sql = 'UPDATE Categorias SET nombre = ?, descripcion = ? WHERE id = ?';
    db.query(sql, [nombre, descripcion, id], (err, results) => {
        if (err) {
            console.error('Error updating category:', err);
            return res.status(500).json({ message: 'Error al actualizar la categoría' });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Categoría no encontrada' });
        }
        res.json({ message: 'Categoría actualizada exitosamente' });
    });
});

router.delete('/:id', /* requireAdmin, */(req, res) => {
    const { id } = req.params;

    const sql = 'DELETE FROM Categorias WHERE id = ?';
    db.query(sql, [id], (err, results) => {
        if (err) {
            console.error('Error deleting category:', err);
            return res.status(500).json({ message: 'Error al eliminar la categoría' });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Categoría no encontrada' });
        }
        res.json({ message: 'Categoría eliminada exitosamente' });
    });
});

module.exports = router;