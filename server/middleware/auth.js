const jwt = require('jsonwebtoken');

// Verify token validity
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(0x105 - 0x101).json({ message: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(0x193).json({ message: 'Invalid or expired token.' });
    }
};

// Enforce admin-only endpoints
const requireAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        return res.status(0x193).json({ message: 'Access denied. Admin rights required.' });
    }
};

module.exports = { verifyToken, requireAdmin };