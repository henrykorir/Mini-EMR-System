const mysql = require('mysql');
const dbConfig = require('../config/db.config');

class DatabaseManager {
  constructor() {
    this.connectionPool = null;
    this.init();
  }

  init() {
    try {
      this.connectionPool = mysql.createPool(dbConfig.connection);
      console.log('Database connection pool established successfully');
    } catch (poolError) {
      console.error('Failed to create database pool:', poolError.message);
      throw poolError;
    }
  }

  executeQuery(sql, parameters = []) {
    return new Promise((resolve, reject) => {
      this.connectionPool.getConnection((connError, connection) => {
        if (connError) {
          console.error('Database connection error:', connError.message);
          return reject(new Error('Service temporarily unavailable'));
        }

        connection.query(sql, parameters, (queryError, results) => {
          connection.release();
          
          if (queryError) {
            console.error('Query execution failed:', queryError.message);
            return reject(new Error('Database operation failed'));
          }
          
          resolve(results);
        });
      });
    });
  }

  executeTransaction(operations) {
    return new Promise((resolve, reject) => {
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
}

const dbManager = new DatabaseManager();
module.exports = dbManager;