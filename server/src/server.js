/**
 * AI Learning Hub - Server Entry Point
 * Production-ready server for Ghana Education Platform
 */

import dotenv from 'dotenv';
import app from './app.js';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 5000;

// Start server
const server = app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║         AI LEARNING HUB - Ghana Education Platform        ║
║                                                           ║
║  Server running on: http://localhost:${PORT}              ║
║  Environment: ${process.env.NODE_ENV || 'development'}                      ║
║  Database: Connected                                      ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

export default server;
