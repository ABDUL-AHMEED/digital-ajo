const express = require('express');
const router = express.Router();
const pool = require('../db/database');

// GET transactions
router.get('/transactions', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM transactions ORDER BY id DESC');
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({ message: 'Server error fetching transactions.' });
    }
});

// POST record payment
router.post('/record-payment', async (req, res) => {
    const { clientId, amount } = req.body;

    try {
        const clientQuery = await pool.query('SELECT * FROM clients WHERE id = $1', [clientId]);
        if (clientQuery.rows.length === 0) {
            return res.status(404).json({ message: 'Client not found.' });
        }

        const clientName = clientQuery.rows[0].name;

        const newTx = await pool.query(
            `INSERT INTO transactions (client_id, client_name, type, amount, status, timestamp) 
             VALUES ($1, $2, 'Savings Deposit', $3, 'Completed', NOW()) RETURNING *`,
            [clientId, clientName, amount]
        );

        res.status(201).json({
            message: 'Payment recorded successfully!',
            transaction: newTx.rows[0]
        });
    } catch (error) {
        console.error('Error recording payment:', error);
        res.status(500).json({ message: 'Database error recording payment.' });
    }
});

// POST reverse transaction
router.post('/reverse-transaction', async (req, res) => {
    const { transactionId } = req.body;

    try {
        await pool.query(
            `UPDATE transactions SET status = 'Reversed' WHERE id = $1`,
            [transactionId]
        );

        res.json({ message: 'Transaction reversed successfully!' });
    } catch (error) {
        console.error('Error reversing transaction:', error);
        res.status(500).json({ message: 'Database error reversing transaction.' });
    }
});

module.exports = router;