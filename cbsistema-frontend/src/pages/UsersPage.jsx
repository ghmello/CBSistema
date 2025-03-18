import React, { useEffect, useState } from 'react';
import { Container, Table, Button, Form, Alert, Row, Col, Badge } from 'react-bootstrap';
import api from '../api';
import { useAuth } from '../context/AuthContext';

function UsersPage() {
    const [users, setUsers] = useState([]);
    const [form, setForm] = useState({
        nombre: '',
        rol: 'caja',
        contrasena: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOption, setSortOption] = useState('none');
    const { auth } = useAuth();

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            const res = await api.get('/users');
            setUsers(res.data);
        } catch (err) {
            console.error('Error fetching users:', err);
            setError('Error al obtener usuarios');
        }
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleAddUser = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        try {
            await api.post('/users', form);
            setForm({ nombre: '', rol: 'caja', contrasena: '' });
            setSuccess('Usuario creado exitosamente');
            loadUsers();
        } catch (err) {
            console.error('Error creating user:', err);
            setError(err.response?.data?.message || 'Error al crear usuario');
        }
    };

    const filteredUsers = users
        .filter(u => u.nombre.toLowerCase().includes(searchTerm.toLowerCase()))
        .sort((a, b) => {
            if (sortOption === 'nombre') return a.nombre.localeCompare(b.nombre);
            if (sortOption === 'rol') return a.rol.localeCompare(b.rol);
            return 0;
        });

    return (
        <Container className="mt-4">
            <h2>Usuarios</h2>
            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}

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
                        <option value="rol">Por Rol</option>
                    </Form.Select>
                </Col>
            </Row>

            <Table striped bordered hover className="mt-3">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Rol</th>
                        <th>Creado</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredUsers.map(u => (
                        <tr key={u.id}>
                            <td>{u.id}</td>
                            <td>{u.nombre}</td>
                            <td><Badge bg="info">{u.rol}</Badge></td>
                            <td>{u.creado_el}</td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            <hr />
            <h4>Crear Usuario Nuevo</h4>
            {auth.user?.rol === 'admin' ? (
                <Form onSubmit={handleAddUser}>
                    <Form.Group className="mb-3">
                        <Form.Label>Nombre</Form.Label>
                        <Form.Control
                            name="nombre"
                            value={form.nombre}
                            onChange={handleChange}
                            placeholder="Nombre de usuario"
                            required
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Rol</Form.Label>
                        <Form.Select
                            name="rol"
                            value={form.rol}
                            onChange={handleChange}
                        >
                            <option value="admin">Admin</option>
                            <option value="gerente">Gerente</option>
                            <option value="almacen">Almacén</option>
                            <option value="caja">Caja</option>
                        </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Contraseña</Form.Label>
                        <Form.Control
                            type="password"
                            name="contrasena"
                            value={form.contrasena}
                            onChange={handleChange}
                            placeholder="Contraseña"
                            required
                        />
                    </Form.Group>

                    <Button variant="primary" type="submit">Crear Usuario</Button>
                </Form>
            ) : (
                    <Alert variant="warning">Solo <strong>admin</strong> puede crear usuarios.</Alert>
                )}
        </Container>
    );
}

export default UsersPage;