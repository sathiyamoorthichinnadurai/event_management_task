const dotenv = require('dotenv');
dotenv.config();

const app = require('./app');
const { connectDB } = require('./config/db');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    const server = app.listen(PORT, () => {
      console.log(`[Server] API server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    });

    // Handle Unhandled Promise Rejections gracefully without leaking internal error credentials
    process.on('unhandledRejection', (err) => {
      const sanitizedMsg = (err?.message || 'Unhandled error').replace(
        /(mongodb(?:\+srv)?:\/\/)(?:[^:]+):(?:[^@]+)@/gi,
        '$1***:***@'
      );
      console.error(`[Unhandled Rejection] ${err.name || 'Error'}: ${sanitizedMsg}`);
      server.close(() => process.exit(1));
    });
  } catch (error) {
    console.error(`[Server Error] Server failed to start. Please check configuration.`);
    process.exit(1);
  }
};

startServer();
