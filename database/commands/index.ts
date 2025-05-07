import mysql from "mysql2/promise";

// Create MySQL connection pool
export const pool = mysql.createPool({
  host: process.env.PLANETSCALE_HOST,
  user: process.env.PLANETSCALE_USERNAME,
  password: process.env.PLANETSCALE_PASSWORD,
  database: process.env.PLANETSCALE_DATABASE,
  ssl: {
    rejectUnauthorized: false,
  },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});
