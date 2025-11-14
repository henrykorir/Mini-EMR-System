const mysql = require('mysql');
require('dotenv').config();

// Access environment variables
const dbHost = process.env.DB_HOST;
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;
const dbDatabase = process.env.DB_DATABASE;

const connection = mysql.createConnection({
  host: dbHost,
  user: dbUser,
  password: dbPassword,
  database: dbDatabase
});

exports.getSum = (req, res) => {
  
  connection.connect()

  connection.query('SELECT 1 + 1 AS solution', (err, rows, fields) => {
    if (err) throw err
    console.log('The solution is: ', rows[0].solution)
    res.send(rows[0].solution)
  })

  connection.end()
};

