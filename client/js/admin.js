// DOM Elements
const registerClientForm = document.getElementById('registerClientForm');
const registerMessage = document.getElementById('registerMessage');
const collectionTrackerBody = document.getElementById('collectionTrackerBody');
const transactionsLogBody = document.getElementById('transactionsLogBody');
const currentDateDisplay = document.getElementById('currentDateDisplay');
const logoutBtn = document.getElementById('logoutBtn');

// Loan Form Elements
const issueLoanForm = document.getElementById('issueLoanForm');
const loanClientId = document.getElementById('loanClientId');
const loanAmountInput = document.getElementById('loanAmount');
const interestRateInput = document.getElementById('interestRate');
const tenureDaysInput = document.getElementById('tenureDays');
const calculatedTotalPayable = document.getElementById('calculatedTotalPayable');
const calculatedDailyRepayment = document.getElementById('calculatedDailyRepayment');
const loanMessage = document.getElementById('loanMessage');

// Summary Metric Elements
const totalClientsCount = document.getElementById('totalClientsCount');
const todayCollectionsTotal = document.getElementById('todayCollectionsTotal');

// Base API URL
const API_BASE_URL = 'https://digital-ajo-1lhw.onrender.com/api';

// State Management
let clients = [];
let transactions = [];

// Initialize Admin Dashboard UI
document.addEventListener('DOMContentLoaded', () => {
    setCurrentDate();
    fetchDashboardData();
    setupLoanCalculations();
    setupLogout();
});

// Set Current Date in Header
function setCurrentDate() {
    const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
    currentDateDisplay.textContent = new Date().toLocaleDateString('en-NG', options);
}

// Fetch All Dashboard Data from Live API
async function fetchDashboardData() {
    const token = localStorage.getItem('token');
    
    try {
        const [clientsRes, txRes] = await Promise.all([
            fetch(`${API_BASE_URL}/admin/clients`, {
                headers: { 'Authorization': `Bearer ${token}` }
            }),
            fetch(`${API_BASE_URL}/admin/transactions`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
        ]);

        if (clientsRes.ok) clients = await clientsRes.json();
        if (txRes.ok) transactions = await txRes.json();

        renderDashboard();
    } catch (error) {
        console.error('Error fetching admin dashboard data:', error);
    }
}

// Main Render Function
function renderDashboard() {
    renderStats();
    renderCollectionTracker();
    renderTransactions();
    populateClientDropdown();
}

// 1. Render Summary Statistics
function renderStats() {
    totalClientsCount.textContent = clients.length;
    
    const todayTotal = transactions
        .filter(t => t.status === 'Completed' && t.type === 'Savings Deposit')
        .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);

    todayCollectionsTotal.textContent = `₦${todayTotal.toLocaleString()}`;
}

// 2. Render Daily Collection Tracker Table
function renderCollectionTracker() {
    collectionTrackerBody.innerHTML = '';

    if (clients.length === 0) {
        collectionTrackerBody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; color: #666; padding: 20px;">
                    No clients registered yet. Use the form on the left to add your first client!
                </td>
            </tr>
        `;
        return;
    }

    clients.forEach(client => {
        const row = document.createElement('tr');

        const statusClass = client.paidToday ? 'status-paid' : 'status-unpaid';
        const statusText = client.paidToday ? 'PAID TODAY' : 'UNPAID';

        row.innerHTML = `
            <td><strong>${client.name}</strong><br><small>${client.phone}</small></td>
            <td>₦${(client.dailyGoal || 0).toLocaleString()}</td>
            <td><span class="status-badge ${statusClass}">${statusText}</span></td>
            <td>${client.lastPaymentDate || 'No payments yet'}</td>
            <td>
                ${client.paidToday 
                    ? `<span style="color: #2d6a4f; font-weight: 600;">✓ Recorded</span>`
                    : `<button class="btn-action btn-pay" onclick="confirmPayment(${client.id})">Log Today's Payment</button>`
                }
            </td>
        `;

        collectionTrackerBody.appendChild(row);
    });
}

// 3. Render Transactions and Reversals Table
function renderTransactions() {
    transactionsLogBody.innerHTML = '';

    if (transactions.length === 0) {
        transactionsLogBody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; color: #666; padding: 20px;">
                    No transactions recorded today.
                </td>
            </tr>
        `;
        return;
    }

    transactions.forEach(tx => {
        const row = document.createElement('tr');

        const isReversed = tx.status === 'Reversed';
        const statusClass = isReversed ? 'status-unpaid' : 'status-paid';

        row.innerHTML = `
            <td><code>${tx.id}</code></td>
            <td>${tx.clientName}</td>
            <td>${tx.type}</td>
            <td>₦${(parseFloat(tx.amount) || 0).toLocaleString()}</td>
            <td><small>${tx.timestamp}</small></td>
            <td><span class="status-badge ${statusClass}">${tx.status}</span></td>
            <td>
                ${!isReversed 
                    ? `<button class="btn-action btn-reverse" onclick="triggerReversal('${tx.id}')">Reverse</button>`
                    : `<span style="color: #666;"><small>Reversed (Audited)</small></span>`
                }
            </td>
        `;

        transactionsLogBody.appendChild(row);
    });
}

