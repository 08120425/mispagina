const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// Middleware para verificar token
const verifyToken = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ message: 'No hay token, acceso denegado' });
        }

        const decoded = jwt.verify(token, 'spa-jwt-secret');
        req.user = decoded.userId;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Token no válido' });
    }
};

// Registrar usuario
router.post('/register', async (req, res) => {
    try {
        const { nombre, email, telefono, password } = req.body;

        // Verificar si el usuario ya existe
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'El usuario ya existe' });
        }

        // Crear nuevo usuario
        const user = new User({
            nombre,
            email,
            telefono,
            password
        });

        await user.save();

        // Crear token JWT
        const token = jwt.sign(
            { userId: user._id }, 
            'spa-jwt-secret', 
            { expiresIn: '24h' }
        );

        res.status(201).json({
            message: 'Usuario creado exitosamente',
            token,
            user: {
                id: user._id,
                nombre: user.nombre,
                email: user.email,
                telefono: user.telefono
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error del servidor' });
    }
});

// Iniciar sesión
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Buscar usuario
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Credenciales inválidas' });
        }

        // Verificar contraseña
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Credenciales inválidas' });
        }

        // Crear token JWT
        const token = jwt.sign(
            { userId: user._id }, 
            'spa-jwt-secret', 
            { expiresIn: '24h' }
        );

        // Guardar en sesión
        req.session.userId = user._id;
        req.session.user = {
            id: user._id,
            nombre: user.nombre,
            email: user.email
        };

        res.json({
            message: 'Inicio de sesión exitoso',
            token,
            user: {
                id: user._id,
                nombre: user.nombre,
                email: user.email,
                telefono: user.telefono
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error del servidor' });
    }
});

// Obtener perfil del usuario
router.get('/profile', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user).select('-password');
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error del servidor' });
    }
});

// Cerrar sesión
router.post('/logout', (req, res) => {
    req.session.destroy();
    res.json({ message: 'Sesión cerrada' });
});

module.exports = router;