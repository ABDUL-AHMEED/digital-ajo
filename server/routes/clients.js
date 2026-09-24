const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
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

// POST register new client
router.post('/register-client', async (req, res) => {
    const { name, phone, dailyGoal, startDate, pin, password } = req.body;

    try {
        if (!name || !phone) {
            return res.status(400).json({ message: 'Full name and phone number are required.' });
        }

        const clientPassword = password || pin || '1234';
        const goal = parseFloat(dailyGoal) || 0;

        // 1. Check if phone already exists
        const phoneCheck = await pool.query('SELECT id FROM users WHERE phone = $1', [phone]);
        if (phoneCheck.rows.length > 0) {
            return res.status(400).json({ message: 'A user with this phone number already exists.' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(clientPassword, salt);

        // 2. Insert into users table
        const newUser = await pool.query(
            `INSERT INTO users (full_name, phone, password, password_hash, role) 
             VALUES ($1, $2, $3, $4, 'client') 
             RETURNING id`,
            [name, phone, clientPassword, hashedPassword]
        );

        const userId = newUser.rows[0].id;

        // 3. Insert into clients table
        const newClient = await pool.query(
            `INSERT INTO clients (user_id, name, phone, daily_goal, daily_savings_target, start_date, pin) 
             VALUES ($1, $2, $3, $4, $4, $5, $6) 
             RETURNING *`,
            [userId, name, phone, goal, startDate || new Date(), clientPassword]
        );

        res.status(201).json({
            message: 'Client registered successfully!',
            client: newClient.rows[0]
        });

    } catch (error) {
        console.error('❌ Detailed Registration Error:', error);
        res.status(500).json({ 
            message: 'Database error registering client.',
            detail: error.message 
        });
    }
});

module.exports = router;