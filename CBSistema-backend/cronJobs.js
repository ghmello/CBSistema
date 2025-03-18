const cron = require('node-cron');
const db = require('./config/db');

// If you have a dedicated admin user you want to tie notifications to:
const ADMIN_USER_ID = 1;  // or whichever user ID is the "main" admin

// 1) Low Stock Notification
// Runs every day at 3 AM
cron.schedule('0 3 * * *', () => {
    console.log('[Cron] Checking low stock...');

    const sqlLowStock = `
    SELECT id, nombre, cantidad, umbral
    FROM Productos
    WHERE cantidad < umbral
  `;
    db.query(sqlLowStock, (err, products) => {
        if (err) {
            console.error('Error checking low stock:', err);
            return;
        }
        products.forEach(product => {
            const titulo = 'low_stock';  // short label
            const msg = `El producto "${product.nombre}" está por debajo del umbral (cant: ${product.cantidad}, umbral: ${product.umbral}).`;

            const sqlInsert = `
        INSERT INTO notificaciones (titulo, id_usuario, mensaje, producto_id)
        VALUES (?, ?, ?, ?)
      `;
            db.query(sqlInsert, [titulo, ADMIN_USER_ID, msg, product.id], (err2) => {
                if (err2) {
                    console.error('Error inserting low stock notification:', err2);
                } else {
                    console.log(`[Cron] Low-stock notification inserted for product ID=${product.id}`);
                }
            });
        });
    });
});

// 2) Near Expiry Notification
// Runs every day at 3:30 AM
cron.schedule('30 3 * * *', () => {
    console.log('[Cron] Checking near-expiry batches...');

    const sqlNearExpiry = `
    SELECT pb.id AS batch_id, pb.producto_id, p.nombre, pb.fecha_caducidad, pb.cantidad
    FROM Product_Batches pb
    JOIN Productos p ON pb.producto_id = p.id
    WHERE pb.fecha_caducidad BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)
  `;
    db.query(sqlNearExpiry, (err, batches) => {
        if (err) {
            console.error('Error checking near-expiry batches:', err);
            return;
        }
        batches.forEach(b => {
            const titulo = 'near_expiry';
            const msg = `El lote #${b.batch_id} del producto "${b.nombre}" vence pronto (${b.fecha_caducidad}). Cantidad: ${b.cantidad}.`;

            const sqlInsert = `
        INSERT INTO notificaciones (titulo, id_usuario, mensaje, producto_id)
        VALUES (?, ?, ?, ?)
      `;
            db.query(sqlInsert, [titulo, ADMIN_USER_ID, msg, b.producto_id], (err2) => {
                if (err2) {
                    console.error('Error inserting near expiry notification:', err2);
                } else {
                    console.log(`[Cron] Near-expiry notification inserted for batch ID=${b.batch_id}`);
                }
            });
        });
    });
});