// 4. Register New Client
registerClientForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('clientName').value.trim();
    const phone = document.getElementById('clientPhone').value.trim();
    const dailyGoal = parseFloat(document.getElementById('dailySavingsGoal').value);
    const startDate = document.getElementById('startDate').value;

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/admin/register-client`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ name, phone, dailyGoal, startDate })
        });

        const data = await response.json();

        if (!response.ok) {
            registerMessage.textContent = data.message || 'Error registering client.';
            registerMessage.style.color = '#d90429';
            return;
        }

        registerMessage.textContent = 'Client registered successfully!';
        registerMessage.style.color = '#2d6a4f';

        registerClientForm.reset();
        fetchDashboardData();

        setTimeout(() => { registerMessage.textContent = ''; }, 3000);
    } catch (error) {
        registerMessage.textContent = 'Network error. Please try again.';
        registerMessage.style.color = '#d90429';
    }
});

// 5. Two-Step Payment Confirmation
async function confirmPayment(clientId) {
    const client = clients.find(c => c.id === clientId);
    if (!client) return;

    const confirmed = confirm(`Confirm payment of ₦${client.dailyGoal.toLocaleString()} for ${client.name}?`);
    
    if (confirmed) {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/admin/record-payment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ clientId: client.id, amount: client.dailyGoal })
            });

            if (response.ok) {
                fetchDashboardData();
            } else {
                alert('Failed to log payment on server.');
            }
        } catch (error) {
            alert('Network error while recording payment.');
        }
    }
}

// 6. Transaction Reversal Functionality
async function triggerReversal(txId) {
    const tx = transactions.find(t => t.id === txId);
    if (!tx || tx.status === 'Reversed') return;

    const confirmed = confirm(`Are you sure you want to REVERSE transaction ${txId}? This action cannot be undone.`);

    if (confirmed) {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/admin/reverse-transaction`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ transactionId: txId })
            });

            if (response.ok) {
                fetchDashboardData();
            } else {
                alert('Failed to reverse transaction on server.');
            }
        } catch (error) {
            alert('Network error while reversing transaction.');
        }
    }
}

// 7. Dynamic Loan Repayment Calculations
function setupLoanCalculations() {
    const calculate = () => {
        const principal = parseFloat(loanAmountInput.value) || 0;
        const rate = parseFloat(interestRateInput.value) || 0;
        const tenure = parseInt(tenureDaysInput.value) || 1;

        const totalInterest = (principal * rate) / 100;
        const totalPayable = principal + totalInterest;
        const dailyInstallment = totalPayable / tenure;

        calculatedTotalPayable.textContent = `₦${totalPayable.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
        calculatedDailyRepayment.textContent = `₦${dailyInstallment.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
    };

    loanAmountInput.addEventListener('input', calculate);
    interestRateInput.addEventListener('input', calculate);
    tenureDaysInput.addEventListener('input', calculate);
}

// Populate Client Select Dropdown for Loans
function populateClientDropdown() {
    loanClientId.innerHTML = '<option value="">-- Choose Client --</option>';
    clients.forEach(c => {
        const option = document.createElement('option');
        option.value = c.id;
        option.textContent = `${c.name} (${c.phone})`;
        loanClientId.appendChild(option);
    });
}

// Logout Handler
function setupLogout() {
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = 'index.html';
        });
    }
}