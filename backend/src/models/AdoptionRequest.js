const mongoose = require('mongoose');

const adoptionRequestSchema = new mongoose.Schema(
  {
    pet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pet',
      required: [true, 'Pet reference is required'],
    },
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Requester reference is required'],
    },
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      minlength: [2, 'Full name must be at least 2 characters'],
      maxlength: [100, 'Full name must not exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      match: [/^[+\d\s\-()]{7,20}$/, 'Please enter a valid phone number'],
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true,
      maxlength: [300, 'Address must not exceed 300 characters'],
    },
    reason: {
      type: String,
      required: [true, 'Reason for adoption is required'],
      trim: true,
      minlength: [20, 'Please provide a more detailed reason (at least 20 characters)'],
      maxlength: [1000, 'Reason must not exceed 1000 characters'],
    },
    hasOtherPets: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

// Prevent duplicate requests from the same user for the same pet
adoptionRequestSchema.index({ pet: 1, requester: 1 }, { unique: true });

module.exports = mongoose.model('AdoptionRequest', adoptionRequestSchema);
