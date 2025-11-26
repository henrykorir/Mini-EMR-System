const mysql = require('mysql');
const dbConfig = require('../config/db.config');

class DatabaseManager {
  constructor() {
    this.connectionPool = null;
    this.initialized = false;
    this.init();
  }

  init() {
    try {
      console.log('🔄 Initializing database connection pool...');
      this.connectionPool = mysql.createPool(dbConfig.connection);
      
      // Test the connection
      this.testConnection()
        .then(() => {
          this.initialized = true;
          console.log('✅ Database connection pool established successfully');
          const connectionInfo = this.getConnectionInfo();
          console.log(`📍 ${connectionInfo.host}:${connectionInfo.port}/${connectionInfo.database} (${connectionInfo.type})`);
        })
        .catch(error => {
          console.error('❌ Database connection test failed:', error.message);
          this.initialized = false;
        });
    } catch (poolError) {
      console.error('💥 Failed to create database pool:', poolError.message);
      this.initialized = false;
      throw poolError;
    }
  }

  testConnection() {
    return new Promise((resolve, reject) => {
      if (!this.connectionPool) {
        return reject(new Error('Connection pool not initialized'));
      }

      this.connectionPool.getConnection((connError, connection) => {
        if (connError) {
          return reject(connError);
        }

        connection.query('SELECT 1 as test', (queryError) => {
          connection.release();
          if (queryError) {
            reject(queryError);
          } else {
            resolve();
          }
        });
      });
    });
  }

  waitForConnection(maxRetries = 5, retryDelay = 2000) {
    return new Promise((resolve, reject) => {
      let retries = 0;

      const checkConnection = () => {
        if (this.initialized) {
          resolve();
        } else if (retries < maxRetries) {
          retries++;
          console.log(`⏳ Waiting for database connection... (${retries}/${maxRetries})`);
          setTimeout(checkConnection, retryDelay);
        } else {
          reject(new Error('Database connection timeout'));
        }
      };

      checkConnection();
    });
  }

  executeQuery(sql, parameters = []) {
    return new Promise(async (resolve, reject) => {
      // Wait for connection to be ready
      try {
        await this.waitForConnection();
      } catch (error) {
        return reject(new Error('Service temporarily unavailable'));
      }

      this.connectionPool.getConnection((connError, connection) => {
        if (connError) {
          console.error('Database connection error:', connError.message);
          return reject(new Error('Service temporarily unavailable'));
        }

        connection.query(sql, parameters, (queryError, results) => {
          connection.release();
          
          if (queryError) {
            console.error('Query execution failed:', queryError.message);
            console.error('SQL:', sql);
            console.error('Parameters:', parameters);
            return reject(new Error('Database operation failed'));
          }
          
          resolve(results);
        });
      });
    });
  }

  executeTransaction(operations) {
    return new Promise(async (resolve, reject) => {
      // Wait for connection to be ready
      try {
        await this.waitForConnection();
      } catch (error) {
        return reject(new Error('Service temporarily unavailable'));
      }

      this.connectionPool.getConnection((connError, connection) => {
        if (connError) {
          return reject(new Error('Unable to start transaction'));
        }

        connection.beginTransaction(async (transactionError) => {
          if (transactionError) {
            connection.release();
            return reject(new Error('Transaction initialization failed'));
          }

          try {
            const transactionResults = [];
            
            for (const operation of operations) {
              const result = await new Promise((opResolve, opReject) => {
                connection.query(operation.sql, operation.values, (error, results) => {
                  if (error) return opReject(error);
                  opResolve(results);
                });
              });
              transactionResults.push(result);
            }

            connection.commit((commitError) => {
              if (commitError) {
                return connection.rollback(() => {
                  connection.release();
                  reject(new Error('Transaction commit failed'));
                });
              }
              
              connection.release();
              resolve(transactionResults);
            });
          } catch (operationError) {
            connection.rollback(() => {
              connection.release();
              reject(operationError);
            });
          }
        });
      });
    });
  }

  healthCheck() {
    return this.executeQuery('SELECT 1 as status');
  }

  getConnectionInfo() {
    const dbConfig = require('../config/db.config');
    if (typeof dbConfig.getConnectionInfo === 'function') {
      return dbConfig.getConnectionInfo();
    }
    return {
      host: dbConfig.connection.host,
      database: dbConfig.connection.database,
      port: dbConfig.connection.port,
      type: 'unknown'
    };
  }

  isInitialized() {
    return this.initialized;
  }
}

const dbManager = new DatabaseManager();
module.exports = dbManager;
