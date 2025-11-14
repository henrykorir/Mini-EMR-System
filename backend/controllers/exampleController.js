const mysql = require('mysql');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Admin123',
  database: 'medigrind'
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

