// Grab DOM elements
const loginForm = document.getElementById('loginForm');
const phoneInput = document.getElementById('phone');
const passwordInput = document.getElementById('password');
const loginMessage = document.getElementById('loginMessage');
const loginButton = document.getElementById('loginButton');

// Handle Form Submission
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Clear previous message
        loginMessage.textContent = '';
        loginMessage.className = '';

        const phone = phoneInput.value.trim();
        const password = passwordInput.value.trim();

        // Basic frontend validation
        if (!phone || !password) {
            showMessage('Please fill in all fields.', 'error');
            return;
        }

        // UI feedback during request
        loginButton.disabled = true;
        loginButton.textContent = 'Logging in...';

        try {
            // Live API request to Express Backend using explicit 127.0.0.1 IP
            const response = await fetch('http://127.0.0.1:5000/api/auth/login', {
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

            // Save JWT Token & User Profile
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

            showMessage('Login successful! Redirecting...', 'success');

            // Redirect based on backend user role
            setTimeout(() => {
                if (data.user.role === 'admin') {
                    window.location.href = 'admin-dashboard.html';
                } else {
                    window.location.href = 'client-dashboard.html';
                }
            }, 1000);

        } catch (error) {
            console.error('Login Error:', error);
            showMessage('Server unreachable. Make sure backend server is running.', 'error');
            loginButton.disabled = false;
            loginButton.textContent = 'Login';
        }
    });
}

// Helper function to display styled status messages
function showMessage(message, type) {
    loginMessage.textContent = message;
    loginMessage.className = type === 'error' ? 'error-message' : 'success-message';
}