import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Container, Table, Button, Form, Alert, Row, Col, Modal, Badge } from 'react-bootstrap';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { debounce } from 'lodash'; 
import api from '../api';
import { useAuth } from '../context/AuthContext';

function WarehousePage() {
    const [products, setProducts] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [editMode, setEditMode] = useState(false);
    const [productForm, setProductForm] = useState({
        id: null,
        nombre: '',
        cantidad: 0,
        umbral: 0,
        proveedor: '',
        cost: 0,
        packs: 0,
        units_per_pack: 0
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOption, setSortOption] = useState('none');
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [showStockHistoryModal, setShowStockHistoryModal] = useState(false);
    const [stockHistory, setStockHistory] = useState([]);
    const { auth } = useAuth();

    useEffect(() => {
        loadProducts();
    }, []);

    const debouncedSetSearchTerm = useCallback(
        debounce((value) => setSearchTerm(value), 300), []
    );

    // Memoized filtered and sorted products
    const filteredProducts = useMemo(() => {
        let filtered = products.filter(product =>
            product.nombre.toLowerCase().includes(searchTerm.toLowerCase())
        );

        if (sortOption === 'nombre') {
            filtered.sort((a, b) => a.nombre.localeCompare(b.nombre));
        } else if (sortOption === 'cantidad') {
            filtered.sort((a, b) => a.cantidad - b.cantidad);
        } else if (sortOption === 'cost') {
            filtered.sort((a, b) => a.cost - b.cost);
        }

        return filtered;
    }, [products, searchTerm, sortOption]);

    // Fetch products from the API
    const loadProducts = async () => {
        setError('');
        setSuccess('');
        try {
            const res = await api.get('/productos');
            setProducts(res.data);
        } catch (err) {
            console.error('Error fetching products:', err);
            setError('Error al obtener productos');
        }
    };

    const handleEditClick = (prod) => {
        setError('');
        setSuccess('');
        setEditMode(true);
        setProductForm({
            id: prod.id,
            nombre: prod.nombre,
            cantidad: prod.cantidad,
            umbral: prod.umbral,
            proveedor: prod.proveedor,
            cost: prod.cost,
            packs: 0,
            units_per_pack: 0
        });
    };

    const handleDeleteClick = async (id) => {
        if (!window.confirm('¿Estás seguro de que quieres eliminar este producto?')) return;
        try {
            await api.delete(`/almacen/products/${id}`);
            setSuccess('Producto eliminado exitosamente');
            loadProducts();
        } catch (err) {
            console.error('Error eliminando producto:', err);
            setError('Error al eliminar producto');
        }
    };

    const handleBulkDelete = async () => {
        if (!window.confirm('¿Estás seguro de que quieres eliminar los productos seleccionados?')) return;
        try {
            await api.post('/almacen/products/bulk-delete', { ids: selectedProducts });
            setSuccess('Productos eliminados exitosamente');
            setSelectedProducts([]);
            loadProducts();
        } catch (err) {
            console.error('Error eliminando productos:', err);
            setError('Error al eliminar productos');
        }
    };

    const handleStockHistoryClick = async (id) => {
        try {
            const res = await api.get(`/almacen/products/${id}/stock-history`);
            setStockHistory(res.data);
            setShowStockHistoryModal(true);
        } catch (err) {
            console.error('Error fetching stock history:', err);
            setError('Error al obtener el historial de stock');
        }
    };

    const handleDragEnd = (result) => {
        if (!result.destination) return;
        const items = Array.from(products);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);
        setProducts(items);
    };

    const getStockBadge = (cantidad, umbral) => {
        if (cantidad <= umbral * 0.2) return <Badge bg="danger">Crítico</Badge>;
        if (cantidad <= umbral * 0.5) return <Badge bg="warning">Bajo</Badge>;
        return <Badge bg="success">Saludable</Badge>;
    };

    const handleProductChange = (e) => {
        setProductForm({ ...productForm, [e.target.name]: e.target.value });
    };

    const handleProductSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        const c = parseInt(productForm.cantidad, 10) || 0;
        const costVal = parseFloat(productForm.cost) || 0;
        if (c < 0 || c > 9999) {
            return setError('Cantidad debe estar entre 0 y 9999');
        }
        if (costVal < 0 || costVal > 999999.99) {
            return setError('Costo inválido');
        }

        try {
            if (editMode) {
                await api.put(`/almacen/products/${productForm.id}`, {
                    ...productForm,
                    cantidad: c,
                    cost: costVal
                });
                setSuccess('Producto editado exitosamente');
            } else {
                await api.post('/almacen/products', {
                    ...productForm,
                    cantidad: c,
                    cost: costVal
                });
                setSuccess('Producto agregado exitosamente');
            }
            handleCancelProductEdit();
            loadProducts();
        } catch (err) {
            console.error('Error al procesar el producto:', err);
            setError('Error al guardar el producto');
        }
    };

    const handleCancelProductEdit = () => {
        setEditMode(false);
        setProductForm({
            id: null,
            nombre: '',
            cantidad: 0,
            umbral: 0,
            proveedor: '',
            cost: 0,
            packs: 0,
            units_per_pack: 0
        });
    };

    return (
        <Container className="mt-4">
            <h2>Almacén (Administración de Productos)</h2>
            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}

            <Row className="mb-3">
                <Col xs={12} sm={6}>
                    <Form.Label>Buscar Producto</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Buscar por nombre..."
                        onChange={(e) => debouncedSetSearchTerm(e.target.value)}
                    />
                </Col>
                <Col xs={12} sm={6}>
                    <Form.Label>Ordenar Productos</Form.Label>
                    <Form.Select
                        value={sortOption}
                        onChange={(e) => setSortOption(e.target.value)}
                    >
                        <option value="none">Sin Orden</option>
                        <option value="nombre">Alfabético (Nombre)</option>
                        <option value="cantidad">Por Cantidad</option>
                        <option value="cost">Por Precio</option>
                    </Form.Select>
                </Col>
            </Row>

            {selectedProducts.length > 0 && (
                <Button variant="danger" className="mb-3" onClick={handleBulkDelete}>
                    Eliminar Seleccionados ({selectedProducts.length})
                </Button>
            )}

            <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="products">
                    {(provided) => (
                        <Table striped bordered hover {...provided.droppableProps} ref={provided.innerRef}>
                            <thead>
                                <tr>
                                    <th>Seleccionar</th>
                                    <th>ID</th>
                                    <th>Nombre</th>
                                    <th>Cantidad</th>
                                    <th>Umbral</th>
                                    <th>Proveedor</th>
                                    <th>Cost</th>
                                    <th>Estado</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProducts.map((p, index) => (
                                    <Draggable key={p.id} draggableId={p.id.toString()} index={index}>
                                        {(provided) => (
                                            <tr ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                                                <td>
                                                    <Form.Check
                                                        type="checkbox"
                                                        checked={selectedProducts.includes(p.id)}
                                                        onChange={(e) => {
                                                            if (e.target.checked) {
                                                                setSelectedProducts([...selectedProducts, p.id]);
                                                            } else {
                                                                setSelectedProducts(selectedProducts.filter(id => id !== p.id));
                                                            }
                                                        }}
                                                    />
                                                </td>
                                                <td>{p.id}</td>
                                                <td>{p.nombre}</td>
                                                <td>{p.cantidad}</td>
                                                <td>{p.umbral}</td>
                                                <td>{p.proveedor}</td>
                                                <td>{p.cost}</td>
                                                <td>{getStockBadge(p.cantidad, p.umbral)}</td>
                                                <td>
                                                    {(auth.user?.rol === 'admin' || auth.user?.rol === 'gerente') ? (
                                                        <>
                                                            <Button variant="warning" size="sm" onClick={() => handleEditClick(p)}>
                                                                Editar
                                                            </Button>
                                                            <Button variant="danger" size="sm" className="ms-2" onClick={() => handleDeleteClick(p.id)}>
                                                                Eliminar
                                                            </Button>
                                                            <Button variant="info" size="sm" className="ms-2" onClick={() => handleStockHistoryClick(p.id)}>
                                                                Historial
                                                            </Button>
                                                        </>
                                                    ) : (
                                                            <span>No permitido</span>
                                                        )}
                                                </td>
                                            </tr>
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}
                            </tbody>
                        </Table>
                    )}
                </Droppable>
            </DragDropContext>

            <Modal show={showStockHistoryModal} onHide={() => setShowStockHistoryModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Historial de Stock</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>Fecha</th>
                                <th>Cantidad</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stockHistory.map((entry, index) => (
                                <tr key={index}>
                                    <td>{new Date(entry.date).toLocaleString()}</td>
                                    <td>{entry.quantity}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Modal.Body>
            </Modal>

            <hr />
            <h4>{editMode ? 'Editar Producto' : 'Agregar Nuevo Producto'}</h4>
            {(auth.user?.rol === 'admin' || auth.user?.rol === 'gerente') ? (
                <Form onSubmit={handleProductSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label>Nombre</Form.Label>
                        <Form.Control
                            name="nombre"
                            value={productForm.nombre}
                            onChange={handleProductChange}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Cantidad</Form.Label>
                        <Form.Control
                            type="number"
                            name="cantidad"
                            value={productForm.cantidad}
                            onChange={handleProductChange}
                        />
                    </Form.Group>

                    <Row>
                        <Col>
                            <Form.Group className="mb-3">
                                <Form.Label>Paquetes</Form.Label>
                                <Form.Control
                                    type="number"
                                    name="packs"
                                    value={productForm.packs}
                                    onChange={handleProductChange}
                                />
                            </Form.Group>
                        </Col>
                        <Col>
                            <Form.Group className="mb-3">
                                <Form.Label>Unidades/Paquete</Form.Label>
                                <Form.Control
                                    type="number"
                                    name="units_per_pack"
                                    value={productForm.units_per_pack}
                                    onChange={handleProductChange}
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Form.Group className="mb-3">
                        <Form.Label>Umbral</Form.Label>
                        <Form.Control
                            type="number"
                            name="umbral"
                            value={productForm.umbral}
                            onChange={handleProductChange}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Proveedor</Form.Label>
                        <Form.Control
                            name="proveedor"
                            value={productForm.proveedor}
                            onChange={handleProductChange}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Cost</Form.Label>
                        <Form.Control
                            type="number"
                            step="0.01"
                            name="cost"
                            value={productForm.cost}
                            onChange={handleProductChange}
                        />
                    </Form.Group>

                    <Button variant={editMode ? 'warning' : 'primary'} type="submit">
                        {editMode ? 'Guardar Cambios' : 'Agregar Producto'}
                    </Button>
                    {editMode && (
                        <Button variant="secondary" className="ms-2" onClick={handleCancelProductEdit}>
                            Cancelar
                        </Button>
                    )}
                </Form>
            ) : (
                    <Alert variant="info">
                        Solo usuarios con rol <strong>admin</strong> o <strong>gerente</strong> pueden agregar/editar productos.
                    </Alert>
                )}
        </Container>
    );
}

export default WarehousePage;