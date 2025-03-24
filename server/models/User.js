const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true,
        validate: {
            validator: function(v) {
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
            },
            message: props => `${props.value} is not a valid email address!`
        }
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters long']
    },
    role: {
        type: String,
        enum: {
            values: ['student', 'teacher', 'admin'],
            message: '{VALUE} is not a supported role'
        },
        default: 'student'
    },
    enrolledCourses: [{
        course: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Course'
        },
        enrollmentDate: {
            type: Date,
            default: Date.now
        },
        payment: {
            amount: Number,
            date: Date,
            status: {
                type: String,
                enum: ['pending', 'completed', 'failed'],
                default: 'pending'
            }
        },
        progress: {
            type: Number,
            default: 0,
            min: 0,
            max: 100
        },
        examResults: [{
            examTitle: String,
            score: Number,
            maxScore: Number,
            dateTaken: {
                type: Date,
                default: Date.now
            }
        }]
    }],
    lastActive: {
        type: Date,
        default: Date.now
    },
    isActive: {
        type: Boolean,
        default: true
    },
    totalSpent: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
    try {
        if (this.isModified('password')) {
            console.log('Hashing password for user:', this.email);
            this.password = await bcrypt.hash(this.password, 8);
        }
        next();
    } catch (error) {
        console.error('Error while hashing password:', error);
        next(error);
    }
});

// Method to compare password for login
userSchema.methods.comparePassword = async function(password) {
    return bcrypt.compare(password, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;