// src/pages/ProductsPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { Container, Table, Button, Form, Alert, Row, Col } from 'react-bootstrap';
import api from '../api';

const initialFormState = {
    id: null,
    nombre: '',
    cantidad: 0,
    umbral: 0,
    proveedor: '',
    cost: 0
};

function ProductsPage() {
    const [products, setProducts] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [editMode, setEditMode] = useState(false);
    const [form, setForm] = useState(initialFormState);
    const [sortOption, setSortOption] = useState('none');

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        try {
            setError('');
            setSuccess('');
            const res = await api.get('/productos'); 
            setProducts(res.data);
        } catch (err) {
            console.error('Error fetching products:', err);
            setError('Error al obtener productos');
        }
    };

    // Sort products with useMemo (only when `products` or `sortOption` changes)
    const sortedProducts = useMemo(() => {
        if (!products || products.length === 0) return [];

        const sorted = [...products];
        if (sortOption === 'nombre') {
            sorted.sort((a, b) => a.nombre.localeCompare(b.nombre));
        } else if (sortOption === 'cantidad') {
            sorted.sort((a, b) => a.cantidad - b.cantidad);
        }
        return sorted;
    }, [products, sortOption]);

    // Generic handleChange for form fields
    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: name === 'cantidad' || name === 'umbral' || name === 'cost'
                ? Number(value)
                : value
        }));
    };

    // Switch to "edit mode" and populate the form with product data
    const handleEditClick = (product) => {
        setError('');
        setSuccess('');
        setEditMode(true);
        setForm({
            id: product.id,
            nombre: product.nombre,
            cantidad: product.cantidad,
            umbral: product.umbral,
            proveedor: product.proveedor,
            cost: product.cost
        });
    };

    // Delete a product locally + on server
    const handleDeleteProduct = async (id) => {
        setError('');
        setSuccess('');
        try {
            await api.delete(`/productos/${id}`); 
            setProducts((prev) => prev.filter((p) => p.id !== id));
            setSuccess('Producto eliminado exitosamente');
        } catch (err) {
            console.error('Error deleting product:', err);
            setError('Error al eliminar producto');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (editMode) {
            try {
                await api.put(`/productos/${form.id}`, {
                    nombre: form.nombre,
                    cantidad: form.cantidad,
                    umbral: form.umbral,
                    proveedor: form.proveedor,
                    cost: form.cost
                });

                setProducts((prev) =>
                    prev.map((p) =>
                        p.id === form.id ? { ...p, ...form } : p
                    )
                );
                setSuccess('Producto editado exitosamente');
                cancelEdit();
            } catch (err) {
                console.error('Error editing product:', err);
                setError('Error al editar producto');
            }
        } else {
            try {
                const res = await api.post('/productos', {
                    nombre: form.nombre,
                    cantidad: form.cantidad,
                    umbral: form.umbral,
                    proveedor: form.proveedor,
                    cost: form.cost
                });
                const newProduct = res.data;
                setProducts((prev) => [...prev, newProduct]);

                setSuccess('Producto agregado exitosamente');
                resetForm();
            } catch (err) {
                console.error('Error adding product:', err);
                setError('Error al agregar producto');
            }
        }
    };

    const resetForm = () => {
        setForm(initialFormState);
    };

    const cancelEdit = () => {
        setEditMode(false);
        resetForm();
    };

    const handleSortChange = (e) => {
        setSortOption(e.target.value);
    };

    return (
        <Container className="mt-4">
            <h2>Productos</h2>
            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}

            {/* Sort Dropdown */}
            <Row className="mb-3">
                <Col xs={12} sm={6}>
                    <Form.Label>Ordenar Productos</Form.Label>
                    <Form.Select value={sortOption} onChange={handleSortChange}>
                        <option value="none">Sin Orden</option>
                        <option value="nombre">Alfabético (Nombre)</option>
                        <option value="cantidad">Por Cantidad (Asc)</option>
                    </Form.Select>
                </Col>
            </Row>

            {/* Products Table */}
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Cantidad</th>
                        <th>Umbral</th>
                        <th>Proveedor</th>
                        <th>Cost</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {sortedProducts.map((p) => (
                        <tr key={p.id}>
                            <td>{p.id}</td>
                            <td>{p.nombre}</td>
                            <td>{p.cantidad}</td>
                            <td>{p.umbral}</td>
                            <td>{p.proveedor}</td>
                            <td>{p.cost}</td>
                            <td>
                                <Button
                                    variant="warning"
                                    size="sm"
                                    onClick={() => handleEditClick(p)}
                                >
                                    Editar
                </Button>
                                <Button
                                    variant="danger"
                                    size="sm"
                                    className="ms-2"
                                    onClick={() => handleDeleteProduct(p.id)}
                                >
                                    Eliminar
                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            <hr />
            <h4>{editMode ? 'Editar Producto' : 'Añadir Nuevo Producto'}</h4>
            <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                    <Form.Label>Nombre</Form.Label>
                    <Form.Control
                        name="nombre"
                        value={form.nombre}
                        onChange={handleChange}
                    />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Cantidad</Form.Label>
                    <Form.Control
                        type="number"
                        name="cantidad"
                        value={form.cantidad}
                        onChange={handleChange}
                    />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Umbral</Form.Label>
                    <Form.Control
                        type="number"
                        name="umbral"
                        value={form.umbral}
                        onChange={handleChange}
                    />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Proveedor</Form.Label>
                    <Form.Control
                        name="proveedor"
                        value={form.proveedor}
                        onChange={handleChange}
                    />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Cost</Form.Label>
                    <Form.Control
                        type="number"
                        step="0.01"
                        name="cost"
                        value={form.cost}
                        onChange={handleChange}
                    />
                </Form.Group>

                <Button type="submit" variant={editMode ? 'warning' : 'primary'}>
                    {editMode ? 'Guardar Cambios' : 'Agregar Producto'}
                </Button>
                {editMode && (
                    <Button variant="secondary" className="ms-2" onClick={cancelEdit}>
                        Cancelar
                    </Button>
                )}
            </Form>
        </Container>
    );
}

export default ProductsPage;