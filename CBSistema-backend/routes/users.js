// routes/users.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { requireLogin } = require('../middlewares/auth');
// const bcrypt = require('bcrypt');


router.get('/', (req, res) => {
    db.query('SELECT id, nombre, rol, creado_el FROM Usuarios', (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Error al obtener usuarios' });
        }
        res.json(results);
    });
});


router.get('/me', requireLogin, (req, res) => {
    console.log(" Checking session in /me:", req.session); 
    if (!req.session.user) {
        return res.status(401).json({ message: 'No has iniciado sesión' });
    }
    res.json(req.session.user);
});

router.get('/:id', (req, res) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ message: 'ID de usuario es requerido' });
    }

    db.query('SELECT id, nombre, rol, creado_el FROM Usuarios WHERE id = ?', [id], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Error al obtener usuario' });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        res.json(results[0]);
    });
});

router.post('/', (req, res) => {
    const { nombre, rol, contrasena } = req.body;

    if (!nombre || !rol || !contrasena) {
        return res.status(400).json({ message: 'nombre, rol, y contrasena son requeridos' });
    }

    const sql = 'INSERT INTO Usuarios (nombre, rol, contrasena) VALUES (?, ?, ?)';
    db.query(sql, [nombre, rol, contrasena], (err, results) => {
        if (err) {
            console.error('Database Error:', err); 
            return res.status(500).json({ message: 'Error al crear usuario', error: err.code });
        }
        res.status(201).json({ message: 'Usuario creado exitosamente', id: results.insertId });
    });
});


router.post('/login', (req, res) => {
    const { nombre, contrasena } = req.body;
    if (!nombre || !contrasena) {
        return res.status(400).json({ message: 'Nombre y contraseña son requeridos' });
    }

    const sql = 'SELECT * FROM Usuarios WHERE nombre = ? AND contrasena = ? LIMIT 1';
    db.query(sql, [nombre, contrasena], (err, results) => {
        if (err) {
            console.error('Error al autenticar usuario:', err);
            return res.status(500).json({ message: 'Error en el servidor' });
        }
        if (results.length === 0) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        const user = results[0];
        req.session.user = {
            id: user.id,
            nombre: user.nombre,
            rol: user.rol
        };

        console.log("Succesful after login:", req.session);  

        return res.json({ message: 'Inicio de sesión exitoso', user: req.session.user });
    });
});


router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { nombre, rol } = req.body;

    if (!id) {
        return res.status(400).json({ message: 'ID de usuario es requerido' });
    }
    if (!nombre || !rol) {
        return res.status(400).json({ message: 'Nombre y rol son requeridos' });
    }

    const sql = 'UPDATE Usuarios SET nombre = ?, rol = ? WHERE id = ?';
    db.query(sql, [nombre, rol, id], (err, results) => {
        if (err) {
            console.error('Error updating user:', err);
            return res.status(500).json({ message: 'Error al actualizar usuario' });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        res.json({ message: 'Usuario actualizado exitosamente' });
    });
});


router.delete('/:id', (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ message: 'ID de usuario es requerido' });
    }

    const sql = 'DELETE FROM Usuarios WHERE id = ?';
    db.query(sql, [id], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Error al eliminar usuario' });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        res.json({ message: 'Usuario eliminado exitosamente' });
    });
});


router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error al cerrar sesión:', err);
            return res.status(500).json({ message: 'No se pudo cerrar la sesión' });
        }
        res.clearCookie('connect.sid');
        res.json({ message: 'Sesión cerrada con éxito' });
    });
});

module.exports = router;