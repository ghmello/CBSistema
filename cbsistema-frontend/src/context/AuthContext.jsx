import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [auth, setAuth] = useState(() => {
        const storedUser = localStorage.getItem("user");
        return storedUser ? { checked: true, user: JSON.parse(storedUser) } : { checked: false, user: null };
    });

    useEffect(() => {
        let isMounted = true;

        async function checkSession() {
            try {
                const res = await api.get('/users/me', { withCredentials: true });
                if (isMounted) {
                    setAuth({ checked: true, user: res.data });
                    localStorage.setItem("user", JSON.stringify(res.data));
                }
            } catch (err) {
                if (isMounted) {
                    setAuth({ checked: true, user: null });
                    localStorage.removeItem("user");
                }
            }
        }

        if (!auth.checked) {
            checkSession();
        }

        return () => { isMounted = false; };
    }, [auth.checked]);

    const logout = async () => {
        try {
            await api.get('/users/logout');
            setAuth({ checked: true, user: null });
            localStorage.removeItem("user");
            window.location.href = "/";
        } catch (err) {
            console.error("Error logging out:", err);
        }
    };

    return (
        <AuthContext.Provider value={{ auth, setAuth, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}