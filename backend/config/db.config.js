// Database configuration settings
const databaseConfig = {
  connection: {
    host: process.env.MYSQLHOST || process.env.DB_HOST,
    port: process.env.MYSQLPORT || process.env.DB_PORT,
    user: process.env.MYSQLUSER || process.env.DB_USERNAME,
    password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD,
    database: process.env.MYSQLDATABASE || process.env.DB_NAME,
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
