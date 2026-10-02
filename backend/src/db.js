require('dotenv').config();
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'mas_vale_tarde',
  waitForConnections: true,
  connectionLimit: 10,
  dateStrings: true // las fechas llegan como texto "AAAA-MM-DD HH:MM:SS"
});

module.exports = pool;
