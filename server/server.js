import 'dotenv/config';
import http from 'http';
import mongoose from 'mongoose';
import app from './app.js';
import connectDB from './src/configs/db.js';
import { startScheduledJobs } from './src/jobs/scheduler.js';

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET'];

const missingEnvVars = requiredEnvVars.filter((name) => {
    const value = String(process.env[name] || '').trim();
    return !value;
});

if (missingEnvVars.length > 0) {
    console.error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
    process.exit(1);
}

// Create http server
const server = http.createServer(app);


// self invoked function
(async () => {
    try {
        await connectDB();
        console.log('Database connected');

        //    after successfull mongodb connection start server
        server.listen(PORT, () => {
            console.log(`Server running in ${NODE_ENV} mode on port ${PORT}`);
        });

        startScheduledJobs();

    } catch (err) {
        console.error('Server startup failed:', err.message);
        process.exit(1);
    }
})();


// UNHANDLED PROMISE REJECTIONS
process.on('unhandledRejection', err => {
    console.error('Unhandled rejection:', err);
    if (process.env.NODE_ENV === 'production') {
        shutdown();
    }
});

// ===============================================
process.on('uncaughtException', err => {
    console.error('Uncaught exception:', err);
    shutdown();
});



// ===============================================
//===================OS SIGNALS ==================

// TERMINATE SIGNAL
process.on('SIGTERM', () => {
    console.warn('SIGTERM received. Closing...');
    shutdown();
});

// INTERRUPTE SIGNAL
process.on('SIGINT', () => {
    console.warn('SIGINT received. Closing...');
    shutdown();
});

// SHUTDOWN FUNCTION
let isShuttingDown = false

async function shutdown() {
    if (isShuttingDown) return
    isShuttingDown = true

    console.log('shutting down...')

    server.close(async () => {
        try {
            await mongoose.connection.close()
            console.log('Server + DB connections closed cleanly.')
            process.exit(0)
        } catch (err) {
            console.error('Error during shutdown:', err)
            process.exit(1)
        }
    })
}
