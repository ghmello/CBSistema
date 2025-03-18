import React, { useEffect, useState } from 'react';
import { Container, Table, Form, Button, Alert, Row, Col, Badge } from 'react-bootstrap';
import api from '../api';

function RegistroDiarioPage() {
    const [productos, setProductos] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [registro, setRegistro] = useState({});
    const [dateFilter, setDateFilter] = useState('');
    const [dailyLogs, setDailyLogs] = useState([]);
    const [sortType, setSortType] = useState('none');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadProductos();
        loadDailyLogs();
    }, []);

    const loadDailyLogs = async (fecha = '') => {
        try {
            let url = '/registro_diario';
            if (fecha) {
                url += `?fecha=${fecha}`;
            }
            const res = await api.get(url);
            setDailyLogs(res.data);
        } catch (err) {
            console.error('Error al obtener registros diarios:', err);
            setError('Error al obtener registros diarios');
        }
    };

    const loadProductos = async () => {
        try {
            const res = await api.get('/productos');
            setProductos(res.data);
        } catch (err) {
            console.error('Error al obtener productos:', err);
            setError('Error al obtener productos');
        }
    };

    const handleChange = (productId, field, value) => {
        setRegistro(prev => ({
            ...prev,
            [productId]: {
                ...prev[productId],
                [field]: parseInt(value, 10) || 0
            }
        }));
    };

    const handleSubmit = async () => {
        setError('');
        setSuccess('');
        try {
            await api.post('/registro_diario', { registros: registro });
            setSuccess('Registro diario guardado correctamente. Stock actualizado.');
            setRegistro({});
            loadDailyLogs();
        } catch (err) {
            console.error('Error guardando registro diario:', err);
            setError('Error al guardar registro diario');
        }
    };

    const handleDateFilter = (e) => {
        setDateFilter(e.target.value);
    };

    const applyDateFilter = () => {
        loadDailyLogs(dateFilter);
    };

    const getProductName = (id) => {
        const product = productos.find(p => p.id === id);
        return product ? product.nombre : 'Desconocido';
    };

    const handleSortChange = (e) => {
        setSortType(e.target.value);
    };

    const sortedLogs = [...dailyLogs]
        .filter(log => getProductName(log.producto_id).toLowerCase().includes(searchTerm.toLowerCase()))
        .sort((a, b) => {
            switch (sortType) {
                case 'min-max':
                    return a.stock_final - b.stock_final;
                case 'max-min':
                    return b.stock_final - a.stock_final;
                case 'a-z':
                    return getProductName(a.producto_id).localeCompare(getProductName(b.producto_id));
                case 'z-a':
                    return getProductName(b.producto_id).localeCompare(getProductName(a.producto_id));
                default:
                    return 0;
            }
        });

    return (
        <Container className="mt-4">
            <h2>Registro Diario</h2>
            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}

            <Row className="mb-3">
                <Col xs={6} md={3}>
                    <Form.Control
                        type="date"
                        value={dateFilter}
                        onChange={handleDateFilter}
                    />
                </Col>
                <Col xs={6} md={3}>
                    <Button variant="primary" onClick={applyDateFilter}>Filtrar</Button>
                </Col>
            </Row>

            <h5>Crear o Actualizar Stock de Hoy</h5>
            <Table striped bordered hover className="mt-3">
                <thead>
                    <tr>
                        <th>Producto</th>
                        <th>Stock Inicial</th>
                        <th>Entradas</th>
                        <th>Salidas</th>
                        <th>Stock Final (Vista Previa)</th>
                    </tr>
                </thead>
                <tbody>
                    {productos.map((p) => {
                        const data = registro[p.id] || {};
                        const finalVal = (data.inicio || 0) + (data.entradas || 0) - (data.salidas || 0);
                        return (
                            <tr key={p.id}>
                                <td>{p.nombre}</td>
                                <td>
                                    <Form.Control
                                        type="number"
                                        placeholder="0"
                                        value={data.inicio || ''}
                                        onChange={(e) => handleChange(p.id, 'inicio', e.target.value)}
                                    />
                                </td>
                                <td>
                                    <Form.Control
                                        type="number"
                                        placeholder="0"
                                        value={data.entradas || ''}
                                        onChange={(e) => handleChange(p.id, 'entradas', e.target.value)}
                                    />
                                </td>
                                <td>
                                    <Form.Control
                                        type="number"
                                        placeholder="0"
                                        value={data.salidas || ''}
                                        onChange={(e) => handleChange(p.id, 'salidas', e.target.value)}
                                    />
                                </td>
                                <td>{finalVal}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </Table>

            <Button variant="primary" className="mt-3" onClick={handleSubmit}>
                Guardar Registro
            </Button>

            <hr />
            <h5>Registros Existentes</h5>

            <Row className="mb-3">
                <Col xs={6} md={3}>
                    <Form.Control
                        type="text"
                        placeholder="Buscar por nombre..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </Col>
                <Col xs={6} md={3}>
                    <Form.Select value={sortType} onChange={handleSortChange}>
                        <option value="none">Ordenar por...</option>
                        <option value="min-max">Stock Final: Mín → Máx</option>
                        <option value="max-min">Stock Final: Máx → Mín</option>
                        <option value="a-z">Nombre: A → Z</option>
                        <option value="z-a">Nombre: Z → A</option>
                    </Form.Select>
                </Col>
            </Row>

            {sortedLogs.length === 0 ? (
                <Alert variant="warning">No hay registros para la fecha seleccionada.</Alert>
            ) : (
                    <Table striped bordered hover className="mt-3">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Fecha</th>
                                <th>Producto</th>
                                <th>Stock Inicial</th>
                                <th>Entradas</th>
                                <th>Stock Final</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedLogs.map((log) => (
                                <tr key={log.id}>
                                    <td>{log.id}</td>
                                    <td>{log.fecha.split('T')[0]}</td>
                                    <td>{getProductName(log.producto_id)}</td>
                                    <td>{log.stock_inicial}</td>
                                    <td>{log.stock_recibido}</td>
                                    <td>{log.stock_final}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                )}
        </Container>
    );
}

export default RegistroDiarioPage;