// Mock client state (Simulates the authenticated client session)
const currentClient = {
    id: 1,
    name: 'Chukwuma Adebayo',
    phone: '08012345678',
    dailyGoal: 1000,
    paidToday: true,
    totalSavings: 15000,
    activeLoanBalance: 0
};

// Personal payment history mock
let clientTransactions = [
    {
        id: 'TX1001',
        type: 'Savings Deposit',
        amount: 1000,
        timestamp: '2026-09-18 14:30',
        status: 'Completed'
    },
    {
        id: 'TX0998',
        type: 'Savings Deposit',
        amount: 1000,
        timestamp: '2026-09-17 10:15',
        status: 'Completed'
    },
    {
        id: 'TX0985',
        type: 'Savings Deposit',
        amount: 1000,
        timestamp: '2026-09-16 16:00',
        status: 'Completed'
    }
];

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

// Initialize Client Dashboard UI
document.addEventListener('DOMContentLoaded', () => {
    renderClientProfile();
    renderHistoryTable();
});

// 1. Render Dashboard Metrics
function renderClientProfile() {
    clientNameDisplay.textContent = currentClient.name;
    savingsBalance.textContent = `₦${currentClient.totalSavings.toLocaleString()}`;
    activeLoanBalance.textContent = `₦${currentClient.activeLoanBalance.toLocaleString()}`;
    dailyTarget.textContent = `₦${currentClient.dailyGoal.toLocaleString()}`;

    if (currentClient.paidToday) {
        todayStatus.innerHTML = `<span class="status-badge status-paid">PAID TODAY</span>`;
    } else {
        todayStatus.innerHTML = `<span class="status-badge status-unpaid">UNPAID</span>`;
    }
}

// 2. Render Personal Transaction History Table
function renderHistoryTable() {
    clientHistoryBody.innerHTML = '';

    clientTransactions.forEach(tx => {
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
}

// 3. Handle Withdrawal Request
withdrawalForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const amount = parseFloat(document.getElementById('withdrawalAmount').value);
    const reason = document.getElementById('withdrawalReason').value.trim();

    if (amount > currentClient.totalSavings) {
        showMessage(withdrawalMessage, 'Insufficient savings balance for this request.', 'error');
        return;
    }

    // In full implementation, this sends a POST request to Express (/api/withdrawals/request)
    showMessage(withdrawalMessage, 'Withdrawal request submitted successfully! Pending admin approval.', 'success');
    withdrawalForm.reset();
});

// 4. Handle Loan Application
loanApplyForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const amount = parseFloat(document.getElementById('applyLoanAmount').value);
    const tenure = parseInt(document.getElementById('applyTenure').value);

    // In full implementation, this sends a POST request to Express (/api/loans/apply)
    showMessage(loanApplyMessage, `Loan application for ₦${amount.toLocaleString()} over ${tenure} days submitted!`, 'success');
    loanApplyForm.reset();
});

// 5. Handle Logout
logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('userRole');
    window.location.href = 'index.html';
});

// Helper Function for Feedback Messages
function showMessage(element, message, type) {
    element.textContent = message;
    element.className = type === 'error' ? 'form-message error-message' : 'form-message success-message';
}