import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

import { useAuth } from './context/AuthContext';
import AppNavbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Import pages
import LoginPage from './pages/LoginPage';
import RegistroDiarioPage from './pages/RegistroDiarioPage';
import DashboardPage from './pages/DashboardPage';
import ProductsPage from './pages/ProductsPage';
import OrdersPage from './pages/OrdersPage';
import WarehousePage from './pages/WarehousePage';
import BatchesPage from './pages/BatchesPage';
import StockMovementsPage from './pages/StockMovementsPage';
import NotificationsPage from './pages/NotificationsPage';
import AdminReportsPage from './pages/AdminReportsPage';
import UsersPage from './pages/UsersPage';

function AppContent() {
    const location = useLocation();
    const { auth } = useAuth();

    const hideNavbar = location.pathname === '/';

    // If session check is not finished, show loading screen
    if (!auth.checked) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
                <h4>Cargando sesión...</h4>
            </div>
        );
    }

    return (
        <>
            {!hideNavbar && <AppNavbar />}

            <Routes>
                <Route path="/" element={<LoginPage />} />

                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <DashboardPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/products"
                    element={
                        <ProtectedRoute>
                            <ProductsPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/orders"
                    element={
                        <ProtectedRoute>
                            <OrdersPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/warehouse"
                    element={
                        <ProtectedRoute>
                            <WarehousePage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/registro_diario"
                    element={
                        <ProtectedRoute>
                            <RegistroDiarioPage />
                        </ProtectedRoute>
                    }
                />
                {/*<Route
                    path="/notifications"
                    element={
                        <ProtectedRoute>
                            <NotificationsPage />
                        </ProtectedRoute>
                    }
                />*/}

                {/* Admin-Only Routes */}
                {/*<Route
                    path="/batches"
                    element={
                        <ProtectedRoute adminOnly>
                            <BatchesPage />
                        </ProtectedRoute>
                    }
                />*/}
                <Route
                    path="/admin/reports"
                    element={
                        <ProtectedRoute adminOnly>
                            <AdminReportsPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/users"
                    element={
                        <ProtectedRoute adminOnly>
                            <UsersPage />
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </>
    );
}

function App() {
    return (
        <Router>
            <AppContent />
        </Router>
    );
}

export default App;