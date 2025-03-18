import React, { useEffect, useState, useMemo } from 'react';
import { Container, Table, Alert, Button, Form, Row, Col } from 'react-bootstrap';
import api from '../api';

function NotificationsPage() {
    const [notifications, setNotifications] = useState([]);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOption, setSortOption] = useState('none');

    useEffect(() => {
        let isMounted = true;

        const loadNotifications = async () => {
            try {
                const res = await api.get('/notificaciones');
                if (isMounted) setNotifications(Array.isArray(res.data) ? res.data : []);
            } catch (err) {
                console.error('Error fetching notifications:', err);
                if (isMounted) setError('Error fetching notifications');
            }
        };

        loadNotifications();
        return () => { isMounted = false; };
    }, []);

    const markAsRead = async (id) => {
        try {
            await api.put(`/notificaciones/${id}/read`);
            setNotifications(prev => prev.map(n =>
                n.id === id ? { ...n, leida: true } : n
            ));
        } catch (err) {
            console.error('Error marking notification as read:', err);
            setError('Error marking notification as read');
        }
    };

    const filteredNotifications = useMemo(() => {
        let filtered = notifications.filter(n =>
            n.titulo.toLowerCase().includes(searchTerm.toLowerCase())
        );

        if (sortOption === 'date') {
            return filtered.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
        }
        if (sortOption === 'title') {
            return filtered.sort((a, b) => a.titulo.localeCompare(b.titulo));
        }
        return filtered;
    }, [notifications, searchTerm, sortOption]);

    return (
        <Container className="mt-4">
            <h2>Notificaciones</h2>
            {error && <Alert variant="danger">{error}</Alert>}

            <Row className="mb-3">
                <Col md={6}>
                    <Form.Control
                        type="text"
                        placeholder="Buscar por título..."
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
                        <option value="date">Por Fecha</option>
                        <option value="title">Por Título</option>
                    </Form.Select>
                </Col>
            </Row>

            <Table striped bordered hover className="mt-3">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Título</th>
                        <th>Mensaje</th>
                        <th>Leída</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredNotifications.map((n) => (
                        <tr key={n.id}>
                            <td>{n.id}</td>
                            <td>{n.titulo}</td>
                            <td>{n.mensaje}</td>
                            <td>{n.leida ? 'Sí' : 'No'}</td>
                            <td>
                                {!n.leida && (
                                    <Button variant="success" size="sm" onClick={() => markAsRead(n.id)}>
                                        Marcar como Leída
                                    </Button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </Container>
    );
}

export default NotificationsPage;