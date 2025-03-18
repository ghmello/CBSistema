import React, { useEffect, useState, useCallback } from 'react';
import { Navbar as BsNavbar, Nav, Container, Badge, Button } from 'react-bootstrap';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';

function AppNavbar() {
    // const [unreadCount, setUnreadCount] = useState(0);
    const location = useLocation();
    const navigate = useNavigate();
    const { auth, setAuth } = useAuth();

    /*
    const fetchUnreadCount = useCallback(async () => {
        if (auth.user?.rol !== 'admin') return;

        try {
            const res = await api.get('/notificaciones/unread-count');
            setUnreadCount(res.data.count);
        } catch (err) {
            console.error('Error fetching unread count:', err);
        }
    }, [auth.user]);

    useEffect(() => {
        let intervalId;

        if (auth.user?.rol === 'admin') {
            fetchUnreadCount();
            intervalId = setInterval(fetchUnreadCount, 600000);
        }

        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, [auth.user, fetchUnreadCount]);
    */

    const handleLogout = async () => {
        try {
            await api.get('/users/logout');
            setAuth({ checked: true, user: null });
            navigate('/');
        } catch (err) {
            console.error('Logout failed:', err);
        }
    };

    const isActive = (path) => location.pathname.startsWith(path);

    return (
        <BsNavbar bg="white" expand="lg" className="shadow-sm">
            <Container>
                <BsNavbar.Brand as={Link} to="/dashboard" className="d-flex align-items-center fw-bold">
                    <img src="https://placehold.co/40x40" alt="Logo" className="me-2" />
                    <span>Mi Restaurante</span>
                </BsNavbar.Brand>

                <BsNavbar.Toggle aria-controls="main-navbar" />
                <BsNavbar.Collapse id="main-navbar">
                    <Nav className="ms-auto">
                        <Nav.Link as={Link} to="/dashboard" active={isActive('/dashboard')}>
                            Dashboard
                        </Nav.Link>
                        <Nav.Link as={Link} to="/warehouse" active={isActive('/warehouse')}>
                            Almacén
                        </Nav.Link>
                        <Nav.Link as={Link} to="/orders" active={isActive('/orders')}>
                            Pedidos
                        </Nav.Link>
                        <Nav.Link as={Link} to="/registro_diario" active={isActive('/registro_diario')}>
                            Registro Diario
                        </Nav.Link>

                        {/* Notifications hidden until debugged */}
                        {/* {auth.user?.rol === 'admin' && (
                            <Nav.Link as={Link} to="/notifications" active={isActive('/notifications')}>
                                Notificaciones
                                {unreadCount > 0 && <Badge bg="danger" className="ms-1">{unreadCount}</Badge>}
                            </Nav.Link>
                        )} */}

                        {(auth.user?.rol === 'admin' || auth.user?.rol === 'gerente') && (
                            <Nav.Link as={Link} to="/admin/reports" active={isActive('/admin/reports')}>
                                Reportes
                            </Nav.Link>
                        )}

                        {auth.user?.rol === 'admin' && (
                            <Nav.Link as={Link} to="/users" active={isActive('/users')}>
                                Usuarios
                            </Nav.Link>
                        )}

                        {auth.user && (
                            <Button variant="danger" className="ms-3" onClick={handleLogout}>
                                Cerrar Sesión
                            </Button>
                        )}
                    </Nav>
                </BsNavbar.Collapse>
            </Container>
        </BsNavbar>
    );
}

export default AppNavbar;