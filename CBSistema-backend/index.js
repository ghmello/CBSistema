require('dotenv').config(); 
const express = require('express');
const session = require('express-session');
const db = require('./config/db');
const morgan = require('morgan');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const userRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin');
const productosRoutes = require('./routes/productos');
const pedidosRoutes = require('./routes/pedidos');
const notificacionesRoutes = require('./routes/notificaciones');
const categoriasRoutes = require('./routes/categorias');
const almacenRoutes = require('./routes/almacen');
const lotesRoutes = require('./routes/lotes');
const movimientosRoutes = require('./routes/movimientos');
const reportesRoutes = require('./routes/reportes');
const logsRoutes = require('./routes/logs');
const registroDiarioRoutes = require('./routes/registro_diario');
const physicalCountsRoutes = require('./routes/physicalCounts'); 

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(morgan('dev'));
app.use(cors({
    origin: 'http://localhost:3001',
    credentials: true
}));

const limiter = rateLimit({
    windowMs: 20 * 60 * 1000,
    max: 100
});
app.use(limiter);

app.use(session({
    secret: 'secretkey',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,   
        secure: false,    
        sameSite: 'lax',  
        maxAge: 1000 * 60 * 60 * 4 
    }
}));

app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/pedidos', pedidosRoutes);
app.use('/api/notificaciones', notificacionesRoutes);
app.use('/api/categorias', categoriasRoutes);
app.use('/api/almacen', almacenRoutes);
app.use('/api/lotes', lotesRoutes);
app.use('/api/movimientos', movimientosRoutes);
app.use('/api/reportes', reportesRoutes);
app.use('/api/logs', logsRoutes);
app.use('/api/registro_diario', registroDiarioRoutes); 
app.use('/api/physicalCounts', physicalCountsRoutes); 

app.use((err, req, res, next) => {
    console.error(`Error: ${err.message}`);
    res.status(500).json({ message: 'Internal server error', error: err.message });
});

app.get('/', (req, res) => {
    res.send('API is running!');
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});