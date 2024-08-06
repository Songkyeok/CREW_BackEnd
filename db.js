const mysql = require('mysql2');
const dotenv = require('dotenv');
dotenv.config();

const db = mysql.createConnection({
    database: "themoim",
    connectionLimit: 10,
    host: "127.0.0.1",
    user: "root",
    password: process.env.DB_PASSWORD,
});
db.connect();

module.exports = db;