const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Register route
router.post('/register', async (req, res) => {
    try {
        // Log the raw request body for debugging
        console.log('Raw request body:', req.body);
        
        // Ensure content type is set
        res.setHeader('Content-Type', 'application/json');
        
        const { name, email, password, role } = req.body;

        // Validate required fields
        if (!name || !email || !password) {
            console.log('Missing required fields:', { name: !!name, email: !!email, password: !!password });
            return res.status(400).json({
                message: 'Missing required fields',
                missing: ['name', 'email', 'password'].filter(field => !req.body[field])
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.log('User already exists:', email);
            return res.status(400).json({ message: 'Email is already registered' });
        }

        // Create and validate user instance
        const user = new User({ name, email, password, role });
        
        try {
            await user.validate();
        } catch (validationError) {
            console.error('Validation error:', validationError);
            return res.status(400).json({
                message: 'Validation error',
                errors: Object.values(validationError.errors).map(err => err.message)
            });
        }

        // Save the user
        await user.save();
        console.log('User saved successfully:', { id: user._id, email: user.email });

        // Generate token
        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );

        // Prepare response object
        const response = {
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        };

        // Log the response for debugging
        console.log('Registration response:', JSON.stringify(response));

        // Send response with explicit JSON stringification
        return res.status(201).json(response);
    } catch (error) {
        console.error('Registration error:', error);
        return res.status(500).json({ 
            message: 'Error registering user', 
            error: error.message 
        });
    }
});

// Login route
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) return res.status(401).json({ message: 'Invalid email or password' });

        // Generate a JWT token
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(200).json({ token, user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get current user route
router.get('/me', async (req, res) => {
    try {

        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        const user = await User.findById(decoded.userId).select('-password');
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        return res.json(user);
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token' });
    }
});

router.post('/logout', auth, async (req, res) => {
    try {
        // Update user's active status
        await User.findByIdAndUpdate(req.user._id, {
            isActive: false,
            lastActive: new Date()
        });

        // Clear the cookie
        res.clearCookie('token');
        res.json({ message: 'Logged out successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error logging out', error: error.message });
    }
});

router.get('/session', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ user });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching session', error: error.message });
    }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
    try {
        const updates = req.body;
        const allowedUpdates = ['name', 'email', 'password', 'preferences'];
        const updateFields = {};

        Object.keys(updates).forEach(key => {
            if (allowedUpdates.includes(key)) {
                if (key === 'password' && updates[key]) {
                    updateFields[key] = bcrypt.hashSync(updates[key], 10);
                } else {
                    updateFields[key] = updates[key];
                }
            }
        });

        const user = await User.findByIdAndUpdate(
            req.user._id,
            { $set: updateFields },
            { new: true }
        ).select('-password');

        res.json({ user });
    } catch (error) {
        res.status(500).json({ message: 'Error updating profile', error: error.message });
    }
});

module.exports = router;