const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
    try {
        // Look for token in multiple places: Authorization header, cookies, or query params
        let token = null;
        
        // Check Authorization header first (Bearer token)
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.split(' ')[1];
        }
        
        // If no token in header, check cookies
        if (!token && req.cookies && req.cookies.token) {
            token = req.cookies.token;
        }
        
        // If still no token, check query params (for special cases)
        if (!token && req.query && req.query.token) {
            token = req.query.token;
        }
        
        if (!token) {
            console.log('No auth token found in request');
            return res.status(401).json({ message: 'Authentication required. No token provided.' });
        }

        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        
        if (!decoded || !decoded.userId) {
            console.log('Invalid token format:', decoded);
            return res.status(401).json({ message: 'Invalid token format' });
        }
        
        // Get user from database
        const user = await User.findById(decoded.userId);

        if (!user) {
            console.log('User not found for token userId:', decoded.userId);
            return res.status(401).json({ message: 'User not found' });
        }

        // Update last active timestamp
        await User.findByIdAndUpdate(user._id, {
            lastActive: new Date()
        });

        // Attach user info to request
        req.user = decoded;
        req.token = token;
        
        next();
    } catch (error) {
        console.error('Auth middleware error:', error.message);
        return res.status(401).json({ message: 'Please authenticate', error: error.message });
    }
};

module.exports = auth;