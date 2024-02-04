const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

const {
  MYSQL_HOST,
  MYSQL_USER,
  MYSQL_PASSWORD,
  MYSQL_DATABASE,
} = process.env;

// Create MySQL Connection Pool
const pool = mysql.createPool({
  host: MYSQL_HOST,
  user: MYSQL_USER,
  password: MYSQL_PASSWORD,
  database: MYSQL_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

module.exports = {
  executeQuery: async (query, params) => {
    const connection = await pool.getConnection();
    try {
      const [results] = await connection.query(query, params);
      return results;
    } finally {
      connection.release();
    }
  },

  createTable: async () => {
    const connection = await pool.getConnection();
    try {
      await connection.query(`
        CREATE TABLE IF NOT EXISTS users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          username VARCHAR(255) NOT NULL,
          password VARCHAR(255) NOT NULL
        )
      `);
    } finally {
      connection.release();
    }
  },
};
