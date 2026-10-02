const mongoose = require('mongoose');

const petSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Pet name is required'],
      trim: true,
      minlength: [1, 'Name must be at least 1 character'],
      maxlength: [60, 'Name must not exceed 60 characters'],
    },
    breed: {
      type: String,
      required: [true, 'Breed is required'],
      trim: true,
      maxlength: [60, 'Breed must not exceed 60 characters'],
    },
    age: {
      type: Number,
      required: [true, 'Age is required'],
      min: [0, 'Age cannot be negative'],
      max: [30, 'Age must be a realistic value'],
    },
    species: {
      type: String,
      enum: ['dog', 'cat', 'bird', 'rabbit', 'other'],
      default: 'dog',
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'unknown'],
      default: 'unknown',
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description must not exceed 500 characters'],
    },
    photoPath: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ['available', 'adopted', 'pending'],
      default: 'available',
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

// Index for efficient status-based queries
petSchema.index({ status: 1 });
petSchema.index({ species: 1 });

module.exports = mongoose.model('Pet', petSchema);
