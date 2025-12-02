
// Establishes and manages the MySQL database connection for the entire backend

const mysql = require('mysql2');// set mysql2 library in Node.js
require('dotenv').config();// reads db credentials from .env file

// Create connection pool (better than single connection)
const pool = mysql.createPool({
    host: process.env.DB_HOST,// The server address where MySQL is running 
    user: process.env.DB_USER,// MySQL username
    password: process.env.DB_PASSWORD,// MySQL user's password
    database: process.env.DB_NAME,// The specific database name to connect to
    waitForConnections: true,// If all 10 connections are busy, new requests wait in line instead of failing immediately
    connectionLimit: 10,// Maximum number of connections in the pool
    queueLimit: 0// No limit on queued connection requests
});// instead of one connection it creates a pool of 10 reusable connections for efficiency

// Convert to promise-based (easier to use with async/await)
const promisePool = pool.promise();
// converts the existing MySQL connection pool into a promise-based pool object.
// allow to use asynchronous methods that return promises

// Test connection
pool.getConnection((err, connection) => {
    if (err) {
        console.error(' database connection failed:', err.message);
        return;
    }
    console.log(' Database connected successfully');
    connection.release();
});

module.exports = promisePool;
//  all other files import this to run SQL queries
