const express = require('express');
const router = express.Router();
const pool = require('../db/database');

// POST /api/payments (Log Today's Savings Payment)
router.post('/', async (req, res) => {
    const { clientId, amount, recordedBy } = req.body;

    try {
        const paymentAmount = parseFloat(amount) || 0;

        if (!clientId || paymentAmount <= 0) {
            return res.status(400).json({ message: 'Valid client ID and payment amount are required.' });
        }

        // 1. Insert Payment Record
        const newPayment = await pool.query(
            `INSERT INTO payments (client_id, amount, recorded_by, status) 
             VALUES ($1, $2, $3, 'completed') RETURNING *`,
            [clientId, paymentAmount, recordedBy || null]
        );

        // 2. Update Client's Total Savings Balance
        await pool.query(
            `UPDATE clients 
             SET savings_balance = COALESCE(savings_balance, 0) + $1 
             WHERE id = $2`,
            [paymentAmount, clientId]
        );

        res.status(201).json({
            message: 'Payment logged successfully!',
            payment: newPayment.rows[0]
        });

    } catch (error) {
        console.error('❌ Payment Logging Error:', error);
        res.status(500).json({ message: 'Error logging payment.', detail: error.message });
    }
});

module.exports = router;