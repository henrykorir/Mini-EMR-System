require('dotenv').config();

const app = require('./app');
const database = require('./lib/database');

const SERVER_PORT = process.env.APPLICATION_PORT || 8080;
const SERVER_HOST = process.env.SERVER_HOST || '0.0.0.0';

// Database connection verification
async function verifyDatabaseConnection() {
  try {
    await database.healthCheck();
    console.log('Database connection verified');
    return true;
  } catch (dbError) {
    console.error('Database connection failed:', dbError.message);
    return false;
  }
}

// Graceful shutdown handling
function setupSignalHandlers() {
  const shutdownActions = async (signal) => {
    console.log(`\nReceived ${signal}, initiating graceful shutdown...`);
    
    setTimeout(() => {
      console.log('Forced shutdown after timeout');
      process.exit(1);
    }, 10000).unref();

    process.exit(0);
  };

  process.on('SIGTERM', () => shutdownActions('SIGTERM'));
  process.on('SIGINT', () => shutdownActions('SIGINT'));
}

// Server initialization
async function initializeApplication() {
  const isDatabaseReady = await verifyDatabaseConnection();
  
  if (!isDatabaseReady) {
    console.error('Application startup aborted due to database connectivity issues');
    process.exit(1);
  }

  const serverInstance = app.listen(SERVER_PORT, SERVER_HOST, () => {
    console.log(`\nMedical Records API Server Started`);
    console.log(`Listening on: http://${SERVER_HOST}:${SERVER_PORT}`);
    console.log(`Started at: ${new Date().toISOString()}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });

  serverInstance.on('error', (serverError) => {
    if (serverError.code === 'EADDRINUSE') {
      console.error(`Port ${SERVER_PORT} is already in use`);
    } else {
      console.error('Server startup error:', serverError.message);
    }
    process.exit(1);
  });

  setupSignalHandlers();
}

// Application entry point
if (require.main === module) {
  initializeApplication().catch(initError => {
    console.error('Application initialization failed:', initError);
    process.exit(1);
  });
}