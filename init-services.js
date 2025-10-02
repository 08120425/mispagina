// Script para inicializar servicios en la base de datos con imágenes locales
// Ejecutar con: node init-services.js

const mongoose = require('mongoose');

// Conectar a MongoDB
mongoose.connect('mongodb://localhost:27017/spa_app', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// Esquema del servicio
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
        type: Number,
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

const Service = mongoose.model('Service', serviceSchema);

// Servicios completos con imágenes locales
const serviciosCompletos = [
    // === MASAJES ===
    {
        nombre: 'Masaje Relajante Aromático',
        descripcion: 'Un masaje completo de cuerpo entero utilizando aceites esenciales premium para liberar tensiones y promover la relajación profunda. Ideal para combatir el estrés diario y reconectar con tu bienestar interior.',
        precio: 800,
        duracion: 60,
        categoria: 'masajes',
        imagen: '/images/masaje-relajante.jpg'
    },
    {
        nombre: 'Masaje de Tejido Profundo',
        descripcion: 'Masaje terapéutico intensivo diseñado para aliviar tensiones musculares crónicas, nudos y contracturas. Utiliza técnicas especializadas para mejorar la circulación y restaurar la movilidad muscular.',
        precio: 950,
        duracion: 60,
        categoria: 'masajes',
        imagen: '/images/masaje-tejido-profundo.jpg'
    },
    {
        nombre: 'Masaje Prenatal Especializado',
        descripcion: 'Masaje especializado para futuras madres que alivia las molestias del embarazo, reduce la hinchazón y proporciona relajación segura. Realizado por terapeutas certificados en masaje prenatal.',
        precio: 850,
        duracion: 60,
        categoria: 'masajes',
        imagen: '/images/masaje-prenatal.jpg'
    },

    // === FACIALES ===
    {
        nombre: 'Facial Hidratante Premium',
        descripcion: 'Tratamiento facial profundo con productos de alta gama que hidratan, nutren y rejuvenecen tu piel, dejándola radiante, suave y con un brillo natural. Incluye limpieza profunda, exfoliación y mascarilla nutritiva.',
        precio: 600,
        duracion: 45,
        categoria: 'faciales',
        imagen: '/images/facial-hidratante.jpg'
    },
    {
        nombre: 'Facial Anti-Edad Deluxe',
        descripcion: 'Tratamiento facial avanzado con tecnología de última generación y productos anti-edad que estimulan la producción de colágeno, reducen líneas de expresión y devuelven la luminosidad juvenil a tu piel.',
        precio: 900,
        duracion: 75,
        categoria: 'faciales',
        imagen: '/images/facial-anti-edad.jpg'
    },

    // === CORPORALES ===
    {
        nombre: 'Envoltura Corporal Detox',
        descripcion: 'Tratamiento corporal completo con arcillas minerales y productos naturales que eliminan toxinas, tonifican la piel y mejoran la circulación. Incluye exfoliación corporal y masaje relajante.',
        precio: 1200,
        duracion: 90,
        categoria: 'corporales',
        imagen: '/images/envoltura-corporal.jpg'
    },
    {
        nombre: 'Tratamiento Corporal Reafirmante',
        descripcion: 'Tratamiento integral que combina exfoliación, masaje reafirmante y aplicación de productos específicos para tonificar la piel, reducir la celulitis y mejorar la elasticidad corporal.',
        precio: 1100,
        duracion: 80,
        categoria: 'corporales',
        imagen: '/images/tratamiento-reafirmante.jpg'
    },

    // === RELAJACIÓN ===
    {
        nombre: 'Terapia de Piedras Calientes',
        descripcion: 'Relajante terapia que combina masaje terapéutico con piedras volcánicas calientes para aliviar tensiones musculares profundas, mejorar la circulación y proporcionar una relajación total del cuerpo y mente.',
        precio: 1000,
        duracion: 75,
        categoria: 'relajacion',
        imagen: '/images/piedras-calientes.jpg'
    },
    {
        nombre: 'Reflexología Terapéutica',
        descripcion: 'Terapia holística que aplica presión en puntos específicos de los pies para estimular la sanación natural del cuerpo, mejorar la circulación y promover el equilibrio energético general.',
        precio: 550,
        duracion: 45,
        categoria: 'relajacion',
        imagen: '/images/reflexologia.jpg'
    },
    {
        nombre: 'Ritual de Relajación Completo',
        descripcion: 'Experiencia spa completa que incluye baño aromático, exfoliación corporal suave, masaje relajante de cuerpo completo y tratamiento facial hidratante. El paquete perfecto para desconectar completamente.',
        precio: 1800,
        duracion: 120,
        categoria: 'relajacion',
        imagen: '/images/ritual-relajacion.jpg'
    },

    // === BELLEZA ===
    {
        nombre: 'Manicure y Pedicure Spa',
        descripcion: 'Servicio completo de belleza para manos y pies que incluye limpieza, exfoliación, hidratación profunda, tratamiento de cutículas y esmaltado profesional con productos de primera calidad.',
        precio: 450,
        duracion: 60,
        categoria: 'belleza',
        imagen: '/images/manicure-spa.jpg'
    },
    {
        nombre: 'Depilación con Cera Premium',
        descripcion: 'Servicio profesional de depilación utilizando ceras de alta calidad y técnicas especializadas para garantizar una piel suave y libre de vellos por más tiempo, con mínimas molestias.',
        precio: 350,
        duracion: 30,
        categoria: 'belleza',
        imagen: '/images/depilacion-cera.jpg'
    }
];

async function inicializarServicios() {
    try {
        console.log('🔄 Conectando a MongoDB...');
        
        // Verificar conexión
        if (mongoose.connection.readyState !== 1) {
            console.log('⏳ Esperando conexión a MongoDB...');
            await new Promise(resolve => {
                mongoose.connection.once('connected', resolve);
            });
        }
        
        console.log('✅ Conectado a MongoDB exitosamente');
        
        // Limpiar servicios existentes (opcional - descomenta si quieres limpiar)
        const existingCount = await Service.countDocuments();
        if (existingCount > 0) {
            console.log(`⚠️  Encontrados ${existingCount} servicios existentes`);
            console.log('🗑️  Eliminando servicios anteriores...');
            await Service.deleteMany({});
            console.log('✅ Servicios anteriores eliminados');
        }
        
        // Insertar nuevos servicios
        console.log('📝 Insertando nuevos servicios...');
        const serviciosCreados = await Service.insertMany(serviciosCompletos);
        
        console.log(`\n🎉 ¡${serviciosCreados.length} servicios creados exitosamente!\n`);
        
        // Mostrar resumen por categoría
        const categorias = ['masajes', 'faciales', 'corporales', 'relajacion', 'belleza'];
        
        for (const categoria of categorias) {
            const serviciosCategoria = serviciosCreados.filter(s => s.categoria === categoria);
            console.log(`\n💆‍♀️ ${categoria.toUpperCase()} (${serviciosCategoria.length} servicios):`);
            serviciosCategoria.forEach(servicio => {
                console.log(`   • ${servicio.nombre} - $${servicio.precio} (${servicio.duracion}min)`);
            });
        }
        
        // Estadísticas finales
        const totalServicios = serviciosCreados.length;
        const precioPromedio = Math.round(serviciosCreados.reduce((sum, s) => sum + s.precio, 0) / totalServicios);
        const duracionPromedio = Math.round(serviciosCreados.reduce((sum, s) => sum + s.duracion, 0) / totalServicios);
        
        console.log(`\n📊 ESTADÍSTICAS:`);
        console.log(`   • Total de servicios: ${totalServicios}`);
        console.log(`   • Precio promedio: $${precioPromedio}`);
        console.log(`   • Duración promedio: ${duracionPromedio} minutos`);
        console.log(`   • Rango de precios: $${Math.min(...serviciosCreados.map(s => s.precio))} - $${Math.max(...serviciosCreados.map(s => s.precio))}`);
        
        console.log('\n🌸 ¡Inicialización completada exitosamente!');
        console.log('💡 Tu aplicación de spa está lista para usar con todos los servicios cargados.');
        
    } catch (error) {
        console.error('❌ Error al inicializar servicios:', error);
        
        if (error.code === 'ECONNREFUSED') {
            console.log('\n💡 SOLUCIÓN:');
            console.log('   1. Asegúrate de que MongoDB esté ejecutándose');
            console.log('   2. Inicia MongoDB con: mongod');
            console.log('   3. O inicia el servicio: net start MongoDB (Windows)');
        }
        
    } finally {
        console.log('\n🔐 Cerrando conexión a la base de datos...');
        await mongoose.connection.close();
        console.log('✅ Conexión cerrada correctamente');
        console.log('\n🚀 ¡Tu spa está listo para recibir clientas!');
        process.exit(0);
    }
}

// Manejo de errores de conexión
mongoose.connection.on('error', (err) => {
    console.error('❌ Error de conexión a MongoDB:', err.message);
});

mongoose.connection.on('disconnected', () => {
    console.log('🔌 Desconectado de MongoDB');
});

// Manejo de cierre graceful
process.on('SIGINT', async () => {
    console.log('\n⏹️  Proceso interrumpido, cerrando conexión...');
    await mongoose.connection.close();
    process.exit(0);
});

// Ejecutar la inicialización
if (require.main === module) {
    console.log('🌸 ===== SERENITY SPA - INICIALIZACIÓN DE SERVICIOS =====\n');
    inicializarServicios();
}

module.exports = { inicializarServicios, serviciosCompletos };