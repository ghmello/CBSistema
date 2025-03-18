import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Table, Alert, Form } from 'react-bootstrap';
import api from '../api';

function DashboardPage() {
    const [pedidosPendientes, setPedidosPendientes] = useState(0);
    const [productosBajoInventario, setProductosBajoInventario] = useState(0);
    const [products, setProducts] = useState([]);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOption, setSortOption] = useState('none');

    useEffect(() => {
        fetchDashboardData();
        loadProducts();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const pedidosRes = await api.get('/pedidos?estado=pendiente');
            setPedidosPendientes(pedidosRes.data?.length || 0);

            const lowStockRes = await api.get('/productos?filter=low-stock');
            setProductosBajoInventario(lowStockRes.data?.length || 0);
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
            setError('Error al cargar datos del dashboard');
        }
    };

    const loadProducts = async () => {
        try {
            setError('');
            const res = await api.get('/productos');
            setProducts(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error('Error fetching products:', err);
            setError('Error al obtener productos');
        }
    };

    const filteredProducts = products
        .filter(p => p.nombre.toLowerCase().includes(searchTerm.toLowerCase()))
        .sort((a, b) => {
            if (sortOption === 'nombre') return a.nombre.localeCompare(b.nombre);
            if (sortOption === 'cantidad') return a.cantidad - b.cantidad;
            return 0; 
        });

    return (
        <Container className="mt-4">
            <h1 className="mb-4">Dashboard</h1>
            {error && <Alert variant="danger">{error}</Alert>}

            <Row>
                <Col md={6} className="mb-3">
                    <Card className="shadow-sm">
                        <Card.Body>
                            <Card.Title>Pedidos Pendientes</Card.Title>
                            <Card.Text className="display-6">{pedidosPendientes}</Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={6} className="mb-3">
                    <Card className="shadow-sm">
                        <Card.Body>
                            <Card.Title>Productos Bajo Inventario</Card.Title>
                            <Card.Text className="display-6">{productosBajoInventario}</Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row className="mt-4">
                <Col md={4}>
                    <Card className="mb-3">
                        <Card.Body>
                            <Card.Title>Ir a Productos</Card.Title>
                            <Card.Text>Administra el catálogo de productos.</Card.Text>
                            <Button variant="primary" href="/products">Ver Productos</Button>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card className="mb-3">
                        <Card.Body>
                            <Card.Title>Ir a Pedidos</Card.Title>
                            <Card.Text>Gestiona pedidos.</Card.Text>
                            <Button variant="primary" href="/orders">Ver Pedidos</Button>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card className="mb-3">
                        <Card.Body>
                            <Card.Title>Ir a Movimientos</Card.Title>
                            <Card.Text>Registra entradas y salidas de stock.</Card.Text>
                            <Button variant="primary" href="/stock-movements">Ver Movimientos</Button>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <hr />
            <h3 className="mb-3">Productos</h3>
            <Row className="mb-3">
                <Col md={6}>
                    <Form.Control
                        type="text"
                        placeholder="Buscar por nombre..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </Col>
                <Col md={6}>
                    <Form.Select
                        value={sortOption}
                        onChange={(e) => setSortOption(e.target.value)}
                    >
                        <option value="none">Sin Orden</option>
                        <option value="nombre">Alfabético (Nombre)</option>
                        <option value="cantidad">Por Cantidad</option>
                    </Form.Select>
                </Col>
            </Row>
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Cantidad</th>
                        <th>Umbral</th>
                        <th>Proveedor</th>
                        <th>Cost</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredProducts.map((p) => (
                        <tr key={p.id}>
                            <td>{p.id}</td>
                            <td>{p.nombre}</td>
                            <td>{p.cantidad}</td>
                            <td>{p.umbral}</td>
                            <td>{p.proveedor || 'N/A'}</td>
                            <td>{p.cost}</td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </Container>
    );
}

export default DashboardPage;