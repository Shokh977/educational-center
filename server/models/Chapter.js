const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['video', 'pdf', 'quiz'],
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  file: {
    type: String, // URL to the file (video or PDF)
    required: function() {
      return this.type === 'video' || this.type === 'pdf';
    }
  },
  duration: {
    type: String, // Duration for videos in format "HH:MM:SS"
    required: function() {
      return this.type === 'video';
    }
  },
  questions: [{
    question: {
      type: String,
      required: function() {
        return this.parent().type === 'quiz';
      }
    },
    options: [{
      type: String,
      required: function() {
        return this.parent().parent().type === 'quiz';
      }
    }],
    correctAnswer: {
      type: Number,
      required: function() {
        return this.parent().parent().type === 'quiz';
      }
    }
  }],
  order: {
    type: Number,
    required: true
  }
});

const chapterSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Chapter title is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  order: {
    type: Number,
    required: true
  },
  contents: [contentSchema],
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
chapterSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Chapter = mongoose.model('Chapter', chapterSchema);
module.exports = Chapter;
