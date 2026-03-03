const mysql = require("mysql2");

// Centralized Database Connection [cite: 32, 101]
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "must_tracker"
});

// Connect to MySQL
db.connect((err) => {
    if (err) {
        console.error("Database Connection Failed: " + err.stack);
        return;
    }
    console.log("Connected to MUST Tracker Database.");
});

module.exports = db;