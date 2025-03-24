const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true
    },
    instructor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        trim: true
    },
    duration: {
        type: String,  // Changed from Number to String to support formats like "8 weeks"
        required: [true, 'Duration is required']
    },
    price: {
        type: Number,
        required: [true, 'Price is required']
    },
    level: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced'],
        required: [true, 'Level is required']
    },
    rating: {  // Added a direct rating field for simplicity
        type: Number,
        default: 0
    },
    students: {  // Added a students count field
        type: Number,
        default: 0
    },
    featured: {  // Added a featured flag
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: ['draft', 'published', 'archived'],
        default: 'draft'
    },
    thumbnail: {  // Changed from image to thumbnail
        type: String,
        default: 'default-course.jpg' // Default image path
    },
    chapters: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chapter'
    }],
    enrolledStudents: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    ratings: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        rating: {
            type: Number,
            min: 1,
            max: 5
        },
        review: String,
        date: {
            type: Date,
            default: Date.now
        }
    }],
    totalLectures: { // Total number of lectures across all chapters
        type: Number,
        default: 0
    },
    totalDuration: { // Total duration of all video content
        type: String,
        default: '0h 0m'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the updatedAt timestamp before saving
courseSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

// Calculate average rating
courseSchema.virtual('averageRating').get(function() {
    if (this.ratings.length === 0) return this.rating;  // Return the static rating if no ratings
    const sum = this.ratings.reduce((total, rating) => total + rating.rating, 0);
    return (sum / this.ratings.length).toFixed(1);
});

// Update student count when enrolledStudents changes
courseSchema.pre('save', function(next) {
    if (this.isModified('enrolledStudents')) {
        this.students = this.enrolledStudents.length;
    }
    next();
});

const Course = mongoose.model('Course', courseSchema);
module.exports = Course;