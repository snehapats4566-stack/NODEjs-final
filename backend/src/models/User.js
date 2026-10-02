const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name must not exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    // New Profile Fields
    profilePhoto: { type: String, default: null },
    gallery: { type: [String], default: [] },
    bio: { type: String, default: '' },
    phone: { type: String, default: '' },
    dateOfBirth: { type: Date },
    gender: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    country: { type: String, default: '' },
    occupation: { type: String, default: '' },
    education: { type: String, default: '' },
    languages: { type: String, default: '' },
    interests: { type: String, default: '' },
    
    // Pet adoption related information
    adoptionReason: { type: String, default: '' },
    previousPetExperience: { type: String, default: '' },
    preferredSpecies: { type: String, default: '' },
    preferredBreeds: { type: String, default: '' },
    preferredAgeRange: { type: String, default: '' },
    preferredGender: { type: String, default: '' },
    homeType: { type: String, default: '' },
    housingStatus: { type: String, default: '' },
    hasGarden: { type: Boolean, default: false },
    hasChildren: { type: Boolean, default: false },
    hasOtherPets: { type: Boolean, default: false },
    householdSize: { type: Number, default: 1 },
    careAvailability: { type: String, default: '' },
    preferredLocation: { type: String, default: '' },
    
    // Privacy settings
    showEmail: { type: Boolean, default: false },
    showPhone: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
