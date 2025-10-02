const express = require('express');
const jwt = require('jsonwebtoken');
const Reservation = require('../models/Reservation');
const Service = require('../models/Service');
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

// Crear una nueva reserva
router.post('/', verifyToken, async (req, res) => {
    try {
        const { servicioId, fecha, hora, notas } = req.body;

        // Verificar que el servicio existe
        const service = await Service.findById(servicioId);
        if (!service) {
            return res.status(404).json({ message: 'Servicio no encontrado' });
        }

        // Verificar disponibilidad de fecha y hora
        const existingReservation = await Reservation.findOne({
            fecha: new Date(fecha),
            hora: hora,
            estado: { $ne: 'cancelada' }
        });

        if (existingReservation) {
            return res.status(400).json({ message: 'Horario no disponible' });
        }

        // Crear la reserva
        const reservation = new Reservation({
            usuario: req.user,
            servicio: servicioId,
            fecha: new Date(fecha),
            hora,
            notas: notas || ''
        });

        await reservation.save();

        // Poblar los datos para la respuesta
        await reservation.populate('servicio', 'nombre precio duracion');
        await reservation.populate('usuario', 'nombre email telefono');

        res.status(201).json({
            message: 'Reserva creada exitosamente',
            reservation
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error del servidor' });
    }
});

// Obtener reservas del usuario autenticado
router.get('/mis-reservas', verifyToken, async (req, res) => {
    try {
        const reservations = await Reservation.find({ usuario: req.user })
            .populate('servicio', 'nombre precio duracion imagen')
            .sort({ fecha: 1, hora: 1 });

        res.json(reservations);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error del servidor' });
    }
});

// Actualizar una reserva
router.put('/:id', verifyToken, async (req, res) => {
    try {
        const { fecha, hora, notas } = req.body;
        
        const reservation = await Reservation.findOne({
            _id: req.params.id,
            usuario: req.user
        });

        if (!reservation) {
            return res.status(404).json({ message: 'Reserva no encontrada' });
        }

        // Verificar disponibilidad si se cambió fecha u hora
        if (fecha !== reservation.fecha.toISOString().split('T')[0] || hora !== reservation.hora) {
            const existingReservation = await Reservation.findOne({
                _id: { $ne: req.params.id },
                fecha: new Date(fecha),
                hora: hora,
                estado: { $ne: 'cancelada' }
            });

            if (existingReservation) {
                return res.status(400).json({ message: 'Horario no disponible' });
            }
        }

        reservation.fecha = new Date(fecha);
        reservation.hora = hora;
        reservation.notas = notas || '';

        await reservation.save();
        await reservation.populate('servicio', 'nombre precio duracion imagen');

        res.json({
            message: 'Reserva actualizada exitosamente',
            reservation
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error del servidor' });
    }
});

// Cancelar una reserva
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const reservation = await Reservation.findOne({
            _id: req.params.id,
            usuario: req.user
        });

        if (!reservation) {
            return res.status(404).json({ message: 'Reserva no encontrada' });
        }

        reservation.estado = 'cancelada';
        await reservation.save();

        res.json({ message: 'Reserva cancelada exitosamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error del servidor' });
    }
});

// Obtener horarios disponibles para una fecha
router.get('/horarios-disponibles/:fecha', async (req, res) => {
    try {
        const fecha = new Date(req.params.fecha);
        const horariosOcupados = await Reservation.find({
            fecha: fecha,
            estado: { $ne: 'cancelada' }
        }).select('hora');

        const todosHorarios = [
            '09:00', '10:00', '11:00', '12:00',
            '14:00', '15:00', '16:00', '17:00', '18:00'
        ];

        const horariosDisponibles = todosHorarios.filter(horario => 
            !horariosOcupados.some(reserva => reserva.hora === horario)
        );

        res.json(horariosDisponibles);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error del servidor' });
    }
});

module.exports = router;