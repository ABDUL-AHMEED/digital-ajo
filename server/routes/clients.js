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
        const clientPassword = password || pin || '1234';
        const goal = dailyGoal || 0;

        // 1. Create User Authentication Profile
        const newUser = await pool.query(
            `INSERT INTO users (full_name, phone, password, role) 
             VALUES ($1, $2, $3, 'client') 
             ON CONFLICT (phone) DO UPDATE SET password = EXCLUDED.password
             RETURNING id`,
            [name, phone, clientPassword]
        );

        const userId = newUser.rows[0].id;

        // 2. Create Client Record Linked to User ID
        const newClient = await pool.query(
            `INSERT INTO clients (user_id, name, phone, daily_goal, start_date, pin) 
             VALUES ($1, $2, $3, $4, $5, $6) 
             ON CONFLICT (phone) DO UPDATE SET daily_goal = EXCLUDED.daily_goal
             RETURNING *`,
            [userId, name, phone, goal, startDate || new Date(), clientPassword]
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