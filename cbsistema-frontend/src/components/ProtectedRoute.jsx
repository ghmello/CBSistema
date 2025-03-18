import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';

function ProtectedRoute({ children, adminOnly = false }) {
    const { auth } = useAuth();

    if (!auth.checked) {
        return <div style={{ padding: '2rem', textAlign: 'center' }}>Cargando sesión...</div>;
    }

    if (!auth.user) {
        return <Navigate to="/" />;
    }

    if (adminOnly && auth.user.rol !== 'admin') {
        return <div className="text-center mt-5"><h2>403 - Acceso Prohibido</h2></div>;
    }

    return children;
}

export default ProtectedRoute;