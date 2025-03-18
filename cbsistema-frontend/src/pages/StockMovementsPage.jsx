import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Form, Alert } from 'react-bootstrap';
import api from '../api';

function StockMovementsPage() {
    const [movements, setMovements] = useState([]);
    const [form, setForm] = useState({
        producto_id: '',
        tipo: 'entrada', 
        cantidad: 1,
        motivo: '',
        usuario_id: ''
    });
    const [error, setError] = useState('');

    useEffect(() => {
        loadMovements();
    }, []);

    const loadMovements = async () => {
        try {
            const res = await api.get('/api/movimientos');
            console.log('API Response:', res.data); 
            setMovements(res.data);
        } catch (err) {
            console.error('Error al obtener movimientos de stock:', err);
            setError('Error al obtener movimientos');
        }
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleAddMovement = async (e) => {
        e.preventDefault();
        try {
            await api.post('/api/movimientos', form); 
            setForm({
                producto_id: '',
                tipo: 'entrada',
                cantidad: 1,
                motivo: '',
                usuario_id: ''
            });
            loadMovements();
        } catch (err) {
            console.error('Error al crear movimiento de stock:', err);
            setError('Error al crear movimiento');
        }
    };

    useEffect(() => {
        console.log('Movements State:', movements); 
    }, [movements]);

    return (
        <Container className="mt-4">
            <h2>Movimientos de Stock</h2>
            {error && <Alert variant="danger">{error}</Alert>}

            <Table striped bordered hover className="mt-3">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>ID Producto</th>
                        <th>Tipo</th>
                        <th>Cantidad</th>
                        <th>Motivo</th>
                        <th>Usuario ID</th>
                        <th>Fecha Movimiento</th>
                    </tr>
                </thead>
                <tbody>
                    {movements.map(m => (
                        <tr key={m.id}>
                            <td>{m.id}</td>
                            <td>{m.producto_id}</td>
                            <td>{m.tipo}</td>
                            <td>{m.cantidad}</td>
                            <td>{m.motivo}</td>
                            <td>{m.usuario_id}</td>
                            <td>{m.fecha_movimiento}</td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            <hr />
            <h4>Registrar Nuevo Movimiento</h4>
            <Form onSubmit={handleAddMovement}>
                <Form.Group className="mb-3">
                    <Form.Label>ID Producto</Form.Label>
                    <Form.Control
                        name="producto_id"
                        value={form.producto_id}
                        onChange={handleChange}
                    />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Tipo</Form.Label>
                    <Form.Select
                        name="tipo"
                        value={form.tipo}
                        onChange={handleChange}
                    >
                        <option value="entrada">Entrada</option>
                        <option value="salida">Salida</option>
                        <option value="devolucion">Devolución</option>
                        <option value="dano">Daño</option>
                    </Form.Select>
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
                    <Form.Label>Motivo</Form.Label>
                    <Form.Control
                        name="motivo"
                        value={form.motivo}
                        onChange={handleChange}
                    />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>ID Usuario</Form.Label>
                    <Form.Control
                        name="usuario_id"
                        value={form.usuario_id}
                        onChange={handleChange}
                    />
                </Form.Group>
                <Button variant="primary" type="submit">
                    Crear Movimiento
                </Button>
            </Form>
        </Container>
    );
}

export default StockMovementsPage;