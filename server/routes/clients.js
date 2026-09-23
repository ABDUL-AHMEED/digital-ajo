const express = require('express');
const router = express.Router();
const pool = require('../db/database');

// GET all clients
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM clients ORDER BY id DESC');
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching clients:', error);
        res.status(500).json({ message: 'Server error fetching clients.' });
    }
});

// GET clients fallback path
router.get('/clients', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM clients ORDER BY id DESC');
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching clients:', error);
        res.status(500).json({ message: 'Server error fetching clients.' });
    }
});

// POST register new client
router.post('/register-client', async (req, res) => {
    const { name, phone, dailyGoal, startDate, pin, password } = req.body;

    try {
        const clientPin = pin || password || '1234';
        const goal = dailyGoal || 0;

        // Dynamic check or direct safe insert
        const newClient = await pool.query(
            `INSERT INTO clients (name, phone, daily_goal, start_date, pin) 
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [name, phone, goal, startDate || new Date(), clientPin]
        );

        res.status(201).json({
            message: 'Client registered successfully!',
            client: newClient.rows[0]
        });
    } catch (error) {
        console.error('❌ Detailed Database Registration Error:', error);
        res.status(500).json({ 
            message: 'Database error registering client.',
            detail: error.message 
        });
    }
});

module.exports = router;