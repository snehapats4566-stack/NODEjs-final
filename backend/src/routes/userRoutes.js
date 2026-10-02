const express = require('express');
const router = express.Router();
const upload = require('../config/multer');
const { protect } = require('../middleware/auth');
const {
  getMyProfile,
  updateMyProfile,
  uploadProfilePhoto,
  deleteProfilePhoto,
  uploadGalleryPhotos,
  deleteGalleryPhoto,
  getPublicProfiles,
  getPublicProfileById
} = require('../controllers/userController');

// All profile routes require authentication
router.use(protect);

// Current user profile routes
router.route('/profile')
  .get(getMyProfile)
  .put(updateMyProfile);

// Profile photo routes
router.route('/profile/photo')
  .post(upload.single('photo'), uploadProfilePhoto)
  .delete(deleteProfilePhoto);

// Gallery routes
router.route('/profile/gallery')
  .post(upload.array('photos', 5), uploadGalleryPhotos); // Max 5 at a time

router.route('/profile/gallery/:photoId')
  .delete(deleteGalleryPhoto);

// Public user directories
router.route('/users')
  .get(getPublicProfiles);

router.route('/users/:id')
  .get(getPublicProfileById);

module.exports = router;
