// Database configuration settings
const databaseConfig = {
  connection: {
    host: process.env.MYSQLHOST || process.env.DB_HOST || 'localhost',
    port: process.env.MYSQLPORT || process.env.DB_PORT || 3306,
    user: process.env.MYSQLUSER || process.env.DB_USERNAME || 'root',
    password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || '',
    database: process.env.MYSQLDATABASE || process.env.DB_NAME || 'medi_grind_db',
    charset: 'utf8mb4',
    connectTimeout: parseInt(process.env.DB_CONNECTION_TIMEOUT) || 60000,
    acquireTimeout: 60000,
    timeout: 60000,
    reconnect: true,
    multipleStatements: false
  },
  pool: {
    connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT) || 20,
    acquireTimeout: 60000,
    timeout: 60000
  }
};

module.exports = databaseConfig;
