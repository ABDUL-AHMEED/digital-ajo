const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db/database');

// POST /api/auth/login
router.post('/login', async (req, res) => {
    const { phone, password } = req.body;

    try {
        if (!phone || !password) {
            return res.status(400).json({ message: 'Phone number and password are required.' });
        }

        const userResult = await pool.query('SELECT * FROM users WHERE phone = $1', [phone]);

        if (userResult.rows.length === 0) {
            return res.status(400).json({ message: 'Invalid phone number or password.' });
        }

        const user = userResult.rows[0];
        
        // Get password column regardless of column naming in DB
        const storedPassword = user.password_hash || user.password;

        // Check bcrypt hash first, or fall back to plain-text string match
        let isMatch = false;
        if (storedPassword && storedPassword.startsWith('$2')) {
            isMatch = await bcrypt.compare(password, storedPassword);
        } else {
            isMatch = (password === storedPassword);
        }

        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid phone number or password.' });
        }

        const secret = process.env.JWT_SECRET || 'digital_ajo_fallback_secret_key_2026';

        const token = jwt.sign(
            { id: user.id, role: user.role, phone: user.phone },
            secret,
            { expiresIn: '1d' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                phone: user.phone,
                role: user.role,
                full_name: user.full_name || user.name
            }
        });

    } catch (err) {
        console.error('❌ Login Route Error:', err);
        res.status(500).json({ message: 'Server error during authentication.' });
    }
});

module.exports = router;