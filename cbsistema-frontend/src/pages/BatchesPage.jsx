import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Form, Alert } from 'react-bootstrap';
import api from '../api';

function BatchesPage() {
    const [batches, setBatches] = useState([]);
    const [form, setForm] = useState({
        producto_id: '',
        cantidad: 1,
        fecha_caducidad: '',
        cost: 0,
        almacen_id: ''
    });
    const [error, setError] = useState('');

    useEffect(() => {
        loadBatches();
    }, []);

    const loadBatches = async () => {
        try {
            const res = await api.get('/lotes'); 
            setBatches(res.data);
        } catch (err) {
            console.error('Error al obtener lotes:', err);
            setError('Error al obtener lotes');
        }
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleAddBatch = async (e) => {
        e.preventDefault();
        try {
            await api.post('/lotes', form); 
            setForm({
                producto_id: '',
                cantidad: 1,
                fecha_caducidad: '',
                cost: 0,
                almacen_id: ''
            });
            loadBatches();
        } catch (err) {
            console.error('Error al crear lote:', err);
            setError('Error al crear lote');
        }
    };

    return (
        <Container className="mt-4">
            <h2>Lotes (Batches)</h2>
            {error && <Alert variant="danger">{error}</Alert>}

            <Table striped bordered hover className="mt-3">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>ID Producto</th>
                        <th>Cantidad</th>
                        <th>Fecha Caducidad</th>
                        <th>Cost</th>
                        <th>Almacén ID</th>
                    </tr>
                </thead>
                <tbody>
                    {batches.map((b) => (
                        <tr key={b.id}>
                            <td>{b.id}</td>
                            <td>{b.producto_id}</td>
                            <td>{b.cantidad}</td>
                            <td>{b.fecha_caducidad || 'N/A'}</td>
                            <td>{b.cost}</td>
                            <td>{b.almacen_id || 'N/A'}</td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            <hr />
            <h4>Crear Nuevo Lote</h4>
            <Form onSubmit={handleAddBatch}>
                <Form.Group className="mb-3">
                    <Form.Label>ID Producto</Form.Label>
                    <Form.Control
                        name="producto_id"
                        value={form.producto_id}
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
                    <Form.Label>Fecha Caducidad</Form.Label>
                    <Form.Control
                        type="date"
                        name="fecha_caducidad"
                        value={form.fecha_caducidad}
                        onChange={handleChange}
                    />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Costo</Form.Label>
                    <Form.Control
                        type="number"
                        step="0.01"
                        name="cost"
                        value={form.cost}
                        onChange={handleChange}
                    />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Almacén ID</Form.Label>
                    <Form.Control
                        name="almacen_id"
                        value={form.almacen_id}
                        onChange={handleChange}
                    />
                </Form.Group>
                <Button type="submit" variant="primary">
                    Crear Lote
        </Button>
            </Form>
        </Container>
    );
}

export default BatchesPage;