const mysql = require('mysql2/promise');
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

  // Execute a query using the mysql2 promise API
  executeQuery(sql, parameters = []) {
    return new Promise((resolve, reject) => {
      this.connectionPool.execute(sql, parameters)
        .then(([results]) => {
          resolve(results);
        })
        .catch((queryError) => {
          console.error('Query execution failed:', queryError.message);
          reject(new Error('Database operation failed'));
        });
    });
  }

  // Execute a transaction using the mysql2 promise API
  executeTransaction(operations) {
    return new Promise(async (resolve, reject) => {
      const connection = await this.connectionPool.getConnection().catch((connError) => {
        return reject(new Error('Unable to start transaction'));
      });

      try {
        await connection.beginTransaction();

        const transactionResults = [];

        for (const operation of operations) {
          try {
            const [result] = await connection.execute(operation.sql, operation.values);
            transactionResults.push(result);
          } catch (operationError) {
            await connection.rollback();
            connection.release();
            return reject(operationError);
          }
        }

        await connection.commit();
        connection.release();
        resolve(transactionResults);
      } catch (transactionError) {
        await connection.rollback();
        connection.release();
        reject(new Error('Transaction failed: ' + transactionError.message));
      }
    });
  }

  // Health check to verify if the DB is reachable
  healthCheck() {
    return this.executeQuery('SELECT 1 as status');
  }
}

const dbManager = new DatabaseManager();
module.exports = dbManager;
