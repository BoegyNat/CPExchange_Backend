const util = require("util");
var mysql = require("mysql2");
const dbConfig = require("./config/db.config.js");
require("dotenv").config();

var pool = mysql.createPool({
  connectionLimit: 10,
  user: dbConfig.USER,
  host: dbConfig.HOST,
  port: dbConfig.PORT,
  password: dbConfig.PASSWORD,
  database: dbConfig.DB,
  connectTimeout: 10000,
  // socketPath: process.env.NODE_ENV === "production" ? dbConfig.SOCKETPATH : "",
});

pool.getConnection((err, connection) => {
  if (err) {
    if (err.code === "PROTOCOL_CONNECTION_LOST") {
      console.error("Database connection was closed.");
    }
    if (err.code === "ER_CON_COUNT_ERROR") {
      console.error("Database has too many connections.");
    }
    if (err.code === "ECONNREFUSED") {
      console.error("Database connection was refused.");
    }
  }

  if (connection) connection.release();

  return;
});

// Check database connection
pool.query('SELECT 1', (err, results) => {
  if (err) {
    console.error('Error connecting to the database:', err);
  } else {
    console.log('Database connection successful:', results);
  }
});

pool.query = util.promisify(pool.query);

module.exports = pool;
