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

        // Create new user with hashed password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        const user = new User({
            name,
            email,
            password: hashedPassword,
            role: role || 'student' // Default to student if role not provided
        });
        
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
        console.log('Login attempt:', req.body);
        
        const { email, password } = req.body;
        
        // Validate input
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }
        
        // Find user by email
        const user = await User.findOne({ email });
        
        if (!user) {
            console.log('User not found:', email);
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        
        // Check password match
        const isMatch = await bcrypt.compare(password, user.password);
        
        if (!isMatch) {
            console.log('Password mismatch for:', email);
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        
        // Update last login time
        user.lastLogin = Date.now();
        user.isActive = true;
        await user.save();

        // Generate a JWT token
        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );        // Create response with user data (excluding password)
        const userResponse = {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            profileImage: user.profileImage // Include the profile image URL
        };

        console.log('Login successful for:', email, 'Profile image:', user.profileImage || 'None');
        
        // Return the response
        res.status(200).json({ 
            token, 
            user: userResponse,
            message: 'Login successful' 
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get current user route
router.get('/me', auth, async (req, res) => {
    try {
        // The auth middleware already verified the token and attached the user ID
        const user = await User.findById(req.user.userId).select('-password');
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update last active timestamp
        user.lastActive = Date.now();
        await user.save();

        return res.json({
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            profileImage: user.profileImage // Include the profile image URL
        });
    } catch (error) {
        console.error('Error fetching user profile:', error);
        return res.status(500).json({ message: 'Server error', error: error.message });
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
        const allowedUpdates = ['name', 'email', 'password', 'preferences', 'profileImage'];
        const updateFields = {};

        console.log('Profile update request:', {
            userId: req.user.userId, // Log the userId from token
            updates: updates // Log the requested updates
        });

        // Validate required fields
        if (!updates.name) {
            return res.status(400).json({ message: 'Name is required' });
        }

        Object.keys(updates).forEach(key => {
            if (allowedUpdates.includes(key)) {
                if (key === 'password' && updates[key]) {
                    updateFields[key] = bcrypt.hashSync(updates[key], 10);
                } else {
                    updateFields[key] = updates[key];
                }
            }
        });

        // Use userId from token payload
        const userId = req.user.userId;
        if (!userId) {
            console.error('User ID not found in token payload');
            return res.status(401).json({ message: 'Authentication error: User ID not found' });
        }

        const user = await User.findByIdAndUpdate(
            userId,
            { $set: updateFields },
            { new: true }
        ).select('-password');

        if (!user) {
            console.error('User not found with ID:', userId);
            return res.status(404).json({ message: 'User not found' });
        }

        console.log('Profile updated successfully for user:', userId);

        // Return proper response with updated user data
        res.json({ 
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                profileImage: user.profileImage
            }
        });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ message: 'Error updating profile', error: error.message });
    }
});

module.exports = router;