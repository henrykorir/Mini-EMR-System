// Database configuration settings
const databaseConfig = {
  connection: {
    host: process.env.MYSQLHOST || process.env.DB_HOST,
    port: process.env.MYSQLPORT || process.env.DB_PORT,
    user: process.env.MYSQLUSER || process.env.DB_USERNAME,
    password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD,
    database: process.env.MYSQLDATABASE || process.env.DB_NAME,
    charset: 'utf8mb4',
    multipleStatements: false  // Keep multipleStatements option
  },
  pool: {
    // Pool configuration: ensure these values are correct for your use case
    waitForConnections: true,  // To enable queuing for excess connections
    connectionLimit: 20,      // Max number of connections in pool
    queueLimit: 0,            // 0 means no limit for queued connections
    acquireTimeout: 60000,    // Time to wait before giving up on a connection from the pool
    idleTimeout: 30000       // Max idle time for connections in the pool
  }
};

module.exports = databaseConfig;
