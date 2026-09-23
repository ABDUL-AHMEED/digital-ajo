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

// GET clients under /admin/clients endpoint
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

        const newClient = await pool.query(
            `INSERT INTO clients (name, phone, daily_goal, start_date, pin, created_at) 
             VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *`,
            [name, phone, goal, startDate || new Date(), clientPin]
        );

        res.status(201).json({
            message: 'Client registered successfully!',
            client: newClient.rows[0]
        });
    } catch (error) {
        console.error('Error registering client:', error);
        res.status(500).json({ message: 'Database error registering client.' });
    }
});

module.exports = router;