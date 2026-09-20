const express = require("express");
const cors = require("cors");
require("dotenv").config();

const pool = require("./db/database");
const authRoutes = require("./routes/auth");

const app = express();

// -----------------------------
// MIDDLEWARE
// -----------------------------

// Explicit CORS config to allow frontend requests from any origin/file
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// -----------------------------
// API ROUTES
// -----------------------------

app.use("/api/auth", authRoutes);

// -----------------------------
// BASIC ROUTE
// -----------------------------

app.get("/", (req, res) => {
    res.json({
        message: "Digital Ajo API is running 🚀"
    });
});

// -----------------------------
// DATABASE HEALTH CHECK
// -----------------------------

app.get("/api/health/db", async (req, res) => {
    try {
        const result = await pool.query("SELECT NOW() AS now");

        res.json({
            database: "connected",
            time: result.rows[0].now
        });

    } catch (error) {
        console.error("❌ Database health check failed:");
        console.error(error);

        res.status(500).json({
            database: "disconnected",
            error: error.message
        });
    }
});

// -----------------------------
// SERVER INITIALIZATION
// -----------------------------

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
    console.log(`Digital Ajo server running on port ${PORT}`);

    try {
        const result = await pool.query("SELECT NOW() AS now");

        console.log("Connected to PostgreSQL database ✅");
        console.log("Database time:", result.rows[0].now);

    } catch (error) {
        console.error("❌ PostgreSQL connection failed:");
        console.error(error);
    }
});