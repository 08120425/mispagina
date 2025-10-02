const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect('mongodb://localhost:27017/spa_app', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log(`MongoDB conectado: ${conn.connection.host}`);
    } catch (error) {
        console.error('Error conectando a MongoDB:', error.message);
        process.exit(1);
    }
};

module.exports = connectDB;