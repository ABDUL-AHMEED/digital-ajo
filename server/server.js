const express = require("express");
const cors = require("cors");
require("dotenv").config();

const pool = require("./db/database");

// -----------------------------
// IMPORT ALL ROUTE MODULES
// -----------------------------
const authRoutes = require("./routes/auth");
const clientRoutes = require("./routes/clients");
const loanRoutes = require("./routes/loans");
const paymentRoutes = require("./routes/payments");

const app = express();

// -----------------------------
// MIDDLEWARE
// -----------------------------
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
app.use("/api/clients", clientRoutes);
app.use("/api/loans", loanRoutes);
app.use("/api/payments", paymentRoutes);

// Fallback mounts so requests sent to /api/admin match your route controllers
app.use("/api/admin/clients", clientRoutes);
app.use("/api/admin/register-client", clientRoutes);
app.use("/api/admin", clientRoutes);
app.use("/api/admin", paymentRoutes);

// -----------------------------
// BASIC & HEALTH CHECK ROUTES
// -----------------------------
app.get("/", (req, res) => {
    res.json({
        message: "Digital Ajo API is running 🚀"
    });
});

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