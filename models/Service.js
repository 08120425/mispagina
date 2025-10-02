const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        trim: true
    },
    descripcion: {
        type: String,
        required: true
    },
    precio: {
        type: Number,
        required: true
    },
    duracion: {
        type: Number, // en minutos
        required: true
    },
    imagen: {
        type: String,
        default: '/images/default-service.jpg'
    },
    categoria: {
        type: String,
        enum: ['masajes', 'faciales', 'corporales', 'relajacion', 'belleza'],
        required: true
    },
    disponible: {
        type: Boolean,
        default: true
    }
});

module.exports = mongoose.model('Service', serviceSchema);