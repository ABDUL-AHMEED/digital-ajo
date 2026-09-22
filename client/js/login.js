// DOM Elements
const loginForm = document.getElementById('loginForm');
const phoneInput = document.getElementById('phone');
const passwordInput = document.getElementById('password');
const loginButton = document.getElementById('loginButton');
const loginMessage = document.getElementById('loginMessage');

// Live Render API Base URL
const API_BASE_URL = 'https://digital-ab8v.onrender.com/api';

// Handle Login Submission
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const phone = phoneInput.value.trim();
    const password = passwordInput.value.trim();

    if (!phone || !password) {
        showMessage('Please enter both phone number and password.', 'error');
        return;
    }

    loginButton.disabled = true;
    loginButton.textContent = 'Logging in...';
    showMessage('', '');

    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ phone, password })
        });

        const data = await response.json();

        if (!response.ok) {
            showMessage(data.message || 'Invalid phone number or password.', 'error');
            loginButton.disabled = false;
            loginButton.textContent = 'Login';
            return;
        }

        // Save Auth Token & User Data
        localStorage.setItem('token', data.token);
        localStorage.setItem('userRole', data.user.role);
        localStorage.setItem('user', JSON.stringify(data.user));

        // Redirect based on user role
        if (data.user.role === 'admin') {
            window.location.href = 'admin-dashboard.html';
        } else {
            window.location.href = 'client-dashboard.html';
        }

    } catch (error) {
        console.error('Login Error:', error);
        showMessage('Server unreachable. Make sure backend server is running.', 'error');
        loginButton.disabled = false;
        loginButton.textContent = 'Login';
    }
});

// Helper Function for Feedback Messages
function showMessage(message, type) {
    loginMessage.textContent = message;
    loginMessage.className = type === 'error' ? 'form-message error-message' : 'form-message success-message';
}