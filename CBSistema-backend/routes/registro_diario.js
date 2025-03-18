const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { requireLogin } = require('../middlewares/auth');

router.get('/', requireLogin, (req, res) => {
    const { fecha } = req.query;
    let sql = 'SELECT * FROM registro_diario';
    const params = [];

    if (fecha) {
        sql += ' WHERE fecha = ?';
        params.push(fecha);
    }

    console.log('Executing SQL:', sql, 'With params:', params); 

    db.query(sql, params, (err, results) => {
        if (err) {
            console.error('Error fetching daily records:', err);
            return res.status(500).json({ message: 'Error fetching daily records', detail: err.code });
        }
        console.log('Fetched daily records:', results);
        res.json(results);
    });
});


router.post('/', requireLogin, (req, res) => {
    const { registros } = req.body;
    console.log('Received registros:', registros); 

    if (!registros || typeof registros !== 'object') {
        return res.status(400).json({ message: 'Registros inválidos' });
    }

    const fechaHoy = new Date().toISOString().slice(0, 10);
    console.log('Fecha hoy:', fechaHoy); 

    const insertValues = [];
    const updates = [];

    Object.entries(registros).forEach(([productId, data]) => {
        const pid = parseInt(productId, 10);
        const inicio = parseInt(data.inicio, 10) || 0;
        const entradas = parseInt(data.entradas, 10) || 0;
        const salidas = parseInt(data.salidas, 10) || 0;
        const finalVal = inicio + entradas - salidas;

        insertValues.push([fechaHoy, pid, inicio, entradas, finalVal]);
        updates.push({ productId: pid, finalVal });
    });

    console.log('Insert values:', insertValues); 
    console.log('Updates:', updates); 

    if (insertValues.length === 0) {
        return res.status(400).json({ message: 'No hay datos para registrar' });
    }

    const sqlInsert = `
        INSERT INTO registro_diario (fecha, producto_id, stock_inicial, stock_recibido, stock_final)
        VALUES ?
    `;

    db.query(sqlInsert, [insertValues], (err, results) => {
        if (err) {
            console.error('Error adding daily records:', err);
            return res.status(500).json({ message: 'Error adding daily records', detail: err.code });
        }

        console.log('Daily records added successfully:', results); 

        let completed = 0;
        updates.forEach(({ productId, finalVal }) => {
            const sqlUpdate = `UPDATE productos SET cantidad = ? WHERE id = ?`;
            db.query(sqlUpdate, [finalVal, productId], (updErr) => {
                if (updErr) {
                    console.error('Error updating product stock:', updErr);
                }
                completed++;
                if (completed === updates.length) {
                    console.log('All product stocks updated successfully'); 
                    return res.status(201).json({ message: 'Registro diario guardado y stock actualizado' });
                }
            });
        });
    });
});

router.put('/:id', requireLogin, (req, res) => {
    const { id } = req.params;
    const { stock_inicial, stock_recibido, stock_final } = req.body;

    const sql = `
        UPDATE registro_diario
        SET stock_inicial = ?, stock_recibido = ?, stock_final = ?
        WHERE id = ?
    `;

    console.log('Executing SQL:', sql, 'With params:', [stock_inicial, stock_recibido, stock_final, id]); 

    db.query(sql, [stock_inicial, stock_recibido, stock_final, id], (err, result) => {
        if (err) {
            console.error('Error updating daily record:', err);
            return res.status(500).json({ message: 'Error updating daily record', detail: err.code });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Registro no encontrado' });
        }
        console.log('Daily record updated successfully:', result); 
        res.json({ message: 'Registro diario actualizado exitosamente' });
    });
});

router.delete('/:id', requireLogin, (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM registro_diario WHERE id = ?';

    console.log('Executing SQL:', sql, 'With params:', [id]); 

    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error('Error deleting daily record:', err);
            return res.status(500).json({ message: 'Error deleting daily record', detail: err.code });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Registro no encontrado' });
        }
        console.log('Daily record deleted successfully:', result); 
        res.json({ message: 'Registro diario eliminado exitosamente' });
    });
});

module.exports = router;