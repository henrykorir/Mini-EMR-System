const mysql = require('mysql2'); // Import mysql2 instead of mysql
const dbConfig = require('../config/db.config');

class DatabaseManager {
  constructor() {
    this.connectionPool = null;
    this.init();
  }

  init() {
    try {
      // Create a connection pool using mysql2
      this.connectionPool = mysql.createPool(dbConfig.connection);
      console.log('Database connection pool established successfully');
    } catch (poolError) {
      console.error('Failed to create database pool:', poolError.message);
      throw poolError;
    }
  }

  executeQuery(sql, parameters = []) {
    return new Promise((resolve, reject) => {
      // Get a connection from the pool
      this.connectionPool.getConnection((connError, connection) => {
        if (connError) {
          console.error('Database connection error:', connError.message);
          return reject(new Error('Service temporarily unavailable'));
        }

        // Use the promise-based query execution provided by mysql2
        connection.execute(sql, parameters)  // `execute` is preferred in mysql2
          .then(([results]) => {
            connection.release();
            resolve(results);  // Resolve with the query results
          })
          .catch((queryError) => {
            connection.release();
            console.error('Query execution failed:', queryError.message);
            reject(new Error('Database operation failed'));
          });
      });
    });
  }

  executeTransaction(operations) {
    return new Promise((resolve, reject) => {
      // Get a connection from the pool
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
              const result = await connection.execute(operation.sql, operation.values);  // Use execute() for query
              transactionResults.push(result[0]);  // Extract results from array
            }

            // Commit the transaction
            connection.commit((commitError) => {
              if (commitError) {
                connection.rollback(() => {
                  connection.release();
                  reject(new Error('Transaction commit failed'));
                });
              } else {
                connection.release();
                resolve(transactionResults);
              }
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
}

const dbManager = new DatabaseManager();
module.exports = dbManager;
