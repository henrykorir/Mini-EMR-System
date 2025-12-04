const mysql = require('mysql2'); // Use mysql2 for the connection pool
const dbConfig = require('../config/db.config');  // Your database config

class DatabaseManager {
  constructor() {
    this.connectionPool = null;
    this.init();
  }

  // Initialize the connection pool
  init() {
    try {
      // Creating the connection pool with mysql2
      this.connectionPool = mysql.createPool(dbConfig.connection);
      console.log('Database connection pool established successfully');
    } catch (poolError) {
      console.error('Failed to create database pool:', poolError.message);
      throw poolError;
    }
  }

  // Execute query without returning a Promise; instead, using callbacks inside the method
  executeQuery(sql, parameters = [], callback) {
    this.connectionPool.getConnection((connError, connection) => {
      if (connError) {
        console.error('Database connection error:', connError.message);
        return callback(new Error('Service temporarily unavailable'), null);  // Return error in callback
      }

      connection.query(sql, parameters, (queryError, results) => {
        connection.release();  // Always release the connection after use

        if (queryError) {
          console.error('Query execution failed:', queryError.message);
          return callback(new Error('Database operation failed'), null);  // Return error in callback
        }

        callback(null, results);  // Return results in callback
      });
    });
  }

  // Execute transaction using callbacks instead of Promises
  executeTransaction(operations, callback) {
    this.connectionPool.getConnection((connError, connection) => {
      if (connError) {
        return callback(new Error('Unable to start transaction'), null);  // Return error if connection fails
      }

      connection.beginTransaction((transactionError) => {
        if (transactionError) {
          connection.release();
          return callback(new Error('Transaction initialization failed'), null);  // Return error if transaction fails
        }

        const transactionResults = [];

        // Execute each operation within the transaction
        const executeOperations = (index) => {
          if (index >= operations.length) {
            // All operations are done, commit the transaction
            connection.commit((commitError) => {
              if (commitError) {
                connection.rollback(() => {
                  connection.release();
                  callback(new Error('Transaction commit failed'), null);  // Return commit error in callback
                });
              } else {
                connection.release();
                callback(null, transactionResults);  // Return successful results in callback
              }
            });
            return;
          }

          const operation = operations[index];

          // Execute the current operation
          connection.query(operation.sql, operation.values, (error, result) => {
            if (error) {
              connection.rollback(() => {
                connection.release();
                callback(error, null);  // Return error in callback
              });
            } else {
              transactionResults.push(result);  // Add result to transaction results
              executeOperations(index + 1);  // Continue to next operation
            }
          });
        };

        executeOperations(0);  // Start executing the first operation
      });
    });
  }

  // Health check method to test if the database is available
  healthCheck(callback) {
    // Perform a simple health check query to ensure the database is available
    this.executeQuery('SELECT 1 as status', [], callback);  // Call executeQuery with a simple query
  }
}

const dbManager = new DatabaseManager();
module.exports = dbManager;
