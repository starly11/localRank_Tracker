import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI missing from environment variables');
        }

        await mongoose.connect(process.env.MONGO_URI);

        console.log(`MongoDB Connected: ${mongoose.connection.host}`);
        console.log(`Database: ${mongoose.connection.name}`);

        // Handle disconnect
        mongoose.connection.on('disconnected', () => {
            console.warn('MongoDB disconnected');
        });
        // Handle reconnect
        mongoose.connection.on('reconnected', () => {
            console.log('MongoDB reconnected');
        });
        // MONGO driver error
        mongoose.connection.on('error', err => {
            console.error('MongoDB error:', err.message);
        });

    } catch (err) {
        console.error('MongoDB connection failed:', err.message);
        throw err;
    }
};

export default connectDB;
