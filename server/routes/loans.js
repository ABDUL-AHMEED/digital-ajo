const express = require('express');
const router = express.Router();
const pool = require('../db/database');

// POST issue loan
router.post('/issue', async (req, res) => {
    const { clientId, amount, interestRate, tenureDays } = req.body;

    try {
        const principal = parseFloat(amount) || 0;
        const rate = parseFloat(interestRate) || 0;
        const tenure = parseInt(tenureDays) || 1;

        const totalPayable = principal + (principal * rate / 100);
        const dailyRepayment = totalPayable / tenure;

        const newLoan = await pool.query(
            `INSERT INTO loans (client_id, amount, interest_rate, tenure_days, total_payable, daily_repayment, status, created_at) 
             VALUES ($1, $2, $3, $4, $5, $6, 'Active', NOW()) RETURNING *`,
            [clientId, principal, rate, tenure, totalPayable, dailyRepayment]
        );

        res.status(201).json({
            message: 'Loan issued successfully!',
            loan: newLoan.rows[0]
        });
    } catch (error) {
        console.error('Error issuing loan:', error);
        res.status(500).json({ message: 'Database error issuing loan.' });
    }
});

module.exports = router;