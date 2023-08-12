const mongoose = require('mongoose');
const config = require('config');
const db = config.get('mongoURI');

const connectDB = async () => {
    let retries = 5; // Number of connection attempts
    while (retries) {
        try {
            await mongoose.connect(db, {
                useNewUrlParser: true,
                useUnifiedTopology: true
            });
            console.log('MongoDB connected');
            break; // Exit loop if connection is successful
        } catch (err) {
            console.error('MongoDB connection error:', err.message);
            retries--;
            console.log(`Retrying in 5 seconds... (${retries} retries left)`);
            await new Promise(resolve => setTimeout(resolve, 5000)); // Retry after 5 seconds
        }
    }
};

module.exports = connectDB;
