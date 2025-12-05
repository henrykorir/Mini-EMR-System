const mysql = require('mysql2'); // Standard callback API
const dbConfig = require('../config/db.config');

class DatabaseManager {
  constructor() {
    this.connectionPool = null;
    this.init();
  }

  init() {
    try {
      this.connectionPool = mysql.createPool({
        ...dbConfig.connection,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
      });
      console.log('Database connection pool established successfully');
    } catch (poolError) {
      console.error('Failed to create database pool:', poolError.message);
      throw poolError;
    }
  }

  executeQuery(sql, parameters = []) {
    return new Promise((resolve, reject) => {
      this.connectionPool.execute(sql, parameters, (error, results, fields) => {
        if (error) {
          console.error('Query execution failed:', error.message);
          return reject(new Error('Database operation failed'));
        }
        resolve(results);
      });
    });
  }

  // Using getConnection for more control
  executeQueryWithConnection(sql, parameters = []) {
    return new Promise((resolve, reject) => {
      this.connectionPool.getConnection((connError, connection) => {
        if (connError) {
          console.error('Database connection error:', connError.message);
          return reject(new Error('Service temporarily unavailable'));
        }

        connection.execute(sql, parameters, (queryError, results) => {
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
      this.connectionPool.getConnection(async (connError, connection) => {
        if (connError) {
          return reject(new Error('Unable to start transaction'));
        }

        try {
          await new Promise((resolve, reject) => {
            connection.beginTransaction((transactionError) => {
              if (transactionError) reject(transactionError);
              else resolve();
            });
          });

          const transactionResults = [];
          
          for (const operation of operations) {
            const result = await new Promise((resolve, reject) => {
              connection.execute(operation.sql, operation.values, (error, results) => {
                if (error) reject(error);
                else resolve(results);
              });
            });
            transactionResults.push(result);
          }

          await new Promise((resolve, reject) => {
            connection.commit((commitError) => {
              if (commitError) reject(commitError);
              else resolve();
            });
          });

          connection.release();
          resolve(transactionResults);
          
        } catch (operationError) {
          connection.rollback(() => {
            connection.release();
            console.error('Transaction failed:', operationError.message);
            reject(new Error('Transaction operation failed'));
          });
        }
      });
    });
  }

  healthCheck() {
    return this.executeQuery('SELECT 1 as status');
  }
}

const dbManager = new DatabaseManager();
module.exports = dbManager;
