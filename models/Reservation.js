const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
    usuario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    servicio: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service',
        required: true
    },
    fecha: {
        type: Date,
        required: true
    },
    hora: {
        type: String,
        required: true
    },
    notas: {
        type: String,
        default: ''
    },
    estado: {
        type: String,
        enum: ['pendiente', 'confirmada', 'completada', 'cancelada'],
        default: 'pendiente'
    },
    fechaCreacion: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Reservation', reservationSchema);