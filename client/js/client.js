// DOM Elements
const clientNameDisplay = document.getElementById('clientNameDisplay');
const savingsBalance = document.getElementById('savingsBalance');
const activeLoanBalance = document.getElementById('activeLoanBalance');
const dailyTarget = document.getElementById('dailyTarget');
const todayStatus = document.getElementById('todayStatus');
const clientHistoryBody = document.getElementById('clientHistoryBody');

// Form Elements
const withdrawalForm = document.getElementById('withdrawalForm');
const withdrawalMessage = document.getElementById('withdrawalMessage');
const loanApplyForm = document.getElementById('loanApplyForm');
const loanApplyMessage = document.getElementById('loanApplyMessage');
const logoutBtn = document.getElementById('logoutBtn');

// Base API URL
const API_BASE_URL = 'https://digital-ab8v.onrender.com/api';

// Initialize Client Dashboard UI
document.addEventListener('DOMContentLoaded', () => {
    fetchClientProfile();
    fetchHistoryTable();
});

// 1. Fetch & Render Dashboard Metrics
async function fetchClientProfile() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/client/profile`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error('Failed to fetch profile');

        const client = await response.json();

        clientNameDisplay.textContent = client.name || 'Client';
        savingsBalance.textContent = `₦${(client.totalSavings || 0).toLocaleString()}`;
        activeLoanBalance.textContent = `₦${(client.activeLoanBalance || 0).toLocaleString()}`;
        dailyTarget.textContent = `₦${(client.dailyGoal || 0).toLocaleString()}`;

        if (client.paidToday) {
            todayStatus.innerHTML = `<span class="status-badge status-paid">PAID TODAY</span>`;
        } else {
            todayStatus.innerHTML = `<span class="status-badge status-unpaid">UNPAID</span>`;
        }
    } catch (error) {
        console.error('Profile load error:', error);
    }
}

// 2. Fetch & Render Personal Transaction History Table
async function fetchHistoryTable() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/client/transactions`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error('Failed to fetch transactions');

        const transactions = await response.json();
        clientHistoryBody.innerHTML = '';

        transactions.forEach(tx => {
            const row = document.createElement('tr');
            const isReversed = tx.status === 'Reversed';
            const statusClass = isReversed ? 'status-unpaid' : 'status-paid';

            row.innerHTML = `
                <td><small>${tx.timestamp}</small></td>
                <td>${tx.type}</td>
                <td>₦${tx.amount.toLocaleString()}</td>
                <td><span class="status-badge ${statusClass}">${tx.status}</span></td>
            `;

            clientHistoryBody.appendChild(row);
        });
    } catch (error) {
        console.error('History load error:', error);
    }
}

// 3. Handle Withdrawal Request
withdrawalForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const amount = parseFloat(document.getElementById('withdrawalAmount').value);
    const reason = document.getElementById('withdrawalReason').value.trim();

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/withdrawals/request`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ amount, reason })
        });

        const data = await response.json();

        if (!response.ok) {
            showMessage(withdrawalMessage, data.message || 'Withdrawal request failed.', 'error');
            return;
        }

        showMessage(withdrawalMessage, 'Withdrawal request submitted successfully! Pending admin approval.', 'success');
        withdrawalForm.reset();
        fetchClientProfile();
    } catch (error) {
        showMessage(withdrawalMessage, 'Network error. Please try again.', 'error');
    }
});

// 4. Handle Loan Application
loanApplyForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const amount = parseFloat(document.getElementById('applyLoanAmount').value);
    const tenure = parseInt(document.getElementById('applyTenure').value);

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/loans/apply`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ amount, tenure })
        });

        const data = await response.json();

        if (!response.ok) {
            showMessage(loanApplyMessage, data.message || 'Loan application failed.', 'error');
            return;
        }

        showMessage(loanApplyMessage, `Loan application for ₦${amount.toLocaleString()} over ${tenure} days submitted!`, 'success');
        loanApplyForm.reset();
        fetchClientProfile();
    } catch (error) {
        showMessage(loanApplyMessage, 'Network error. Please try again.', 'error');
    }
});

// 5. Handle Logout
logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    window.location.href = 'index.html';
});

// Helper Function for Feedback Messages
function showMessage(element, message, type) {
    element.textContent = message;
    element.className = type === 'error' ? 'form-message error-message' : 'form-message success-message';
}