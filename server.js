const express = require("express");
const session = require("express-session");
const MySQLStore = require('express-mysql-session')(session); // 1. Import this
const db = require("./db"); // 2. Import your existing database connection
const cors = require("cors");
const path = require("path");

const app = express();

// Session Store Configuration
// This automatically creates a 'sessions' table in your MySQL DB
const sessionStore = new MySQLStore({}, db); 

// Middleware Configuration
app.use(express.json());
app.use(cors({
    origin: true, 
    credentials: true // Crucial for keeping sessions alive across refreshes
}));

// Serving the UI Layer
app.use(express.static(path.join(__dirname, "views"))); 

// Serving uploaded documents
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Updated Session Management
app.use(session({
  key: 'must_user_sid',
  secret: "must_institutional_secret_2026",
  store: sessionStore, // 3. Link the session to the database store
  resave: false,
  saveUninitialized: false,
  cookie: { 
      maxAge: 1000 * 60 * 60 * 24, // 24 Hours
      httpOnly: true 
  }
}));
app.use(cors({
    origin: true,       // Reflects the request origin
    credentials: true   // THIS IS THE KEY: it allows cookies to be sent back and forth
}));

// Route Mapping
app.use("/auth", require("./routes/auth"));
app.use("/student", require("./routes/student"));
app.use("/teacher", require("./routes/teacher"));
app.use("/admin", require("./routes/admin"));

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`MUST Tracker System Running on: http://localhost:${PORT}`);
});