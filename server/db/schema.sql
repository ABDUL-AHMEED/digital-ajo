-- Drop existing tables to allow clean initialization during setup
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS loan_payments CASCADE;
DROP TABLE IF EXISTS loans CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS clients CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 1. Authentication Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'client' CHECK (role IN ('admin', 'client')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Client Profile Table
CREATE TABLE clients (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    daily_savings_target NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    savings_balance NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Savings Payments Table (Immutable Audit Design)
CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE,
    amount NUMERIC(12, 2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'reversed')),
    recorded_by INTEGER REFERENCES users(id),
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Micro-Loans Table
CREATE TABLE loans (
    id SERIAL PRIMARY KEY,
    client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE,
    principal_amount NUMERIC(12, 2) NOT NULL,
    interest_rate NUMERIC(5, 2) NOT NULL,
    total_payable NUMERIC(12, 2) NOT NULL,
    daily_repayment NUMERIC(12, 2) NOT NULL,
    tenure_days INTEGER NOT NULL,
    outstanding_balance NUMERIC(12, 2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('pending', 'active', 'paid', 'defaulted')),
    disbursed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Loan Repayments Table
CREATE TABLE loan_payments (
    id SERIAL PRIMARY KEY,
    loan_id INTEGER REFERENCES loans(id) ON DELETE CASCADE,
    amount NUMERIC(12, 2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'reversed')),
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Audit Logs Table (Reversals & Financial Tracking)
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    action VARCHAR(50) NOT NULL,
    performed_by INTEGER REFERENCES users(id),
    target_id INTEGER,
    details TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);