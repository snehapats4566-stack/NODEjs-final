const User = require('../models/User');
const fs = require('fs');
const path = require('path');

// Helper: build a URL-safe relative path from a file path like "uploads/profile-images/abc.jpg"
const toRelativeUrl = (filePath) => {
  // Normalize slashes and strip any leading "./" or ".\"
  return filePath.replace(/\\/g, '/').replace(/^\.\//, '');
};

// @desc    Get current user profile
// @route   GET /api/profile
// @access  Private
const getMyProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// @desc    Update current user profile
// @route   PUT /api/profile
// @access  Private
const updateMyProfile = async (req, res, next) => {
  try {
    // Destructure out fields that must NOT be set through this endpoint
    const { email, role, password, profilePhoto, gallery, ...profileFields } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $set: profileFields },
      { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, data: updatedUser });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload / replace profile photo
// @route   POST /api/profile/photo
// @access  Private
const uploadProfilePhoto = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload an image file (jpg, png, webp).' });
    }

    const user = await User.findById(req.user.id);

    // Delete old profile photo from disk if it exists
    if (user.profilePhoto) {
      const oldPath = path.join(process.cwd(), user.profilePhoto);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    // Store the relative path e.g. "uploads/profile-images/profile-1234.jpg"
    user.profilePhoto = toRelativeUrl(req.file.path);
    await user.save();

    res.status(200).json({
      success: true,
      data: { profilePhoto: user.profilePhoto },
      message: 'Profile photo updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete profile photo
// @route   DELETE /api/profile/photo
// @access  Private
const deleteProfilePhoto = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (user.profilePhoto) {
      const oldPath = path.join(process.cwd(), user.profilePhoto);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
      user.profilePhoto = null;
      await user.save();
    }

    res.status(200).json({ success: true, message: 'Profile photo deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload gallery photos
// @route   POST /api/profile/gallery
// @access  Private
const uploadGalleryPhotos = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'Please upload at least one image' });
    }

    const user = await User.findById(req.user.id);

    const newPhotos = req.files.map(file => toRelativeUrl(file.path));

    // Limit gallery to max 10 photos
    if (user.gallery.length + newPhotos.length > 10) {
      return res.status(400).json({ success: false, message: 'Gallery cannot exceed 10 photos' });
    }

    user.gallery = [...user.gallery, ...newPhotos];
    await user.save();

    res.status(200).json({ success: true, data: user.gallery, message: 'Gallery updated' });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete gallery photo
// @route   DELETE /api/profile/gallery/:photoId
// @access  Private
const deleteGalleryPhoto = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    const index = parseInt(req.params.photoId, 10);

    if (isNaN(index) || index < 0 || index >= user.gallery.length) {
      return res.status(400).json({ success: false, message: 'Invalid photo index' });
    }

    const photoPathToRemove = user.gallery[index];
    const absolutePath = path.join(process.cwd(), photoPathToRemove);
    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
    }

    user.gallery.splice(index, 1);
    await user.save();

    res.status(200).json({ success: true, data: user.gallery, message: 'Photo removed from gallery' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all public profiles
// @route   GET /api/users
// @access  Private
const getPublicProfiles = async (req, res, next) => {
  try {
    const users = await User.find({})
      .select('name profilePhoto city state country bio preferredSpecies gallery createdAt role')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single public profile
// @route   GET /api/users/:id
// @access  Private
const getPublicProfileById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    // Construct safe user object — never expose password, role secrets, etc.
    const publicData = {
      _id: user._id,
      name: user.name,
      profilePhoto: user.profilePhoto,
      gallery: user.gallery,
      bio: user.bio,
      city: user.city,
      state: user.state,
      country: user.country,
      occupation: user.occupation,
      education: user.education,
      languages: user.languages,
      interests: user.interests,
      adoptionReason: user.adoptionReason,
      previousPetExperience: user.previousPetExperience,
      preferredSpecies: user.preferredSpecies,
      preferredBreeds: user.preferredBreeds,
      preferredAgeRange: user.preferredAgeRange,
      preferredGender: user.preferredGender,
      homeType: user.homeType,
      housingStatus: user.housingStatus,
      hasGarden: user.hasGarden,
      hasChildren: user.hasChildren,
      hasOtherPets: user.hasOtherPets,
      householdSize: user.householdSize,
      careAvailability: user.careAvailability,
      preferredLocation: user.preferredLocation,
      createdAt: user.createdAt,
    };

    if (user.showEmail) publicData.email = user.email;
    if (user.showPhone) publicData.phone = user.phone;

    res.status(200).json({ success: true, data: publicData });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyProfile,
  updateMyProfile,
  uploadProfilePhoto,
  deleteProfilePhoto,
  uploadGalleryPhotos,
  deleteGalleryPhoto,
  getPublicProfiles,
  getPublicProfileById,
};
