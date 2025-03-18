import React, { useEffect, useState } from 'react';
import { Container, Table, Button, Form, Alert, ListGroup, Row, Col } from 'react-bootstrap';
import api from '../api';
import { useAuth } from '../context/AuthContext';

function OrdersPage() {
    const [allOrders, setAllOrders] = useState([]); 
    const [orders, setOrders] = useState([]);       

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [editMode, setEditMode] = useState(false);

    const [form, setForm] = useState({
        id: null,
        nombre_producto: '',
        id_producto: null,
        id_usuario: '',            
        cantidad_solicitada: 1,
        estado: ''
    });

    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const [filterStatus, setFilterStatus] = useState('');
    const [filterProduct, setFilterProduct] = useState('');

    const { auth } = useAuth();

    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async () => {
        setError('');
        setSuccess('');
        try {
            const res = await api.get('/pedidos');
            setAllOrders(res.data);
            setOrders(res.data); 
        } catch (err) {
            console.error('Error fetching pedidos:', err);
            setError('Error al obtener pedidos');
        }
    };

    const applyFilters = () => {
        setError('');
        setSuccess('');

        let filtered = [...allOrders];

        if (filterStatus) {
            filtered = filtered.filter(order => order.estado === filterStatus);
        }
        if (filterProduct) {
            filtered = filtered.filter(order =>
                order.producto_nombre.toLowerCase().includes(filterProduct.toLowerCase())
            );
        }
        setOrders(filtered);
    };

    const handleProductNameChange = async (e) => {
        const { value } = e.target;
        setForm({ ...form, nombre_producto: value, id_producto: null });
        setError('');
        setSuccess('');

        if (!value.trim()) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        try {
            const res = await api.get(`/productos/buscar?nombre=${value}`);
            setSuggestions(res.data);
            setShowSuggestions(true);
        } catch (err) {
            console.error('Error searching products:', err);
            setSuggestions([]);
            setShowSuggestions(false);
        }
    };

    const handleSelectSuggestion = (prod) => {
        setForm({
            ...form,
            nombre_producto: prod.nombre,
            id_producto: prod.id
        });
        setSuggestions([]);
        setShowSuggestions(false);
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleEditClick = (pedido) => {
        setError('');
        setSuccess('');
        setEditMode(true);
        setForm({
            id: pedido.id,
            nombre_producto: pedido.producto_nombre,
            id_producto: pedido.id_producto,
            id_usuario: pedido.id_usuario ?? '',
            cantidad_solicitada: pedido.cantidad_solicitada,
            estado: pedido.estado
        });
    };

    const handleCancel = () => {
        setEditMode(false);
        setForm({
            id: null,
            nombre_producto: '',
            id_producto: null,
            id_usuario: '',
            cantidad_solicitada: 1,
            estado: ''
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!editMode) {
            if (!form.id_producto) {
                return setError('Selecciona un producto (auto-completado)');
            }
            if (!form.id_usuario) {
                return setError('ID de Usuario es obligatorio');
            }
            if (form.cantidad_solicitada < 1) {
                return setError('La cantidad_solicitada debe ser > 0');
            }
            try {
                await api.post('/pedidos', {
                    id_producto: form.id_producto,
                    id_usuario: form.id_usuario,
                    cantidad_solicitada: form.cantidad_solicitada
                });
                setSuccess('Pedido creado exitosamente');
                handleCancel();
                loadOrders();
            } catch (err) {
                console.error('Error creating pedido:', err);
                setError(err.response?.data?.message || 'Error al crear pedido');
            }
        }

        else {
            try {
                if (form.cantidad_solicitada < 1) {
                    return setError('La cantidad_solicitada debe ser > 0');
                }
                await api.put(`/pedidos/${form.id}`, {
                    estado: form.estado,
                    cantidad_solicitada: form.cantidad_solicitada
                });
                setSuccess('Pedido actualizado exitosamente');
                handleCancel();
                loadOrders();
            } catch (err) {
                console.error('Error updating pedido:', err);
                setError(err.response?.data?.message || 'Error al actualizar pedido');
            }
        }
    };

    const handleDeletePedido = async (id) => {
        setError('');
        setSuccess('');
        try {
            await api.delete(`/pedidos/${id}`);
            setSuccess('Pedido eliminado exitosamente');
            loadOrders();
        } catch (err) {
            console.error('Error deleting pedido:', err);
            setError(err.response?.data?.message || 'Error al eliminar pedido');
        }
    };

    const handleCheckPending = async () => {
        setError('');
        setSuccess('');
        try {
            const res = await api.post('/pedidos/pending-auto-trigger');
            setSuccess(res.data.message || 'Verificación de pedidos pendientes completa');
        } catch (err) {
            console.error('Error triggering pending pedidos:', err);
            setError('Error al verificar pedidos pendientes');
        }
    };

    return (
        <Container className="mt-4">
            <h2>Pedidos</h2>
            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}

            <Row className="mb-3">
                <Col xs={12} md={3}>
                    <Form.Select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="">-- Estado --</option>
                        <option value="pendiente">Pendiente</option>
                        <option value="aprobado">Aprobado</option>
                        <option value="rechazado">Rechazado</option>
                        <option value="en_transito">En Tránsito</option>
                        <option value="recibido">Recibido</option>
                    </Form.Select>
                </Col>
                <Col xs={12} md={3}>
                    <Form.Control
                        placeholder="Producto (ej: Pollo)"
                        value={filterProduct}
                        onChange={(e) => setFilterProduct(e.target.value)}
                    />
                </Col>
                <Col xs="auto">
                    <Button variant="secondary" onClick={applyFilters}>
                        Filtrar
          </Button>
                </Col>
            </Row>

            <Table striped bordered hover className="mt-3">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Producto</th>
                        <th>Cantidad</th>
                        <th>Estado</th>
                        <th>Fecha</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.map(o => (
                        <tr key={o.id}>
                            <td>{o.id}</td>
                            <td>{o.producto_nombre}</td>
                            <td>{o.cantidad_solicitada}</td>
                            <td>{o.estado}</td>
                            <td>{o.fecha_solicitud || '—'}</td>
                            <td>
                                {(auth.user?.rol === 'admin' || auth.user?.rol === 'gerente') ? (
                                    <>
                                        <Button
                                            variant="warning"
                                            size="sm"
                                            onClick={() => handleEditClick(o)}
                                        >
                                            Editar
                    </Button>
                                        <Button
                                            variant="danger"
                                            size="sm"
                                            className="ms-2"
                                            onClick={() => handleDeletePedido(o.id)}
                                        >
                                            Eliminar
                    </Button>
                                    </>
                                ) : (
                                        <span>No permitido</span>
                                    )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            <hr />
            <h4>{editMode ? 'Editar Pedido' : 'Crear Nuevo Pedido'}</h4>
            <Form onSubmit={handleSubmit}>
                {!editMode && (
                    <Form.Group className="mb-3">
                        <Form.Label>Buscar Producto (Nombre)</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Ej: 'Pollo', 'Wings'..."
                            name="nombre_producto"
                            value={form.nombre_producto}
                            onChange={handleProductNameChange}
                        />
                        {showSuggestions && suggestions.length > 0 && (
                            <ListGroup style={{ maxHeight: '150px', overflowY: 'auto' }}>
                                {suggestions.map(prod => (
                                    <ListGroup.Item
                                        key={prod.id}
                                        action
                                        onClick={() => handleSelectSuggestion(prod)}
                                    >
                                        {prod.nombre}
                                    </ListGroup.Item>
                                ))}
                            </ListGroup>
                        )}
                    </Form.Group>
                )}

                {!editMode && (
                    <Form.Group className="mb-3">
                        <Form.Label>ID Usuario</Form.Label>
                        <Form.Control
                            name="id_usuario"
                            placeholder="Ej: 1"
                            value={form.id_usuario}
                            onChange={handleChange}
                        />
                    </Form.Group>
                )}

                <Form.Group className="mb-3">
                    <Form.Label>Cantidad Solicitada</Form.Label>
                    <Form.Control
                        type="number"
                        name="cantidad_solicitada"
                        value={form.cantidad_solicitada}
                        onChange={handleChange}
                    />
                </Form.Group>

                {editMode && (
                    <Form.Group className="mb-3">
                        <Form.Label>Estado</Form.Label>
                        <Form.Select
                            name="estado"
                            value={form.estado}
                            onChange={handleChange}
                        >
                            <option value="pendiente">Pendiente</option>
                            <option value="aprobado">Aprobado</option>
                            <option value="rechazado">Rechazado</option>
                            <option value="en_transito">En Tránsito</option>
                            <option value="recibido">Recibido</option>
                        </Form.Select>
                    </Form.Group>
                )}

                <Button variant={editMode ? 'warning' : 'primary'} type="submit">
                    {editMode ? 'Guardar Cambios' : 'Crear Pedido'}
                </Button>
                {editMode && (
                    <Button variant="secondary" className="ms-2" onClick={handleCancel}>
                        Cancelar
                    </Button>
                )}
            </Form>

            <hr />
            <Button variant="info" className="mt-2" onClick={handleCheckPending}>
                Verificar Pedidos Pendientes (+24h)
      </Button>
        </Container>
    );
}

export default OrdersPage;