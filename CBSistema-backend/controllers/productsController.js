const db = require('../config/db'); // Import database connection

// Fetch all products
exports.getAllProducts = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM Productos');
        res.json(rows); // Send the results as JSON
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching products');
    }
};

// Add a new product
exports.createProduct = async (req, res) => {
    const { nombre, cantidad, nivel_minimo, proveedor } = req.body;
    try {
        await db.query(
            'INSERT INTO Productos (nombre, cantidad, nivel_minimo, proveedor) VALUES (?, ?, ?, ?)',
            [nombre, cantidad, nivel_minimo, proveedor]
        );
        res.status(201).send('Product created successfully');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error creating product');
    }
};

// Update a product by ID
exports.updateProduct = async (req, res) => {
    const { id } = req.params;
    const { nombre, cantidad, nivel_minimo, proveedor } = req.body;
    try {
        await db.query(
            'UPDATE Productos SET nombre = ?, cantidad = ?, nivel_minimo = ?, proveedor = ? WHERE id = ?',
            [nombre, cantidad, nivel_minimo, proveedor, id]
        );
        res.send('Product updated successfully');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error updating product');
    }
};

// Delete a product by ID
exports.deleteProduct = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM Productos WHERE id = ?', [id]);
        res.send('Product deleted successfully');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error deleting product');
    }
};