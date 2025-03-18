import { useEffect, useState } from 'react';
import { Container, Row, Col, Alert, Card, Table, Form } from 'react-bootstrap';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line
} from 'recharts';
import api from '../api';

function AdminReportsPage() {
    const [inventoryValue, setInventoryValue] = useState(0);
    const [nearExpiry, setNearExpiry] = useState([]);
    const [movements, setMovements] = useState([]);

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const [reportType, setReportType] = useState('daily');
    const [summary, setSummary] = useState({
        total: 0,
        entrada: 0,
        salida: 0,
        devolucion: 0,
        dano: 0
    });

    useEffect(() => {
        const loadInventoryAndExpiry = async () => {
            try {
                setError('');
                setLoading(true);

                const [invRes, expiryRes] = await Promise.all([
                    api.get('/reportes/inventario'),
                    api.get('/reportes/caducidad-proxima'),
                ]);

                setInventoryValue(invRes.data?.total_inventario || 0);
                setNearExpiry(Array.isArray(expiryRes.data) ? expiryRes.data : []);
            } catch (err) {
                console.error('Error fetching inventory or near-expiry:', err);
                setError('Error al cargar el inventario o la caducidad próxima');
            } finally {
                setLoading(false);
            }
        };

        loadInventoryAndExpiry();
    }, []);

    useEffect(() => {
        const loadMovements = async () => {
            setError('');
            setLoading(true);

            try {
                const movementsRes = await api.get(`/reportes/movimientos?type=${reportType}`);
                const movementsData = Array.isArray(movementsRes.data) ? movementsRes.data : [];
                setMovements(movementsData);

                const summaryData = movementsData.reduce((acc, item) => {
                    acc.total += item.cantidad;
                    acc[item.tipo] = (acc[item.tipo] || 0) + item.cantidad;
                    return acc;
                }, { total: 0, entrada: 0, salida: 0, devolucion: 0, dano: 0 });

                setSummary(summaryData);
            } catch (err) {
                console.error('Error fetching movements:', err);
                setError('Error al cargar los movimientos');
            } finally {
                setLoading(false);
            }
        };

        loadMovements();
    }, [reportType]);

    return (
        <Container className="mt-4">
            <h2>Reportes Administrativos</h2>

            {error && <Alert variant="danger">{error}</Alert>}
            {loading && <Alert variant="info">Cargando reportes...</Alert>}

            <Row className="mb-4">
                <Col md={6}>
                    <Card className="mb-3">
                        <Card.Body>
                            <Card.Title>Valor de Inventario</Card.Title>
                            <Card.Text className="display-6">
                                ${inventoryValue.toFixed(2)}
                            </Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <h4>Productos Próximos a Caducar (7 días)</h4>
            {nearExpiry.length === 0 ? (
                <Alert variant="warning">
                    No hay productos próximos a caducar o no hay datos en <em>Product_Batches</em>.
                </Alert>
            ) : (
                    <Table striped bordered hover className="mb-4">
                        <thead>
                            <tr>
                                <th>Producto</th>
                                <th>Fecha Caducidad</th>
                                <th>Cantidad</th>
                            </tr>
                        </thead>
                        <tbody>
                            {nearExpiry.map((item, index) => (
                                <tr key={index}>
                                    <td>{item.nombre}</td>
                                    <td>{new Date(item.fecha_caducidad).toLocaleDateString()}</td>
                                    <td>{item.cantidad}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                )}

            <h4>Movimientos de Stock</h4>
            <Row className="mb-3">
                <Col md={4}>
                    <Form.Select
                        value={reportType}
                        onChange={(e) => setReportType(e.target.value)}
                    >
                        <option value="daily">Diario</option>
                        <option value="weekly">Semanal</option>
                        <option value="monthly">Mensual</option>
                    </Form.Select>
                </Col>
            </Row>

            <Card className="mb-3">
                <Card.Body>
                    <Card.Title>Resumen de Movimientos</Card.Title>
                    <p><strong>Total Movimientos:</strong> {summary.total}</p>
                    <p><strong>Entradas:</strong> {summary.entrada}</p>
                    <p><strong>Salidas:</strong> {summary.salida}</p>
                    <p><strong>Devoluciones:</strong> {summary.devolucion}</p>
                    <p><strong>Daños:</strong> {summary.dano}</p>
                </Card.Body>
            </Card>

            {/* Bar Chart for Movement Summary */}
            <h4>Gráfico de Resumen de Movimientos</h4>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={[
                    { tipo: 'Entradas', cantidad: summary.entrada },
                    { tipo: 'Salidas', cantidad: summary.salida },
                    { tipo: 'Devoluciones', cantidad: summary.devolucion },
                    { tipo: 'Daños', cantidad: summary.dano }
                ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="tipo" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="cantidad" fill="#8884d8" />
                </BarChart>
            </ResponsiveContainer>

            {/* Line Chart for Movements Over Time */}
            <h4>Tendencia de Movimientos</h4>
            <ResponsiveContainer width="100%" height={300}>
                <LineChart
                    data={movements.map(m => ({
                        fecha: new Date(m.fecha_movimiento).toLocaleDateString(),
                        cantidad: m.cantidad
                    }))}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="fecha" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="cantidad" stroke="#82ca9d" />
                </LineChart>
            </ResponsiveContainer>

            {movements.length === 0 ? (
                <Alert variant="warning">
                    No hay movimientos en este periodo.
                </Alert>
            ) : (
                    <Table striped bordered hover className="mb-4">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Producto</th>
                                <th>Tipo</th>
                                <th>Cantidad</th>
                                <th>Motivo</th>
                                <th>Usuario</th>
                                <th>Fecha Movimiento</th>
                            </tr>
                        </thead>
                        <tbody>
                            {movements.map(m => (
                                <tr key={m.id}>
                                    <td>{m.id}</td>
                                    <td>{m.producto}</td>
                                    <td>{m.tipo}</td>
                                    <td>{m.cantidad}</td>
                                    <td>{m.motivo || '—'}</td>
                                    <td>{m.usuario}</td>
                                    <td>{new Date(m.fecha_movimiento).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                )}
        </Container>
    );
}

export default AdminReportsPage;