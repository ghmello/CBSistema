import React, { useState } from 'react';
import { Form, Button, Container, Row, Col, Alert, Card, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from '../api';

function LoginPage() {
    const [nombre, setNombre] = useState('');
    const [contrasena, setContrasena] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await api.post('/users/login', { nombre, contrasena });
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Error al iniciar sesión');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page d-flex justify-content-center align-items-center" style={{ minHeight: '100vh', backgroundColor: '#f8f8f8' }}>
            <Container>
                <Row className="justify-content-center">
                    <Col xs={12} md={6} lg={4}>
                        <Card className="p-4 shadow-sm">
                            <Card.Body>
                                <h2 className="text-center mb-4">Iniciar Sesión</h2>
                                {error && <Alert variant="danger">{error}</Alert>}
                                <Form onSubmit={handleLogin}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Nombre de Usuario</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={nombre}
                                            onChange={(e) => setNombre(e.target.value)}
                                            placeholder="Ingresa tu nombre"
                                            required
                                        />
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Contraseña</Form.Label>
                                        <Form.Control
                                            type="password"
                                            value={contrasena}
                                            onChange={(e) => setContrasena(e.target.value)}
                                            placeholder="Ingresa tu contraseña"
                                            required
                                        />
                                    </Form.Group>
                                    <Button variant="primary" type="submit" className="w-100" disabled={loading}>
                                        {loading ? <Spinner animation="border" size="sm" /> : 'Acceder'}
                                    </Button>
                                </Form>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
}

export default LoginPage;