// Database configuration settings
const databaseConfig = {
  connection: {
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USERNAME || 'appuser',
    password: process.env.DB_PASSWORD || 'securepassword123',
    database: process.env.DB_NAME || 'medi_grind_db',
    charset: 'utf8mb4',
    timeout: 60000,
    acquireTimeout: 60000,
    reconnect: true,
    multipleStatements: false
  },
  pool: {
    maxConnections: 20,
    minConnections: 5,
    maxIdleTime: 30000
  }
};

module.exports = databaseConfig;