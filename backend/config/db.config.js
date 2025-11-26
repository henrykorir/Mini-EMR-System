const mysql = require('mysql');

class DatabaseConfig {
  static getConnectionConfig() {
    // Check if we're in Railway by looking for Railway-specific env vars
    const isRailway = process.env.RAILWAY_ENVIRONMENT || 
                     process.env.RAILWAY_PROJECT_NAME || 
                     process.env.RAILWAY_SERVICE_NAME;

    // Priority 1: Use MYSQL_URL if it exists and doesn't contain unresolved variables
    if (process.env.MYSQL_URL && !process.env.MYSQL_URL.includes('${')) {
      console.log('🔗 Using MYSQL_URL');
      return this.parseMySQLURL(process.env.MYSQL_URL);
    }

    // Priority 2: Use MYSQL_PUBLIC_URL if it exists and doesn't contain unresolved variables
    if (process.env.MYSQL_PUBLIC_URL && !process.env.MYSQL_PUBLIC_URL.includes('${')) {
      console.log('🌐 Using MYSQL_PUBLIC_URL');
      return this.parseMySQLURL(process.env.MYSQL_PUBLIC_URL);
    }

    // Priority 3: Use individual Railway variables if they're resolved
    if (isRailway && process.env.MYSQLHOST && !process.env.MYSQLHOST.includes('${')) {
      console.log('🚂 Using Railway individual variables');
      return {
        host: process.env.MYSQLHOST,
        port: parseInt(process.env.MYSQLPORT) || 3306,
        user: process.env.MYSQLUSER || 'root',
        password: process.env.MYSQLPASSWORD,
        database: process.env.MYSQLDATABASE,
        charset: 'utf8mb4',
        connectTimeout: parseInt(process.env.DB_CONNECTION_TIMEOUT) || 60000,
        acquireTimeout: 60000,
        timeout: 60000,
        reconnect: true,
        multipleStatements: false
      };
    }

    // Priority 4: Fallback to local development configuration
    console.log('💻 Using local development configuration');
    return {
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
    };
  }

  static parseMySQLURL(urlString) {
    try {
      const url = new URL(urlString);
      return {
        host: url.hostname,
        port: url.port || 3306,
        user: url.username,
        password: url.password,
        database: url.pathname.replace('/', ''),
        charset: 'utf8mb4',
        connectTimeout: parseInt(process.env.DB_CONNECTION_TIMEOUT) || 60000,
        acquireTimeout: 60000,
        timeout: 60000,
        reconnect: true,
        multipleStatements: false
      };
    } catch (error) {
      console.error('❌ Failed to parse MySQL URL:', error.message);
      // Fallback to individual variables
      return {
        host: process.env.MYSQLHOST || 'localhost',
        port: process.env.MYSQLPORT || 3306,
        user: process.env.MYSQLUSER || 'root',
        password: process.env.MYSQLPASSWORD || '',
        database: process.env.MYSQLDATABASE || 'medi_grind_db',
        charset: 'utf8mb4',
        connectTimeout: parseInt(process.env.DB_CONNECTION_TIMEOUT) || 60000,
        acquireTimeout: 60000,
        timeout: 60000,
        reconnect: true,
        multipleStatements: false
      };
    }
  }

  static getConnectionInfo() {
    const config = this.getConnectionConfig();
    return {
      host: config.host,
      database: config.database,
      port: config.port,
      type: this.getConnectionType()
    };
  }

  static getConnectionType() {
    if (process.env.MYSQL_URL && !process.env.MYSQL_URL.includes('${')) {
      return process.env.MYSQL_URL.includes('railway.internal') ? 'railway-private' : 'railway-url';
    } else if (process.env.MYSQLHOST && !process.env.MYSQLHOST.includes('${')) {
      return process.env.MYSQLHOST.includes('railway.internal') ? 'railway-private' : 'railway-public';
    } else {
      return 'local';
    }
  }
}

// Export the connection configuration for your DatabaseManager
const dbConfig = {
  connection: {
    ...DatabaseConfig.getConnectionConfig(),
    connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT) || 20,
    acquireTimeout: 60000,
    timeout: 60000
  }
};

module.exports = dbConfig;
