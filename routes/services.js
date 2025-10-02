const express = require('express');
const Service = require('../models/Service');

const router = express.Router();

// Obtener todos los servicios
router.get('/', async (req, res) => {
    try {
        const services = await Service.find({ disponible: true });
        res.json(services);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error del servidor' });
    }
});

// Obtener servicio por ID
router.get('/:id', async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);
        if (!service) {
            return res.status(404).json({ message: 'Servicio no encontrado' });
        }
        res.json(service);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error del servidor' });
    }
});

// Obtener servicios por categoría
router.get('/categoria/:categoria', async (req, res) => {
    try {
        const services = await Service.find({ 
            categoria: req.params.categoria, 
            disponible: true 
        });
        res.json(services);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error del servidor' });
    }
});

module.exports = router;