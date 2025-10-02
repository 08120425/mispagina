const express = require('express');
const session = require('express-session');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/database');

// Importar rutas
const authRoutes = require('./routes/auth');
const serviceRoutes = require('./routes/services');
const reservationRoutes = require('./routes/reservations');

const app = express();

// Conectar a la base de datos
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Configurar sesiones
app.use(session({
    secret: 'spa-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { 
        secure: false, // cambiar a true en producción con HTTPS
        maxAge: 1000 * 60 * 60 * 24 // 24 horas
    }
}));

// Rutas API
app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/reservations', reservationRoutes);

// Servir archivos HTML
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

app.get('/services', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'services.html'));
});

app.get('/reservations', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'reservations.html'));
});

app.get('/profile', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'profile.html'));
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en puerto ${PORT}`);
    console.log(`Visita http://localhost:${PORT}`);
});